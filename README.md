© 2020-2022 webdoc Labs

<p align="center">
  <img src="https://i.ibb.co/ZHP9PD8/Logo-Frame-5.png" alt="Logo-Frame" border="0" width="256">
</p>

<p align="center">
  <a href="https://www.codetriage.com/webdoc-labs/webdoc"><img src="https://www.codetriage.com/webdoc-js/webdoc/badges/users.svg" /></a>
</p>

[![CI](https://github.com/webdoc-labs/webdoc/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/webdoc-labs/webdoc/actions/workflows/ci.yml)
[![CodeQL](https://github.com/webdoc-labs/webdoc/actions/workflows/codeql.yml/badge.svg?branch=master)](https://github.com/webdoc-labs/webdoc/actions/workflows/codeql.yml)

webdoc is the next generation documentation generator for the family of web languages. It supports the JSDoc notation
and infers type data from TypeScript definitions.

## Usage :newspaper_roll:

```shell
npm install --save-dev @webdoc/cli
```

To get started, create a `webdoc.conf.json` file in your project directory.

```json
{
  "source": {
    "include": "src/",
    "excludePattern": "(node_modules|lib|test)"
  },
  "plugins": [
    "plugins/markdown"
  ],
  "opts": {
    "destination": "docs"
  },
  "template": {
    "repository": "<your_github_url>",
    "outputSourceFiles": false
  }
}
```

The only required field is `source.include` which tells webdoc where the source files are. [@webdoc/cli](core/webdoc-cli)'s README details more configuration options

You can now run `webdoc` in your terminal and documentation will be generated. Be sure to serve the documentation from the folder it is generated in. If you need to serve from an ancestor directory, provide the documentation path relative to the root using the `--site-root` option, e.g. `webdoc --site-root docs`.

## Features :tada:

* Support for JavaScript, Flow, and TypeScript. The modular structure of @webdoc/parser allows you to integrate it with other languages as well.

* High-performance document tree that enforces proper relationships between symbols.

* Importing external APIs to integrate your documentation

Coming soon:

* Documentation coverage analysis

* Powerful default template that:
  * integrates with JSFiddle & CodePen for live examples of your API
  * provides a neat and clean navigation for users
  * makes it easy to write tutorials
