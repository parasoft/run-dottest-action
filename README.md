# Run dotTEST Analyzer

![Build](https://github.com/parasoft/run-dottest-analyzer/workflows/Build/badge.svg)
![Unit Tests](https://github.com/parasoft/run-dottest-analyzer/workflows/Unit%20Tests/badge.svg)
![CodeQL](https://github.com/parasoft/run-dottest-analyzer/workflows/CodeQL/badge.svg)

This action enables you to run code analysis with Parasoft dotTEST and review analysis results directly on GitHub.

Parasoft dotTEST is a testing tool that automates software quality practices for C# and VB.NET applications. 
 - Request [a free trial](https://www.parasoft.com/products/parasoft-dottest/dottest-request-a-demo/) to receive access to Parasoft dotTEST's features and capabilities.
 - See the [user guide](https://docs.parasoft.com/display/DOTTEST20202) for information about Parasoft dotTEST's capabilities and usage.

Please visit the [official Parasoft website](http://www.parasoft.com) for more information about Parasoft dotTEST and other Parasoft products.

## Quick start

To analyze your code with Parasoft dotTEST and review analysis results on GitHub, you need to customize your GitHub workflow to include:
 - The action to run dotTEST analyzer.
 - The action to upload the dotTEST analysis report in the SARIF format to GitHub. The SARIF report is generated by default when the dotTEST action is run.

### Prerequisites
This action requires Parasoft dotTEST with a valid Parasoft license.

We recommend that you run Parasoft dotTEST on a self-hosted rather than GitHub-hosted runner.

### Adding the dotTEST Action to a GitHub Workflow
Adding the action to run dotTEST analyzer to your workflow allows you to launch code analysis with Parasoft dotTEST.

The following example shows a YAML file where a simple workflow made up of one job "Run dotTEST" is configured. The example assumes that dotTEST is run on a self-hosted runner and the path to dottestcli.exe is available on PATH.

```yaml
# This is a basic workflow to help you get started with the Run dotTEST Analyzer action.

name: dotTEST Simple Workflow

# Specifies the name of the GitHub events that trigger the workflow.
on:
  # Triggers the workflow on push or pull request events but only for the master branch.
  push:
    branches: [ master ]
  pull_request:
    branches: [ master ]

  # Allows you to run this workflow manually from the Actions tab.
  workflow_dispatch:

# A workflow run is made up of one or more jobs that can run sequentially or in parallel.
# This workflow contains a single job called "Run dotTEST".
jobs:
  # Specifies the name of the job.
  Run dotTEST:
    # Specifies the type of runner that the job will run on.
    runs-on: self-hosted

    # Steps represent a sequence of tasks that will be executed as part of the job.
    steps:
      # Checks out your repository under $GITHUB_WORKSPACE, so that your job can access it.
      - uses: actions/checkout@v2

      # The name for your step to display on GitHub.
      - name: Run dotTEST analyzer
        # Specifies the action to run as part of this step.
        uses: tobyash86/run-dottest-analyzer-proto@prda0.1.6a
        
        # When specifying the action, you can reference a specific commit or version:
        # uses: tobyash86/run-dottest-analyzer-proto@1bc4be095189f455793afdb10b47127e06ae25ff
        
```

### Uploading Results to GitHub
By default, the dotTEST action always generates a SARIF report. When you upload the report to GitHub, the results will be presented as GitHub code scanning alerts. This allows you to review the results of code analysis with Parasoft dotTEST directly on GitHub as part of your project.
To upload the SARIF report to GitHub, modify your workflow to add the `upload-sarif` action, which is part of the [github/codeql-action](https://github.com/github/codeql-action) repository).

**Important!** To automatically upload the results, ensure that the path to the SARIF file is configured as the `${{ steps.[dottest_action_id].outputs.report }}` variable. In the following example the id of the dotTEST action is `dottest`.

```yaml
# Run Parasoft dotTEST Analysis and generate the .sarif report.
- name: Run dotTEST analyzer
  id: dottest
  uses: parasoft/run-dottest-analyzer@latest
# ...

# Upload analysis results to GitHub.
- name: Upload results to GitHub
  uses: github/codeql-action/upload-sarif@v1
  with:
    sarif_file: ${{ steps.dottest.outputs.report }}
```

#### Adding Other Job Artifacts to a GitHub Workflow
You can upload other job artifacts, such as additional dotTEST reports, to GitHub and link them with your workflow by using the `upload artifact` action.

**Important!** To automatically upload job artifacts, ensure that the path to the directory where they are stored is configured as the `${{ steps.[dottest_action_id].outputs.reportDir }}/*.*` variable. In the following example the id of the dotTEST action is `dottest`.


```yaml
# Run Parasoft dotTEST Analysis and generate the .sarif report.
- name: Run dotTEST analyzer
  id: dottest
  uses: parasoft/run-dottest-analyzer@latest
  # ...

# Upload analysis results to GitHub.
- name: Upload results to GitHub
  uses: github/codeql-action/upload-sarif@v1
  with:
    sarif_file: ${{ steps.dottest.outputs.report }}

# Archive reports from analysis as job artifacts.
- name: Upload report artifacts
  uses: actions/upload-artifact@v2
  with:
    name: Report files
    path: ${{ steps.dottest.outputs.reportDir }}/*.*
```

## Configuring Analysis with dotTEST
You can configure analysis with Parasoft dotTEST to meet your organization's policies in one of the following ways:
 - By configuring options directly in Parasoft dotTEST tool. See [Parasoft dotTEST User Guide](https://docs.parasoft.com/display/DOTTEST20202) for details.
 - By customizing the dotTEST action directly in your workflow on GitHub with additional parameters. See [Optional Parameters](#optional-parameters) for a complete list of available parameters. 
 
### Examples
This section includes practical examples of how the dotTEST action can be customized directly in the YAML file of your workflow. 

Note that by default, the `workingDir` parameter points to workspace root, which allows you to use relative paths while specifying them in various [parameters](#optional-parameters-).
ANT-style wildcards are supported.

#### Configuring the Path to the dotTEST Installation Directory
If dottestcli.exe is not on PATH, you can configure the path to the installation directory of Parasoft dotTEST, which contains dottestcli.exe, by adding the `installDir` parameter do the pre-defined action.

```yaml
- name: Run dotTEST analyzer
  uses: tobyash86/run-dottest-analyzer-proto@prda0.1.6a
  with:
    installDir: 'c:\Program Files\Parasoft\dotTEST\2021.1'
```

#### Configuring a dotTEST Test Configuration
Code analysis with dotTEST is performed by using a test configuration - a set of static analysis rules that enforce best coding practices. Parasoft dotTEST ships with a wide range of [build-in test configurations](https://docs.parasoft.com/display/DOTTEST20202/Built-in+Test+Configurations), as well as allows you to [create your own!](https://docs.parasoft.com/display/ENGINES1031/.Creating+Custom+Test+Configurations+v2020.2).
To configure a test configuration directly in your workflow, add the `config` parameter to your dotTEST action and specify the URL of the test configuration you want to use:


```yaml
- name: Run dotTEST analyzer
  uses: tobyash86/run-dottest-analyzer-proto@prda0.1.6a
  with:
    config: 'builtin://OWASP Top 10-2017'
```

Alternatively, you can provide workspace-relative path to the .properties file where your test configuration is defined:

```yaml
- name: Run dotTEST analyzer
  uses: tobyash86/run-dottest-analyzer-proto@prda0.1.6a
  with:
    config: '.\.dottest\MyTestConfig.properties'
```

#### Defining the Scope for Analysis
You configure the `solution` parameter to provide the path to the solution you want to analyze. This parameter is particularly useful when your workflow has a complex structure and includes several solution files.

```yaml
- name: Run dotTEST analyzer
  uses: tobyash86/run-dottest-analyzer-proto@prda0.1.6a
  with:
    solution: '.\src\*.sln'
```

### Configuring Parameters with Multiple Values
Regular configuration of dotTEST allows you to specify certain parameters more than once to configure multiple values. However, in GitHub actions, one parameter can be specified only once per action. Instead of specifying the same parameter multiple times, add it once and provide a list of semicolon-separated values:

```yaml
- name: Run dotTEST analyzer
  uses: tobyash86/run-dottest-analyzer-proto@prda0.1.6a
  with:
    solution: '.\src1\MySln1.sln;
      .\src2\MySln2.sln'
```

## Optional Parameters

The following inputs are available for this action:
| Input | Description |
| --- | --- |
| `config` | Specifies the URL of the test configuration to be used for analysis. The default is `builtin://Recommended .NET Core Rules`.|
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
| `report` | Specifies the path to the directory where the report will be created. The default is `${{ github.workspace }}/.dottest/report/${{ github.run_number }}`.| 
| `resource` | Specifies a solution-relative path to a project in a solution, a directory of files in a project, or a file.|
| `sarifMode` | Specifies the mode for GitHub report (SAFIF) generation. You can configure the `legacy` mode for dotTEST 2020.2 or older (default) or the `builtin` mode for dotTEST 2021.1 or newer'.|
| `settings` | Specifies the path to a settings file.| 
| `showsettings` | List all settings that are currently used.|
| `targetPlatform` | Specifies the target platform of the solution configuration (for example, `Any CPU`) or project configuration (for example, `AnyCPU`).|
| `testTagFilter` | Specifies test to run that are tagged with specific issue tracking types/IDs.|
| `solution` | Specifies the path to the solution to be analyzed. Supports ANT-style wildcards. The default is '.\*.sln'. |
| `solutionConfig` | Specifies the solution configuration (for example, `Debug`).|
| `website` | Specifies the full path to the website directory to be analyzed when the solution is not provided.|
| `workingDir` | Specifies the path to the working directory. The default is `${{ github.workspace }}`.|

