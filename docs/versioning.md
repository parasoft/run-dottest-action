## How to handle versioning of this action?

General versioning schema is:
`vN.N`
where `N` is non-negative integer value.

Pre-release versions should be suffixed with `b` literal, e.g.:

`v1.2b`

## Using `latest` version used for user convenience and example scripts simplicity

We should remember that after each new release we should move `latest` to the newest released version.

Usage in scripts:

```yaml
- name: Run dotTEST Analyzer
  uses: parasoft/run-dottest-analyzer@latest
```
