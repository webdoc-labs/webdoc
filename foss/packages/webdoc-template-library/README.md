© 2020-2022 webdoc Labs

# @webdoc/template-library

This package is useful for webdoc template authors and largely brings the functionality of JSDoc's template
helpers.

## UML

https://drive.google.com/file/d/1Ah7UyQ0AqnedxLsvMYm8agy0rxKuicrU/view?usp=sharing

### Features

* .tmpl Template files: You can use `<?js ?>` delimiters in HTML code to control what data gets rendered into
the final HTML document. This allows you to "mix" HTML and JavaScript into one file. The `TemplateGenerator` class
parses and renders your template files.

* Link & DOM-ID generation: The `SymbolLinks` API allows you to generate unique .html files/links & DOM-IDs for each documented symbol.

### Example

See @webdoc/legacy-template, which is a direct port of JSDoc's default template.
