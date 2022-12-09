import * as assert from 'assert';
import * as pt from 'path';

import { RunOptions } from "../src/RunOptions";
import { SarifMode } from '../src/SarifMode';
import * as runner from "../src/AnalysisRunner";

// tslint:disable:only-arrow-functions

suite('vscode-dottest/extension', function() {

	test('Test complex command line creation', async function() {
		const options: RunOptions = {
			config: 'builtin://BTICFG',
			fail: true,
			installDir: pt.normalize('F:/dottest'),
			out: 'F:/out/o.txt',
			report: 'F:/rep',
			sarifMode: SarifMode.Builtin,
			solution: 'F:/repos/sln1/solution.sln;F:/repos/sln2/solution2.sln',
			workingDir: 'F:/repos',
		} as any as RunOptions;

		const run = new runner.AnalysisRunner();
		const cmd = await run.createCommandLine(options);
		
		

		const expected = '"' + pt.normalize("F:/dottest/dottestcli.exe") + '" -config "builtin://BTICFG" -solution "F:/repos/sln1/solution.sln" -solution "F:/repos/sln2/solution2.sln" -property "report.format=sarif" -fail -report "F:/rep" -out "F:/out/o.txt" '
		assert.strictEqual(cmd, expected);
	});

	test('Test TIA command line creation', async function() {
		const options: RunOptions = {
			config: 'builtin://BTICFG',
			fail: true,
			installDir: pt.normalize('F:/dottest'),
			out: 'F:/out/o.txt',
			report: 'F:/rep',
			sarifMode: SarifMode.Builtin,
			solution: 'F:/repos/sln1/solution.sln;F:/repos/sln2/solution2.sln',
			workingDir: 'F:/repos',
			referenceReportFile: 'F:/baseline/report.xml',
			referenceCoverageFile: 'F:/baseline/coverage.xml',
		} as any as RunOptions;

		const run = new runner.AnalysisRunner();
		const cmd = await run.createCommandLine(options);
		
		

		const expected = '"' + pt.normalize("F:/dottest/dottestcli.exe") + '" -config "builtin://BTICFG" -solution "F:/repos/sln1/solution.sln" -solution "F:/repos/sln2/solution2.sln" -property "report.format=sarif" -fail -report "F:/rep" -out "F:/out/o.txt" -referenceReportFile "F:/baseline/report.xml" -referenceCoverageFile "F:/baseline/coverage.xml" '
		assert.strictEqual(cmd, expected);
	});

	test('Test complex project schema creation', async function() {
		const options: RunOptions = {
			config: 'builtin://BTICFG',
			fail: true,
			installDir: pt.normalize('F:/dottest'),
			out: 'F:\\out\\o.txt',
			report: 'F:\\rep',
			sarifMode: SarifMode.Builtin,
			project: 'F:\\repos\\sln1\\prj1.csproj;F:\\repos\\sln2\\prj2.vbproj',
			workingDir: 'F:\\repos',
			exclude: 'F:\\repos\\**\\*test*',
			include: 'F:\\repos\\**\\*.cs',
			nobuild: true,
			projectConfig: 'Debug',
			property: 'prop=val',
			publish: true,
			reference: 'F:\\refs\\CoreReference.dll',
			resource: '/prj2/Commons',
			settings: 'F:\\repos\\sln1\\settings\\default.properties',
			showsettings: true,
			targetPlatform: 'AnyCPU'
		} as any as RunOptions;

		const run = new runner.AnalysisRunner();
		const cmd = await run.createCommandLine(options);
		
		const expected = '"' + pt.normalize("F:/dottest/dottestcli.exe") + '" -config "builtin://BTICFG" -project "F:\\repos\\sln1\\prj1.csproj" -project "F:\\repos\\sln2\\prj2.vbproj" -resource "/prj2/Commons" -include "F:\\repos\\**\\*.cs" -exclude "F:\\repos\\**\\*test*" -projectConfig "Debug" -targetPlatform "AnyCPU" -property "report.format=sarif" -settings "F:\\repos\\sln1\\settings\\default.properties" -property "prop=val" -nobuild -fail -publish -showsettings -report "F:\\rep" -out "F:\\out\\o.txt" -reference "F:\\refs\\CoreReference.dll" ';
		assert.strictEqual(cmd, expected);
	});

	test('Generate command line for conflicting schemas for solution default value', async function() {
        const options: RunOptions = {
			workingDir: 'F:\\repos',
			solution: '.\\*.sln',
			installDir: pt.normalize('F:/dottest'),
			project: 'F:\\repos\\sln1\\prj1.csproj;F:\\repos\\sln2\\prj2.vbproj',
			sarifMode: SarifMode.Builtin
		} as any as RunOptions;

		const run = new runner.AnalysisRunner();
		const cmd = await run.createCommandLine(options);

		const expected = '"' + pt.normalize("F:/dottest/dottestcli.exe") + '" -project "F:\\repos\\sln1\\prj1.csproj" -project "F:\\repos\\sln2\\prj2.vbproj" -property "report.format=sarif" ';
		assert.strictEqual(cmd, expected);
    });

});