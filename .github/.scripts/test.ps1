#! /usr/bin/pwsh

$ErrorActionPreference = "Stop"

npm run compile

npm run test

if ($LASTEXITCODE -ne 0) {
   throw "test failed"
}
