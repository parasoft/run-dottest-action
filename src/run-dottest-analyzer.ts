import * as core from "@actions/core";
import * as fs from "fs";
import * as path from "path";

import { RunOptions } from "./RunOptions";
import * as runner from "./AnalysisRunner";
import { SarifMode } from "./SarifMode";
import { messages } from "./Messages";

export async function run() {
  try {

    // #1 Fill options object

    const options: RunOptions = {
      config: core.getInput("testConfig", { required: false }),
      exclude: core.getInput("exclude", { required: false }),
      fail: 'true' == core.getInput("fail", { required: false })?.toLowerCase(),
      include: core.getInput("include", { required: false }),
      installDir: core.getInput("installDir", { required: false }),
      nobuild: 'true' == core.getInput("nobuild", { required: false })?.toLowerCase(),
      out: core.getInput("out", { required: false }),
      project: core.getInput("project", { required: false }),
      projectConfig: core.getInput("projectConfig", { required: false }),
      property: core.getInput("property", { required: false }),
      publish: 'true' == core.getInput("publish", { required: false })?.toLowerCase(),
      referenceReportFile: core.getInput("referenceReportFile", { required: false }),
      referenceCoverageFile: core.getInput("referenceCoverageFile", { required: false }),
      reference: core.getInput("reference", { required: false }),
      report: core.getInput("reportDir", { required: false }),
      resource: core.getInput("resource", { required: false }),
      settings: core.getInput("settings", { required: false }),
      showsettings: 'true' == core.getInput("showsettings", { required: false })?.toLowerCase(),
      solution: core.getInput("solution", { required: false }),
      solutionConfig: core.getInput("solutionConfig", { required: false }),
      targetPlatform: core.getInput("targetPlatform", { required: false }),
      testTagFilter: core.getInput("testTagFilter", { required: false }),
      website: core.getInput("website", { required: false }),
      workingDir: core.getInput("workingDir", { required: false }),
      sarifMode: SarifMode[capitalize(core.getInput("sarifMode", { required: false }))],
    };

    // #2 pass options to logic entry point

    const run = new runner.AnalysisRunner();
    const cmd = await run.createCommandLine(options);
    const outcome = await run.run(cmd, options.workingDir)

    // #3 set output
    
    if(fs.existsSync(options.report))
    {
      core.setOutput("reportDir", options.report);
    }
    else
    {
      core.setOutput("report", null);
    }

    const sarifReport = path.join(options.report, 'report.sarif');
    if(fs.existsSync(sarifReport))
    {
      core.setOutput("report", sarifReport);
    }
    else
    {
      core.setOutput("report", null);
    }

    if(outcome.exitCode != 0)
    {
      if(options.fail)
      {
        if(outcome.exitCode == 2)
        {
          core.setFailed(messages.failed_run_sa);
        }
        if(outcome.exitCode == 4)
        {
          core.setFailed(messages.failed_run_ut);
        }
      }
      core.setFailed(messages.failed_run_non_zero + outcome.exitCode);
    }
  } catch (error) {
    core.error(messages.run_failed);
    core.error(error);
    core.setFailed(error.message);
  }
}

function capitalize(s: string) : string 
{
  if (s == undefined || s.length == 0) return '';
  if (s.length == 1) return s.charAt(0).toUpperCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

if (require.main === module) {
  run();
}
