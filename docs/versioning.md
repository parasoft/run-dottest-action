## How to handle versioning of this action?

General versioning schema is:
`vYYYY.V.U`
where `YYYY` denotes year, `V` denotes version within that year, `U` denotes updates for specific verson.

Pre-release versions should be suffixed with `b` literal, e.g.:

`v2021.1.0b`

## Using `latest` version used for user convenience and example scripts simplicity

We should remember that after each new release we should move `latest` to the newest released version (do not do that for pre-releases).

Usage in scripts:

```yaml
- name: Run dotTEST Analyzer
  uses: parasoft/run-dottest-analyzer@latest
```
