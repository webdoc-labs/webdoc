# Contributing

This project has enormous potential. Please open an issue if you want to contribute.

# Setting up development

To set up development,
* Clone the repo
* Install "lerna" via "npm install -g lerna"
* Run "npm install" in the repo
* Run "lerna bootstrap"

Move to the "examples" directory, and then run:

* "npm run generate"

This should generate a few HTML files in "examples/docs". To show them in your browser,

* Install "live-server" via "npm install -g live-server"
* Run "live-server docs" (in the example folder)

This should automatically open your browser with something that looks like this: https://webdoc-js.github.io/example-documentation/index.html
