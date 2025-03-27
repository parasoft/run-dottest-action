# Run Parasoft dotTEST

![Build](https://github.com/parasoft/run-dottest-analyzer/workflows/Build/badge.svg)
![Unit Tests](https://github.com/parasoft/run-dottest-analyzer/workflows/Unit%20Tests/badge.svg)
![CodeQL](https://github.com/parasoft/run-dottest-analyzer/workflows/CodeQL/badge.svg)

This action enables you to run code analysis with Parasoft dotTEST and review analysis results directly on GitHub.

Parasoft dotTEST is a testing tool that automates software quality practices for C# and VB.NET applications. It uses a comprehensive set of analysis techniques, including pattern-based static analysis, dataflow analysis, metrics, code coverage, and unit testing to help you verify code quality and ensure compliance with industry standards, such as CWE or OWASP.

- Request [a free trial](https://www.parasoft.com/products/parasoft-dottest/dottest-request-a-demo/) to receive access to Parasoft dotTEST's features and capabilities.
- See the [user guide](https://docs.parasoft.com/display/DOTTEST20231) for information about Parasoft dotTEST's capabilities and usage.

Please visit the [official Parasoft website](http://www.parasoft.com) for more information about Parasoft dotTEST and other Parasoft products.

## Quick start

To analyze your code with Parasoft dotTEST and review analysis results on GitHub, you need to customize your GitHub workflow to include:

- The action to run dotTEST.
- The action to upload the dotTEST analysis report in the SARIF format to GitHub.
- The action to upload the dotTEST analysis reports in other formats (XML, HTML, etc.) to GitHub as workflow artifacts.

### Prerequisites

This action requires Parasoft dotTEST with a valid Parasoft license.

We recommend that you run Parasoft dotTEST on a self-hosted rather than GitHub-hosted runner.

### Adding the dotTEST Action to a GitHub Workflow

Add the `Run Parasoft dotTEST` action to your workflow to launch code analysis with Parasoft dotTEST.

The following example shows a simple workflow made up of one job "Run code analysis with dotTEST". The example assumes that dotTEST is run on a self-hosted runner and the path to dottestcli.exe is available on PATH.

```yaml
# This is a basic workflow to help you get started with the Run Parasoft dotTEST action.

name: dotTEST Simple Workflow

# Specifies the name of the GitHub events that trigger the workflow.
on:
  # Triggers the workflow on push or pull request events but only for the main branch.
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

  # Allows you to run this workflow manually from the Actions tab.
  workflow_dispatch:

# A workflow run is made up of one or more jobs that can run sequentially or in parallel.
jobs:
  # Specifies the name of the job.
  Run code analysis with dotTEST:
    # Specifies required permissions for upload-sarif action
    permissions:
      # required for all workflows
      security-events: write
      # only required for workflows in private repositories
      actions: read
      contents: read
    
    # Specifies the type of runner that the job will run on.
    runs-on: self-hosted

    # Steps represent a sequence of tasks that will be executed as part of the job.
    steps:
      # Checks out your repository under $GITHUB_WORKSPACE, so that your job can access it.
      - uses: actions/checkout@v4

      # Runs code analysis with dotTEST.
      - name: Run Parasoft dotTEST
        # Specifies the action to run.
        uses: parasoft/run-dottest-action@2.0.1
        
        # You can reference a specific commit or version:
        # uses: parasoft/run-dottest-action@1bc4be095189f455793afdb10b47127e06ae25ff
        
```

### Uploading Analysis Results to GitHub

By default, the `Run Parasoft dotTEST` action generates analysis reports in the SARIF, XML, and HTML format (if you are using a dotTEST version earlier than 2021.1, see [Generating SARIF Reports with dotTEST 2020.2 or Earlier](#generating-sarif-reports-with-dottest-20202-or-earlier)).

When you upload the SARIF report to GitHub, the results will be presented as GitHub code scanning alerts. This allows you to review the results of code analysis with Parasoft dotTEST directly on GitHub as part of your project.
To upload the SARIF report to GitHub, modify your workflow by adding the `upload-sarif` action.

To upload reports in other formats, modify your workflow by adding the `upload-artifact` action.

**Important!** To automatically upload the reports, ensure that the path to the directory where they are stored is configured as the `${{ steps.[dottest_action_id].outputs.reportDir }}/*.*` variable. In the following example, the id of the dotTEST action is `dottest`.

#### Example

```yaml
# Runs Parasoft dotTEST and generates the reports.
- name: Run Parasoft dotTEST
  id: dottest
  uses: parasoft/run-dottest-action@2.0.1
  # ...

# Uploads analysis results in the SARIF format, so that they are displayed as GitHub code scanning alerts.
- name: Upload results (SARIF)
  uses: github/codeql-action/upload-sarif@v3
  if: always()
  with:
    sarif_file: ${{ steps.dottest.outputs.report }}

# Uploads an archive that includes all report files (.xml, .html, .sarif).
- name: Archive reports
  uses: actions/upload-artifact@v3
  if: always()
  with:
    name: DottestReports
    path: ${{ steps.dottest.outputs.reportDir }}/*.*
```

## Configuring Analysis with dotTEST

You can configure analysis with Parasoft dotTEST in one of the following ways:

- By customizing the `Run Parasoft dotTEST` action directly in your GitHub workflow. See [Action Parameters](#action-parameters) for a complete list of available parameters.
- By configuring options in Parasoft dotTEST tool. We recommend creating a `dottestcli.properties` file that includes all the configuration options and adding the file to dotTEST's working directory  - typically, the root directory of your repository. This allows dotTEST to automatically read all the configuration options from that file. See [Parasoft dotTEST User Guide](https://docs.parasoft.com/display/DOTTEST20231) for details.

### Examples

This section includes practical examples of how the dotTEST action can be customized directly in the YAML file of your workflow.

#### Configuring the Path to the dotTEST Installation Directory

If `dottestcli` executable is not on `PATH`, you can configure the path to the installation directory of Parasoft dotTEST by configuring the `installDir` parameter:

```yaml
- name: Run Parasoft dotTEST
  uses: parasoft/run-dottest-action@2.0.1
  with:
    installDir: 'c:\Program Files\Parasoft\dotTEST\2022.2'
```

#### Configuring a dotTEST Test Configuration

Code analysis with dotTEST is performed by using a test configuration - a set of static analysis rules that enforce best coding practices. Parasoft dotTEST ships with a wide range of [built-in test configurations](https://docs.parasoft.com/display/DOTTEST20231/Built-in+Test+Configurations).
To specify a test configuration directly in your workflow, add the `testConfig` parameter to the `Run Parasoft dotTEST` action and specify the URL of the test configuration you want to use:

```yaml
- name: Run Parasoft dotTEST
  uses: parasoft/run-dottest-action@2.0.1
  with:
    testConfig: 'builtin://Recommended Rules'
```

Alternatively, you can provide the workspace-relative path to the .properties file where your test configuration is defined:

```yaml
- name: Run Parasoft dotTEST
  uses: parasoft/run-dottest-action@2.0.1
  with:
    testConfig: '.\.dottest\MyTestConfig.properties'
```

#### Defining the Scope for Analysis

By default, the `Run Parasoft dotTEST` action analyzes all solutions in your repository. To modify the default scope for analysis, you can configure dotTEST with one of the available scope parameters to analyze selected solutions, projects, or source files.
In the following example, the scope of analysis is narrowed down to the solutions in the `src` directory.

```yaml
- name: Run Parasoft dotTEST
  uses: parasoft/run-dottest-action@2.0.1
  with:
    solution: '.\src\*.sln'
```

In addition, the `project` and `website` parameters allow you to specify the path to a project or a website directory when the solution is not provided. See [Action Parameters](#action-parameters) for details.

### Configuring Parameters with Multiple Values

Regular configuration of dotTEST allows you to specify certain parameters more than once to configure multiple values. However, in GitHub actions, one parameter can be specified only once per action. Instead of specifying the same parameter multiple times, add it once and provide a list of semicolon-separated values:

```yaml
- name: Run Parasoft dotTEST
  uses: parasoft/run-dottest-action@2.0.1
  with:
    solution: '.\src1\MySln1.sln;
      .\src2\MySln2.sln'
```

### Limiting the Scope of Analysis

dotTEST provides a way to analyze only the current differences affecting your code compared to a baseline. This feature saves time as only specific fragments of code are analyzed or specific tests are executed to make sure recent changes do not introduce any regressions to your code. Thanks to the limited scope the test results are available much sooner compared to the analysis of the entire project.

#### Limiting Static Analysis

If you want to limit the scope of analysis to only see the violations from changed files on the current working branch in comparison to a reference branch (the “origin/main” branch) configure the following:

1. Set the `fetch-depth:` parameter to 0 to fetch all history for all branches and tags.

    ```yaml
    - name: Checkout repository
      uses: actions/checkout@v4
      with: 
        fetch-depth: 0
    ```

    See the [Checkout action](https://github.com/marketplace/actions/checkout) description for details.

2. Configure source control settings. See [Connecting to Source Control](https://docs.parasoft.com/display/DOTTEST20231/Connecting+to+Source+Control) for details.
3. Configure the following settings for dotTEST to limit the scope of analysis to files that are different between the current working branch and the reference branch:

    ```yaml
    scope.scontrol.files.filter.mode=branch
    scope.scontrol.ref.branch=origin/main
    ```

    See the [scope.scontrol.files.filter.mode](https://docs.parasoft.com/display/DOTTEST20231/Scope+and+Authorship+Settings#ScopeandAuthorshipSettings-scope.files.time.filter.modescope.scontrol.files.filter.mode) parameter description for details.

#### Executing a Limited Scope of Tests with Test Impact Analysis

Test Impact Analysis (TIA) allows you to execute only the tests affected by code changes. It is supported starting with dotTEST 2022.2. See [Configuring the Test Impact Analysis](https://docs.parasoft.com/display/DOTTEST20231/Command+Line+Options#CommandLineOptions-TIA) for details. You need to customize the `Run Parasoft dotTEST` action to use this feature:

```yaml
- name: Run Parasoft dotTEST
  uses: parasoft/run-dottest-action@2.0.1
  with:
    testConfig: 'Run VSTest Tests'
    referenceReportFile: PATH_TO_REPORT_FILE_ON_AGENT
    referenceCoverageFile: PATH_TO_COVERAGE_FILE_ON_AGENT
```

Reference files passed as arguments should be generated by analysis performed on the full testing scope (without using TIA).

### Generating SARIF Reports with dotTEST 2020.2 or Earlier

Generating reports in the SARIF format is available in dotTEST since version 2021.1. If you are using an earlier dotTEST version, you need to customize the `Run Parasoft dotTEST` action to enable generating SARIF reports:

```yaml
- name: Run Parasoft dotTEST
  uses: parasoft/run-dottest-action@2.0.1
  with:
    sarifMode: 'legacy'
```

### Baselining Static Analysis Results in Pull Requests

In GitHub, when a pull request is created, static analysis results generated for the branch to be merged are compared with the results generated for the integration branch. As a result, only new violations are presented, allowing developers to focus on the relevant problems for their code changes.
For this baselining to succeed, make sure your static analysis workflow triggers in pull requests. For example:

```yaml
on:
  # Triggers the workflow on push or pull request events but only for the main branch.
  pull_request:
    branches: [ main ]
```

#### Defining the Branch Protection Rule

You can define a branch protection rule for your integration branch that will block pull requests due to new violations or errors. To configure this:

1. In the GitHub repository GUI, go to **Settings>Branches**.
2. Make sure your default integration branch is configured. If needed, select the appropriate branch in the **Default branch** section.
3. Define the branch protection rule. In the **Branch protection rule** section click **Add rule**. Enable the **Require status checks to pass before merging** option and specify which steps in the pipeline should block the merge. Type the status check name in the search field to select it (only the status checks run during the last week are listed).
   - You can specify that the merge will be blocked if any violations are found as a result of the analysis by selecting the appropriate GitHub Code Scanning tool. If the GitHub Code Scanning tool is not available, you need to run a pull request for the integration branch first.
   - You can specify that the merge will be blocked if any defined job is not completed because of errors in its configuration by selecting the job build name. If no jobs are available, you need to run a workflow from the integration branch first. For example, when you execute the default dotTEST pipeline, the 'Analyze project with dotTEST' job will be available and can be used as a status check.

If a pull request is blocked due to failed checks, the administrator can still manually perform the merge using the **Merge without waiting for requirements to be met** option.

## Action Parameters

The following inputs are available for this action:
| Input | Description |
| --- | --- |
| `testConfig` | Specifies the URL of the test configuration to be used for analysis. The default is `builtin://Recommended .NET Core Rules`.|
| `exclude` | Specifies the file system paths to files to exclude from analysis. Supports ANT-style wildcards.|
| `fail` | Fails the command with exit code 2 if any findings are reported.|
| `installDir` | Specifies the path to the dotTEST installation directory, which contains dottestcli.exe.|
| `include` | Specifies file system paths to files to include in analysis. Supports ANT-style wildcards. If not specified, all files are analyzed.|
| `nobuild` | Disables the build of the tested solutions or projects.|
| `project` | Specifies the path to project(s) to be analyzed when no solution is provided. Supports ANT-style wildcards. |
| `projectConfig` | Specifies the project configuration, for example `Debug`.|
| `out` | Specifies the path  to the location where console output is saved. |
| `property` | Specifies a single configuration setting in the `key=value` format|.
| `publish` | Publishes report to DTP. |
| `reference` | Specifies the path to additional assemblies required to resolve dependencies of the analyzed projects. Supports ANT-style wildcards.|
| `referenceCoverageFile` | Path to the baseline coverage.xml file for Test Impact Analysis. |
| `referenceReportFile` | Path to the baseline report.xml file for Test Impact Analysis. |
| `reportDir` | Specifies the path to the directory where the report will be created. The default is `${{ github.workspace }}/.dottest/report/${{ github.run_number }}`.| 
| `resource` | Specifies a solution-relative path to a project in a solution, a directory of files in a project, or a file.|
| `sarifMode` | Specifies the mode for GitHub report (SAFIF) generation. You can configure the `builtin` mode for dotTEST 2021.1 or newer (default) or the `legacy` mode for dotTEST 2020.2 or older.|
| `settings` | Specifies the path to a settings file.| 
| `showsettings` | List all settings that are currently used.|
| `targetPlatform` | Specifies the target platform of the solution configuration (for example, `Any CPU`) or project configuration (for example, `AnyCPU`).|
| `testTagFilter` | Specifies test to run that are tagged with specific issue tracking types/IDs.|
| `solution` | Specifies the path to the solution to be analyzed. Supports ANT-style wildcards. The default is '.\*.sln'. |
| `solutionConfig` | Specifies the solution configuration (for example, `Debug`).|
| `website` | Specifies the full path to the website directory to be analyzed when the solution is not provided.|
| `workingDir` | Specifies the path to the working directory. The default is `${{ github.workspace }}`.|
