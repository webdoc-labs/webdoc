# Contributing

This project has enormous potential. Please open an issue if you want to contribute.

# Setting up development

To set up development,
* Clone the repo
* Install "rush" via `npm install -g  @microsoft/rush`
* Run `rush install` in the repo

* Run `rush build`. This will internally run `npm run build` in all the packages and build the example docs

This should generate a few HTML files in "examples/docs". To show them in your browser,

* Install "live-server" via `npm install -g live-server`
* Run "live-server docs" (in the example folder)

This should automatically open your browser with something that looks like this: https://webdoc-labs.github.io/example-documentation/index.html
