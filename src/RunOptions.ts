import { SarifMode } from "./SarifMode";

export interface RunOptions {
  
  /**
   * Path to working directory.
   */
  workingDir: string;
  /**
   * Path to folder containing dottestcli.exe. Will be looked up on PATH when not specified.
   */
  installDir: string;
  /**
   * Path to solution(s) to be analyzed. Specify multiple times to analyze many solutions. Supports ANT-style wildcards.
   */
  solution: string;
  /**
   * Path to project(s) to be analyzed when solution is not provided. Specify multiple times to analyze many projects. Supports ANT-style wildcards.
   */
  project: string;
  /**
   * Full path to web site directory to be analyzed when solution is not provided.
   */
  website: string;
  /**
   * An URL of test configuration to be used for analysis.
   */
  config: string;
  /**
   * Solution path of a resource(s).
   */
  resource: string;
  /**
   * File-system paths of files to include in the analysis. Supports ANT-style wildcards. If not specified, all files are analyzed.
   */
  include: string;
  /**
   * File-system paths of files to exclude from the analysis. Supports ANT-style wildcards.
   */
  exclude: string;
  /**
   * Path to baseline report file for Test Impact Analysis. 
   */
  referenceReportFile: string
  /**
   * Path to baseline coverage file for Test Impact Analysis. 
   */
   referenceCoverageFile: string
  /**
   * Path to reference of analyzed assemblies. Specify multiple times to provide many references. Supports ANT-style wildcards.
   */
   reference: string;
  /**
   * Path to report directory or main report file.
   */
  report: string;
  /**
   * Publishes report to DTP server.
   */
  publish: boolean;
  /**
   * Path to settings file.
   */
  settings: string;
  /**
   * Single configuration setting in format "key=value".
   */
  property: string;
  /**
   * Disables build of the tested solutions or projects.
   */
  nobuild: boolean;
  /**
   * Run tests that are tagged with specific issue tracking types/IDs.
   */
  testTagFilter: string;
  /**
   * Solution configuration, e.g. "Debug".
   */
  solutionConfig: string;
  /**
   * Project configuration, e.g. "Debug".
   */
  projectConfig: string;
  /**
   * Solution configuration target platform, e.g. "Any CPU", or project configuration target platform, e.g. "AnyCPU".
   */
  targetPlatform: string;
  /**
   * Path where console output is saved.
   */
  out: string;
  /**
   * Fails the command with exit code 2 if any findings are reported.
   */
  fail: boolean;
  /**
   * List all settings used.
   */
  showsettings: boolean;
  /**
   * Specify mode for GitHub report (sarif) generation. You can use:
      - "legacy" - for dotTEST 2020.2 or older (default)
      - "builtin" - for dotTEST 2021.1 or newer
   */
  sarifMode: SarifMode;
}