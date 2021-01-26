#! /usr/bin/pwsh

$ErrorActionPreference = "Stop"

npm run compile

if ($LASTEXITCODE -ne 0) {
    throw "build failed"
}
