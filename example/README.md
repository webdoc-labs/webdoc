© 2020-2022 webdoc Labs

# @webdoc/example

Example documented package.

## Maintenance status

This is a reference-only example and is excluded from Rush publishing. The
published `@webdoc/example` 1.0.0 package is not a supported runtime
dependency. For supported use, install `@webdoc/cli` in the project you want
to document, then copy only the configuration or source patterns needed from
this example.

This package contains all sorts of fun stuff while demonstrating what things webdoc can document.

## Usage

* `rush build` will build all the packages and build the example docs

P.S.
Use `rush build -t @webdoc/example` to specifically build example and its dependencies only.

Once built, the `./example-documentation` folder will hold the generated site. You should serve the
site from the package folder and go to the /example-documentation path in the browser.

```bash
# Open localhost:5000/example-documentation
npx serve .
```
