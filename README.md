© 2020-2022 webdoc Labs

<p align="center">
  <img src="https://i.ibb.co/ZHP9PD8/Logo-Frame-5.png" alt="Logo-Frame" border="0" width="256">
</p>

<p align="center">
  <a href="https://www.codetriage.com/webdoc-labs/webdoc"><img src="https://www.codetriage.com/webdoc-js/webdoc/badges/users.svg" /></a>
</p>

<table align="center">
  <tr>
  <th align="center">webdoc</th>
  <th align="center">Example documentation</th>
  </tr>
  <tbody align="center">
    <tr>
      <td>
        <a href="https://dev.azure.com/webdoc-labs/webdoc/_build/latest?definitionId=2&branchName=master">
          <img src="https://dev.azure.com/webdoc-labs/webdoc/_apis/build/status/Build%2C%20unit-test%2C%20type-check?repoName=webdoc-labs%2Fwebdoc&branchName=master"></img>
        </a>
      </td>
      <td>
        <a href="https://dev.azure.com/webdoc-labs/webdoc/_build/latest?definitionId=3&branchName=master">
          <img src="https://dev.azure.com/webdoc-labs/webdoc/_apis/build/status/webdoc-example%20documentation%20generator?repoName=webdoc-labs%2Fwebdoc&branchName=master"></img>
        </a>
      </td>
    </tr>
  </tbody>
</table>

webdoc is the next generation documentation generator for the family of web languages. It supports the JSDoc notation
and infers type data from TypeScript definitions.

You can checkout the documentation for `example/` [here](https://webdoc-labs.github.io/example-documentation/index.html)!

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

The only required field is `source.include` which tells webdoc where the source files are. [@webdoc/cli](packages/webdoc-cli)'s README details more configuration options

You can now run `webdoc` in your terminal and documentation will be generated. Be sure to serve the documentation from the folder it is generated in. If you need to serve from an ancestor directory, provide the documentation path relative to the root using the `--site-root` option, e.g. `webdoc --site-root docs`.

## Packages :package:

| Packages                    | npm                                                              ||
|-----------------------------|------------------------------------------------------------------|-|
| [@webdoc/cli](packages/webdoc-cli)     | ![npm](https://img.shields.io/npm/v/@webdoc/cli)                 |![David (path)](https://img.shields.io/david/webdoc-labs/webdoc?path=packages%2Fwebdoc-cli)|
| [@webdoc/model](packages/webdoc-model) | ![npm](https://img.shields.io/npm/v/@webdoc/model)               |![David (path)](https://img.shields.io/david/webdoc-labs/webdoc?path=packages%2Fwebdoc-model)|
| [@webdoc/types](packages/webdoc-types) | ![npm](https://img.shields.io/npm/v/@webdoc/types)               |![David (path)](https://img.shields.io/david/webdoc-labs/webdoc?path=packages%2Fwebdoc-types)|
| [@webdoc/parser](packages/webdoc-parser)| ![npm](https://img.shields.io/npm/v/@webdoc/parser)              |![David (path)](https://img.shields.io/david/webdoc-labs/webdoc?path=packages%2Fwebdoc-parser)|
|[@webdoc/externalize](packages/webdoc-externalize)| ![npm](https://img.shields.io/npm/v/@webdoc/externalize)         |![David (path)](https://img.shields.io/david/webdoc-labs/webdoc?path=packages%2Fwebdoc-externalize)|
|[@webdoc/template-library](packages/webdoc-template-library)| ![npm](https://img.shields.io/npm/v/@webdoc/template-library)    |![David (path)](https://img.shields.io/david/webdoc-labs/webdoc?path=packages%2Fwebdoc-template-library)|
| [@webdoc/legacy-template](packages/webdoc-legacy-template)     | ![npm](https://img.shields.io/npm/v/@webdoc/legacy-template)     |![David (path)](https://img.shields.io/david/webdoc-labs/webdoc?path=packages%2Fwebdoc-legacy-template)|
| [@webdoc/default-template](packages/webdoc-default-template)    | ![npm](https://img.shields.io/npm/v/@webdoc/default-template)    |![David (path)](https://img.shields.io/david/webdoc-labs/webdoc?path=packages%2Fwebdoc-default-template)|

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

## Development Roadmap

* This Trello board has all the future plans for this project: https://trello.com/b/aXh3G8En

## Contribute

Glad you asked! Open an issue and I'll get you something to work on! webdoc has an amazing potential to disrupt the stagnated documentation process!
