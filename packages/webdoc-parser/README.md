# @webdoc/parser

This package parses a file and outputs it documentation tree.

## Parser Pipeline

The parser works in a three-stage process:

1. **build-symbol-tree**: Each file is read & parsed using [Babel](https://babeljs.io) to create an intermediate tree of symbols. This essentially separates the code analysis and document parsing steps so that it is easy to integrate different languages.
 * A symbol is associated with a documentation comment **or** a [AST](https://en.wikipedia.org/wiki/Abstract_syntax_tree) node. It can be named or unnamed.
 * This stage can also create "virtual" symbols that don't exist and are removed before tree structure is finished. These are useful to detect symbols inside an AST node that are documented as a member of something else.
 * Each symbol has extra metadata that is used in later stages including:
   * the kind of symbol (class, method, property, etc.)
   * list of parameters and their type annotations
   * return type annotation
   * type parameters (in Flow and TypeScript)
   * enumeration members
   * extended classes, implemented interfaces
   * static, abstract keywords
   * public, protected, private access
 * A symbol tree is built for **each file** and in the future will be cached by webdoc.
   
2. **build-doc-tree**: A documentation tree is built by converting symbols into parsed **docs** (using **build-doc**) and adding them recursively. This stage uses the metadata from build-symbol-tree to **verify documentation correctness & fill in any missing blanks**.

3. **doc-tree-mods**: This stage makes post-parsing modifications to fix the hierarchy and then apply customizations. This includes:
  * Resolving properties to their objects
  * Resolving the @memberof tag
  * Finding extended classes, implemented interfaces, and mixed mixins and adding their references to the `extends`, `implements`, and `mixes` arrays in `Doc`.
  * Discovering inherited members
  * Pruning symbols that were undocumented but were added in build-symbol-tree just-in-case they had documented AST children
  
 ## Parser API

When the user uses this parser via @webdoc/cli, an instance of `Parser` will be hooked at `global.Webdoc.Parser`. Plugins can then access this object to use the parser API:

```js
global.Webdoc.Parser.installPlugin("plugin-example", {
  onLoad: () => {
    console.log(global.Webdoc.Parser);
  }
});
```

### Methods

```js
import {
  STAGE_BLANK,               // = 0
  STAGE_AST_LIKE,            // = 100
  STAGE_SYMBOLS_RESOLVED,    // = 200
  STAGE_SYMBOLS_DISCOVERED,  // = 300
  STAGE_FINISHED,            // = 400
} from "@webdoc/parser";

global.Webdoc.Parser.installDoctreeMod(name: string, stage: number, mod: (doc: Doc, tree: RootDoc) => void): void
```

This method can be used to add a post-parsing documentation tree mod. It must have a name and a "stage" that helps webdoc order all the mods.

**STAGE_BLANK**: The occurs before all in-built doc-tree mods.

**STAGE_AST_LIKE**: This occurs when all docs are resolved to their AST parents. For example,

```js
/** @const */
const object = {};

/** @member {string} */
object.member = "value";
```

Before STAGE_AST_LIKE, the doc "member" will not be a child of "object". This is because the in-buit mod "ASTMemberResolution" wasn't run until then (which detects that "member" is a property of "object").

**STAGE_SYMBOLS_RESOLVED**: This occurs after the @memberof tag is resolved for all docs. For example,

```js
/** An example API */
class API {

}

const _API = createAPIFrom(API);

/** @memberof API */
_API.member = "value";

export {API};
```

Before STAGE_SYMBOLS_RESOLVED, "member" would be a child of the undocumented "\_API" doc. This is because the in-built mod "MemberOfResolution" wasn't run until then (which would place it as a child of "API").

**STAGE_SYMBOLS_DISCOVERED**: This occurs after inherited and mixed symbols are detected && added to child classes.

**STAGE_FINISHED**: This occurs after all the relationships b/w differents doc are **finalized**. It is best place for doctree-mods that don't modify the hierarchy.

**Example**:

```js
import {traverse} from "@webdoc/model";

// You can also load this from the configuration file at global.env.conf
const replaceMap = {"__VERSION__": "5.0.0"};

function replace(rootDoc /*: RootDoc */) {
  traverse(rootDoc, (doc /*: Doc */) => {
    for (const keyword in replaceMap) {
      doc.description = doc.description.replace(new RegExp(keyword), replaceMap[keyword]);
    }
  });
}

global.Webdoc.Parser.installPlugin("replace-plugin", {
  onLoad() {
     global.WebdocParser.installDoctreeMod("Replace", STAGE_FINISHED, replace);
  }
});
```
