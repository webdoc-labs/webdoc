# Contributing

webdoc Labs welcomes contributions on the terms of a standardized public software license such as [the Blue Oak Model License 1.0.0](https://blueoakcouncil.org/license/1.0.0), [the Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0.html), [the MIT license](https://spdx.org/licenses/MIT.html), or [the two-clause BSD license](https://spdx.org/licenses/BSD-2-Clause.html).

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
