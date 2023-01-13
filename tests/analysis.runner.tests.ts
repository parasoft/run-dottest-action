import * as assert from 'assert';
import * as sinon from 'sinon';

import { AnalysisRunner } from '../src/AnalysisRunner';
import { messages } from '../src/Messages';
import * as fs from 'fs';
import * as cp from 'child_process';

// tslint:disable:only-arrow-functions

suite('vscode-common/runner', function() {


    const sandbox = sinon.createSandbox();

	teardown(function() {
        sandbox.restore();
	});

    test('Start run while working dir does not exist test', async function() {
        // Arrange
        const runner = new AnalysisRunner();

        const existsSyncFake = sandbox.fake(() => false).named('WRK_DIR_EMPTY');
        sandbox.replace(fs, "existsSync", existsSyncFake);
        
        // Act
        let error: string | Error | undefined | unknown;
        try {
            await runner.run(fakeCommandLine, fakeWorkingDir);
        }
        catch (e) {
            error = e;
        }

        // Assert
        assert.strictEqual(error, messages.wrk_dir_not_exist + 'FAKE_WORK_DIR');
    });

    test('Start run while command line is empty test', async function() {
        // Arrange
        const runner = new AnalysisRunner();

        const existsSyncFake = sandbox.fake(() => true).named('CMD_EMPTY');
        sandbox.replace(fs, 'existsSync', existsSyncFake);

        // Act
        let error: string | Error | undefined | unknown;
        try {
            await runner.run('', fakeWorkingDir);
        }
        catch (e) {
            error = e;
        }

        // Assert
        assert.strictEqual(error, messages.cmd_cannot_be_empty);
    });

    test('Start run for invalid CMD', async function() {
        // Arrange
        // const showFake = sandbox.fake();
        // const clearFake = sandbox.stub();
        // const appendLineFake = sandbox.stub();

        // Act
        const error = (await outputChannelParameterizingTest()) as any as cp.ExecException;

        // Assert
        assert.strictEqual(error.code, 'ENOENT');
    });

    async function outputChannelParameterizingTest(): Promise<string | Error | undefined | unknown> {
        const runner = new AnalysisRunner();

        const existsSyncFake = sandbox.fake(() => true);
        sandbox.replace(fs, 'existsSync', existsSyncFake);

        // Act
        let error: string | Error | undefined | unknown;
        try {
            await runner.run(fakeCommandLine, fakeWorkingDir);
        }
        catch (e) {
            error = e;
        }
        return error;
}
});

const fakeWorkingDir = 'FAKE_WORK_DIR';
const fakeCommandLine = 'FAKE_CMD';