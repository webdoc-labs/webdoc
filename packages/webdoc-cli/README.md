# @webdoc/cli

This is the CLI program for webdoc.

## Installation :package:

```bash
npm install --save-dev @webdoc/cli
```

## Usage :newspaper_roll:

### Command-line arguments

* `--site-root <path>`: If using absolute links in a template, this will set the basepath. The basepath should the directory in which the documentation is being stored relative to where the server is running. The site root is "/" by default - which means that you'll need to serve the documentation directory as top-level. Note that @webdoc/default-template uses absolute links.
* `-c <config-path>`: This sets the path of the configuration file webdoc uses.

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
4. Alls path that equal or are inside a path in `source.exclude` are filtered out.
