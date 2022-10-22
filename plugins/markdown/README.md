© 2020-2022 webdoc Labs

# @webdoc/plugin-markdown

This plugin will replace markdown syntax in your document descriptions with HTML markup. You don't need to explicity install this plugin because @webdoc/cli has a dependency on it.

* It uses the [markdown-it](https://markdown-it.github.io) parser.
* It also adds code highlighting via [markdown-it-highlightjs](https://github.com/valeriangalliat/markdown-it-highlightjs). However, **your template must add a [hightlight.js](https://highlightjs.org) stylesheet for it to work**.

## Usage

In your `webdoc.conf.json` file, add `plugins/markdown` to your `plugins` entry:

```js
{
  plugins: ["plugins/markdown"]
}
```
