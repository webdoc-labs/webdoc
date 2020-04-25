# @webdoc/legacy-template

This package is a direct port of JSDoc's default template to webdoc. The `publish` script has significant changes
due to the poor structure of the JSDoc project. Specifically, functions from `jsdoc/templateHelper.js` have been
imported into the package and refactored to be compatible with webdoc. The template and static files have not
changed.

## Usage

Install the webdoc CLI and this template:

```shell
npm install -D @webdoc/cli @webdoc/legacy-template
```

Create a `webdoc.conf.json` file in the root directory of your project:

```json
{
    "sourceFiles": {
        "includePattern": "./**/*.js"
    },
    "opts": {
        "template": "@webdoc/legacy-template"
    }
}
```

Run webdoc (this will automatically detect the configuration file; if not, use `-c <conf-file.json>` to pass it manually):

```shell
webdoc
```
