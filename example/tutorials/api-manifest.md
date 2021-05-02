## webdoc

### API Manifest (experimental)

* alpha
* since: webdoc 1.3.3

webdoc exports a JSON-formatted manifest of your project's API. By making this manifest publicly available,
you can allow other projects to link their documentation to your API. The format of this manifest is as follows:

```json
{
  /** Version of the manifest format (required) */
  "version": "1.0.0",
  
  /** API manifest metadata (required) */
  "metadata": {
    /** The URL linker that generated the URIs (optional) */
    "linker": "require('@webdoc/template-library').Linker",
      
    /** The site domain hosting the manifest (required) */
    "siteDomain": "https://webdoc-labs.github.io",
    
    /** The base URI of all links within the site (required) */
    "siteRoot": "/"
  },
  
  /** The document tree of the API */
  "root": {
    "id": "uuid-alakdur3kasldfjhayiseyk",
    "name": "",
    "type": "RootDoc",
    "path": "",
    "members": [
      {
        "id": "uuid-34908uiojlkfzmn,xdkl;",
        "name": "PIXI",
        "brief": "The PixiJS API!",
        "type": "NSDoc"
      }
    ]
  },
  
  /** Registry of metadata for additional metadata of each document */
  "registry": {
    /** This will link the PIXI namespace to https://webdoc-labs.github.io/example-documentation/PIXI.html! */
    "uuid-34908uiojlkfzmn,xdkl;": {
      "uri": "/PIXI.html"
    }
  }
};
```

### Exporting a manifest

The `opts.export` field sets the path of the exported manifest. You should export this into the same folder
as your documentation (so it is available publicly on your site!):

```json
{
  "opts": {
    "export": "./docs/awesome-lib.api.json"
  }
}
```

### Importing external projects into your documentation

If you maintain a multi-repository project, you'd want to be able to use the API manifests exported by webdoc
for dependencies. For example, if you were making a tutorial about a separately maintained webdoc plugin,
links to the webdoc API (i.e. `{\@ link }`) would not resolve unless you imported its manifest
(https://webdoc-labs.github.io/example-documentation/webdoc.api.json).

You can do so by adding manifest URLs to `opts.import` in your configuration:

```json
{
  "opts": {
    "import": [
      "https://webdoc-labs.github.io/example-documentation/webdoc.api.json"
    ]
  }
}
```

As an example, this documentation was generated with a local manifest for gl-matrix:

```json
{\@link glMatrix.equals} = {@link glMatrix.equals}!
```