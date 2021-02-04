import * as cp from 'child_process';
import * as fs from 'fs';
import * as pt from 'path';
import * as core from "@actions/core";

import { performance } from 'perf_hooks';
import { RunOptions } from './RunOptions';
import { SarifMode } from './SarifMode';
import { messages } from './Messages'

export interface RunDetails
{
	status : "finished" | "cancelled",
	exitCode : number,
	durationMs : number,
}

export interface AnalysisRuntimeInfo
{
    readonly cliProcess : cp.ChildProcess;
    readonly commandLine : string;
    readonly workingDir : string;
    readonly startTime : number;
    readonly customData? : any;
    wasCancelled : boolean;
}

export interface RuntimeOptions
{
    customRunData? : any;
}

export class AnalysisRunner
{
    private QUOTE = '"';
    private SPACE = ' '; 
    private SEMICOLON = ';'; 

    async createCommandLine(options: RunOptions) : Promise<string> {

        let cmd = '';

        // # Basic data computation

        if(!options.workingDir) {
            return Promise.reject(messages.no_wrk_dir_msg);
        }

        if(options.installDir) {
            cmd += this.QUOTE + pt.join(options.installDir, 'dottestcli.exe') + this.QUOTE;
        }
        else {
            cmd += 'dottestcli.exe';
        }
        cmd += this.SPACE;

        if(options.config) {
            cmd += this.createQuotedArgument('-config', options.config);
        }

        // # Scope arguments

        if(options.solution) {
            cmd += this.createQuotedArgument('-solution', options.solution);
        }
        if(options.project) {
            cmd += this.createQuotedArgument('-project', options.project);
        }
        if(options.website) {
            cmd += this.createQuotedArgument('-website', options.website);
        }
        if(options.resource) {
            cmd += this.createQuotedArgument('-resource', options.resource);
        }
        if(options.include) {
            cmd += this.createQuotedArgument('-include', options.include);
        }
        if(options.exclude) {
            cmd += this.createQuotedArgument('-exclude', options.exclude);
        }
        if(options.testTagFilter) {
            cmd += this.createQuotedArgument('-testTagFilter', options.testTagFilter);
        }
        
        // # workspace settings

        if(options.solutionConfig) {
            cmd += this.createQuotedArgument('-solutionConfig', options.solutionConfig);
        }
        if(options.projectConfig) {
            cmd += this.createQuotedArgument('-projectConfig', options.projectConfig);
        }
        if(options.targetPlatform) {
            cmd += this.createQuotedArgument('-targetPlatform', options.targetPlatform);
        }

        // # handle sarif generation

        if(options.sarifMode != SarifMode.Builtin) {
            cmd += this.createQuotedArgument('-property', 'report.format=custom');
            cmd += this.createQuotedArgument('-property', 'report.custom.extension=sarif');
            cmd += this.createQuotedArgument('-property', 'report.custom.xsl.file=' + pt.join(__dirname, "sarif.xsl"));
        }
        else {
            cmd += this.createQuotedArgument('-property', 'report.format=sarif');
        }

        // # dottestcli settings

        if(options.settings) {
            cmd += this.createQuotedArgument('-settings', options.settings);
        }
        if(options.property) {
            cmd += this.createQuotedArgument('-property', options.property);
        }
        if(options.nobuild) {
            cmd += '-nobuild' + this.SPACE;
        }
        if(options.fail) {
            cmd += '-fail' + this.SPACE;
        }
        if(options.publish) {
            cmd += '-publish' + this.SPACE;
        }
        if(options.showsettings) {
            cmd += '-showsettings' + this.SPACE;
        }

        // # settings for controlling the output

        if(options.report) {
            cmd += this.createQuotedArgument('-report', options.report);
        }
        
        if(options.out) {
            cmd += this.createQuotedArgument('-out', options.out);
        }

        // # supplementary settings
        if(options.reference) {
            cmd += this.createQuotedArgument('-reference', options.reference);
        }

        return Promise.resolve(cmd);
    }

    private createQuotedArgument(cmdSwitch : string, value: string) : string {
        let values = [ value ];
        let cliargs = '';
        if(value && value.includes(this.SEMICOLON))
        {
            values = value.split(this.SEMICOLON);
        }

        for(const val of values)
        {
            const actualValue = val.trim();
            cliargs += cmdSwitch + this.SPACE + this.QUOTE + actualValue + this.QUOTE + this.SPACE;
        }

        return cliargs;
    }

    private runtimeInfo : AnalysisRuntimeInfo | undefined = undefined;

    async run(commandLine : string, workingDir : string, options? : RuntimeOptions) : Promise<RunDetails>
    {
        if (!fs.existsSync(workingDir)) {
            return Promise.reject(messages.wrk_dir_not_exist + workingDir);
        }
        commandLine = commandLine.trim();
        if (commandLine.length === 0) {
            return Promise.reject(messages.cmd_cannot_be_empty);
        }

        core.info(messages.wrk_dir_label + workingDir);
        core.info(messages.cmd_label + commandLine);

        const runPromise = new Promise<RunDetails>((resolve, reject) =>
        {
            const cliEnv = this.createEnvironment();
            const startTime = performance.now();
            const cliProcess = cp.spawn(`${commandLine}`, { cwd: workingDir, env: cliEnv, shell: true, windowsHide: true });
            this.runtimeInfo = {
                'cliProcess' : cliProcess,
                'commandLine' : commandLine,
                'workingDir' : workingDir,
                'startTime' : startTime,
                'customData' : options?.customRunData,
                'wasCancelled' : false,
            };
            cliProcess.stdout?.on('data', (data) => {
                core.info(`${data}`);
            });
            cliProcess.stderr?.on('data', (data) => { core.info(`${data}`); });
            cliProcess.on('close', (code) => {
                const result : RunDetails = {
                    durationMs : performance.now() - startTime,
                    status : this.runtimeInfo?.wasCancelled ? "cancelled" : "finished",
                    exitCode : code,
                };
                core.info("EXIT CODE: " + code.toString());
                resolve(result);
            });
            cliProcess.on("error", (err) => {
                reject(err);
            });
        });
        return runPromise;
    }

    getRuntimeInfo() : AnalysisRuntimeInfo | undefined
    {
        return this.runtimeInfo;
    }

    private createEnvironment() : NodeJS.ProcessEnv
    {
        const environment: NodeJS.ProcessEnv = {};
        let isEncodingVariableDefined = false;
        for (const varName in process.env) {
            if (Object.prototype.hasOwnProperty.call(process.env, varName)) {
                environment[varName] = process.env[varName];
                if (varName.toLowerCase() === 'parasoft_console_encoding') {
                    isEncodingVariableDefined = true;
                }
            }
        }
        if (!isEncodingVariableDefined) {
            environment['PARASOFT_CONSOLE_ENCODING'] = 'utf-8';
        }
        return environment;
    }
}