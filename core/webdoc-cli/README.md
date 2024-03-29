© 2020-2022 webdoc Labs

# @webdoc/cli

The CLI for [webdoc](https://github.com/webdoc-labs/webdoc/).

## Installation :package:

This package shouldn't be a production dependency for most end-users.

```bash
npm install --save-dev @webdoc/cli
```

## Usage :newspaper_roll:

### Command-line arguments

* `--site-domain <path>`: (optional) The domain of the website where you'll publish the documentation is used to
generate the `sitemap.xml`. This is useful if you want to integrate with [Algolia and use its crawler](https://www.algolia.com/products/crawler/). You must include the protocol for this to work currently, e.g. `http://pixijs.webdoclabs.com`.
* `--site-root <path>`: If using absolute links in a template, this will set the basepath. The basepath should the directory in which the documentation is being stored relative to where the server is running. The site root is "/" by default - which means that you'll need to serve the documentation directory as top-level. Note that @webdoc/default-template uses absolute links.
* `-c <config-path>`: This sets the path of the configuration file webdoc uses.
* `-u <tutorials-directory>` -  (optional) This should point to a directory containing tutorials written in Markdown (".md") or HTML ".html, ".htm". JSON files can be used to configure the hierarchy and naming of tutorials (see the Tutorial Configuration section).
* `--no-workers` - Disables usage of worker threads to parallelize parsing.

### Configuration

The default path of the configuration file is `webdoc.conf.json` in the working directory. You can pass a custom path using the `-c <config-path>` argument.

#### source

The `source` defines which source files webdoc will process to generate the documentation.

```json
{
  "source": {
    "include": ["src/"],
    "includePattern": ["\\.ts$"],
    "excludePattern": ["(node_modules|lib|test|__test__)"],
    "exclude": ["src/__init.js"]
  }
}
```
* `source.include`: A string or array of strings with the paths containing the source files.
* `source.includePattern`: An optional regex or array of regexs that all source paths must conform to, if present.
* `source.excludePattern`: An optional regex or array of regexs used to filter out source path. No source file will match any of the exclude patterns.
* `source.exclude`: A string or array of strings containing specific paths to be excluded.

webdoc determines the list of source files as follows:
1. All paths in `source.include` and their subdirectories are added.
2. Paths matching atleast one `source.includePattern` are kept (skipped if no include pattern is provided).
3. Paths matching atleast one `source.excludePattern` are filtered out.
4. All paths that equal or are inside a path in `source.exclude` are filtered out.

#### docs

The `docs` object has options to configure the generation of the document tree.

```json
{
  "docs": {
    "sort": ["type", "scope", "access", "name"]
  }
}
```

* `docs.sort`: The characteristics of documented symbols which are used for sorting them, in order of decreasing priority. The valid values are:
  * `"type"`: Order by type as follows: namespaces, classes, enumerations, type definitions, properties, methods, events.
  * `"scope"`: Order by scope as follows: static, instance, inner.
  * `"access"`: Order by access as follows: public, protected, private.
  * `"name"`: Order alphabetically by the simple-name.

### opts

The `opts` object has additional CLI options.

```json
{
  "opts": {
    "destination": "docs",
    "export": "api.json",
    "template": "@webdoc/default-template"
  }
}
```

* `opts.destination`: (optional) The destination path for the generated documentation files.
* `opts.export`: (optional) The file where the API schema is exported.
* `opts.template`: (optional) The template package to use. This defaults to "@webdoc/default-template".

#### template

The `template` object is used by the site template.

```json
{
  "template": {
    "alias": {
      "header": "./overrides/header.tmpl"
    },
    "applicationName": "{ <i>webdoc</i> }",
    "appBar": {
      "items": {
        "about": {
          "name": "About Us",
          "uri": "https://example.com/about-us"
        }
      }
    },
    "routes": {
      "tutorials": "/faq"
    },
    "title": "webdoc",
    "meta": {
      "og:title": "webdoc",
      "og:description": "webdoc API documentation",
      "og:image": "https://camo.githubusercontent.com/1427d2fdabd8790c93ca05cbfb653e2c6a8ab5694e671a04aa3af3fcef313539/68747470733a2f2f692e6962622e636f2f5a4850395044382f4c6f676f2d4672616d652d352e706e67",
      "og:url": "{{url}}",
      "og:site_name": "webdoclabs.com"
    },
    "repository": "http://github.com/webdoc-labs/webdoc",
    "integrations": {
      "search": {
        "provider": "algolia",
        "apiKey": "kadlfj232983lkqwem",
        "indexName": "webdoc-example",
        "appId": "349o39841;akdsfu"
      },
      "analytics": {
        "provider": "google-analytics",
        "trackingID": "UA-XXX-00"
      }
    }
  }
}
```

* `template.alias`: Dictionary of template files you want to alias. Depending on the template you use, you can override specific
    template/components (like header/footer). @webdoc/default-template provides the following aliases:
  * "bottom-banner"
  * "explorer"
  * "footer"
  * "header"
  * "tutorial"
* `template.applicationName`: The name of the documented software. This is usually used to fill the app bar and tab title.
* `template.appBar.items`: This key-value object can be used to configure the items in the app bar. The key is an identifier
    and to override a built-in item, you'll need to use its specific key (if you're adding more items, the key's specific value
    won't matter). For example, if you want to show the tutorials as "Guides", you can set `{ "tutorials": { "name": "Guides" } }`. Each
    item defines a name and URI.
* `template.routes`: This can be used to override specific routes generated by the template. For example, you can move the
  `tutorials` to be outputted at "/faq" instead of "/tutorials", if desired.
* `template.sources`: (enabled by default) This will output the source code of the project as well and link symbols to their
    locations in the code.
* `template.title`: This is the title shown in the browser tabs (defaults to `template.applicationName`). You should use this
    if you have HTML in the application name.
* `template.meta`: (optional) This can be used to define the `<meta>` key-value tags. The `{{url}}` variable can be used
  to put in the site URL for each page (you have to provide the `siteDomain` and `siteRoot`).
* `template.repository`: (optional) This can be used to link documents to their location in the source code. The only supported repository is GitHub.
* `template.integrations`: (optional) Integrations with 3rd party solutions in your template. This object is dependent on which template you're using. For @webdoc/default-template, the following integrations are available:
  * `search`: This is used as the backend for the global site search. You'll need to create an Algolia account yourself and provide
    the `apiKey`, `appId`, `indexName`. (The only supported provider is "algolia" right now)
  * `analytics`: Analytics integration. The provider can be "google-analytics" or "plausible". For Google Analytics, you'll need to provide the
    tracking-ID "trackingID". For Plausible, you'll need to provide the naked domain "nakedDomain", e.g. webdoclabs.com
* `template.variant` - If the template supports different modes or variants for the generated site,
    it should use this field. @webdoc/default-template supports "normal", "plain" (no CSS, JS).
### Tutorial configuration

Tutorials can be structured in a hierarchy using JSON files in the tutorials directory. If you have multiple JSON configuration, they
are deep-merged before being processed.

#### Per-tutorial configuration

Tutorials are referenced using their file name - so make sure all file names in the tutorial directory are unique. To configure a specific
tutorial file, any configuration should reference it by the file name (excluding the extension). For example, to configure "hello-world.md":

```json
{
  "hello-world": {
    "title": "Hello world! by webdoc"
  }
}
```

* `title` - This is what the navigation sidebar will list the tutorial as.

#### Defining a hierarchy

You can also define children in tutorial configurators inline:

```json
{
  "hello-world": {
    "title": "Hello world! by webdoc",
    "children": {
      "chapter-1": {
        "title": "Chapter 1"
      },
      "chapter-2": {
        "title": "Chapter 2"
      }
    }
  },
  "next-steps": {
    "title": "Next-steps"
  }
}
```

In this configuration, "Chapter 1" and "Chapter 2" will be items under the "Hello world!" category.

#### Referencing other tutorials

Instead of defining tutorials inline in the `children` object, you can add them to the root and then reference
them by name in a `children` array.

```json
{
  "hello-world": {
    "title": "Hello world! by webdoc",
    "children": [
      "chapter-1",
      "chapter-2"
    ]
  },
  "chapter-1": {
    "title": "Chapter 1"
  },
  "chapter-2": {
    "title": "Chapter 2"
  },
  "next-steps": {
    "title": "Next-steps"
  }
}
```

The above configuration is equivalent to the one defining "Chapter 1" and "Chapter 2" children inline "Hello world!". This way,
you can also split the configuration into multiple files:

**main.json**

```json
{
  "hello-world": {
    "title": "Hello world! by webdoc",
    "children": [
      "chapter-1",
      "chapter-2"
    ]
  },
  "next-steps": {
    "title": "Next-steps"
  }
}
```

**chapters.json**

```json
{
  "chapter-1": {
    "title": "Chapter 1"
  },
  "chapter-2": {
    "title": "Chapter 2"
  }
}
```
