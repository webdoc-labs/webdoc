<p align="center">
  <img src="https://i.ibb.co/QK3myzy/Group-4.png" alt="Logo-Frame" border="0" width="256">
</p>
<h1 align="center">webdoc</h1>

<p align="center">
  <a href="(https://lerna.js.org/)"><img src="https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg"></img></a>
  <a href="https://www.codetriage.com/webdoc-js/webdoc"><img src="https://www.codetriage.com/webdoc-js/webdoc/badges/users.svg" /></a>
</p>

<table align="center">
  <tr>
  <th align="center">webdoc</th>
  <th align="center">Example documentation</th>
  </tr>
  <tbody align="center">
    <tr>
      <td>
        <a href="https://dev.azure.com/webdoc-js/webdoc/_build/latest?definitionId=2&branchName=master">
          <img src="https://dev.azure.com/webdoc-js/webdoc/_apis/build/status/webdoc-js.webdoc?branchName=master"></img>
        </a>
      </td>
      <td>
        <a href="https://dev.azure.com/webdoc-js/webdoc/_build/latest?definitionId=3&branchName=master">
          <img src="https://dev.azure.com/webdoc-js/webdoc/_apis/build/status/webdoc-js.webdoc%20(1)?branchName=master"></img>
        </a>
      </td>
    </tr>
  </tbody>
</table>

This project is the next generation documentation generator for JavaScript-based languages. Right now, it is work-in-progress
and supports enough features to generate the PixiJS documentation.

You can checkout the documentation for `example/` [here](https://webdoc-js.github.io/example-documentation/index.html)! 

## Usage

```shell
npm install -g @webdoc/cli
```

To get started, create a `webdoc.conf.json` file in your project directory. 

```json
{
  "includePattern": "src/**/*.js",
  "plugins": [
  
  ],
  "opts": {
    "destination": "docs" 
  }
}
```

The only required field is `includePattern` which tells webdoc where the documented code is located at.

You can now run `webdoc` in your terminal and documentation will be generated.

## Packages

| Packages                    | npm                                                              ||
|-----------------------------|------------------------------------------------------------------|-|
| @webdoc/cli                 | ![npm](https://img.shields.io/npm/v/@webdoc/cli)                 | ![David (path)](https://img.shields.io/david/webdoc-js/webdoc?path=packages%2Fwebdoc-cli)                                              |
| @webdoc/model               | ![npm](https://img.shields.io/npm/v/@webdoc/model)               |![David (path)](https://img.shields.io/david/webdoc-js/webdoc?path=packages%2Fwebdoc-model)|
| @webdoc/types               | ![npm](https://img.shields.io/npm/v/@webdoc/types)               |![David (path)](https://img.shields.io/david/webdoc-js/webdoc?path=packages%2Fwebdoc-types)|
| @webdoc/parser              | ![npm](https://img.shields.io/npm/v/@webdoc/parser)              |![David (path)](https://img.shields.io/david/webdoc-js/webdoc?path=packages%2Fwebdoc-parser)|
| @webdoc/externalize         | ![npm](https://img.shields.io/npm/v/@webdoc/externalize)         |![David (path)](https://img.shields.io/david/webdoc-js/webdoc?path=packages%2Fwebdoc-externalize)|
| @webdoc/template-library    | ![npm](https://img.shields.io/npm/v/@webdoc/template-library)    |![David (path)](https://img.shields.io/david/webdoc-js/webdoc?path=packages%2Fwebdoc-template-library)|
| @webdoc/legacy-template     | ![npm](https://img.shields.io/npm/v/@webdoc/legacy-template)     |![David (path)](https://img.shields.io/david/webdoc-js/webdoc?path=packages%2Fwebdoc-legacy-template)|
| @webdoc/default-template    | Coming soon!                                                     | Coming soon! |

## Features

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
