© 2020-2022 webdoc Labs

# @webdoc/model

This package is the API for editing and querying in-memory documentation tree models.  [@webdoc/types](/packages/webdoc-types) defines the node structure.

## Installation :package:

This package is usually a dependency of templates and other webdoc packages.

```bash
npm install @webdoc/model
```

## Usage :newspaper_roll:

```js
import * as model from '@webdoc/model';
```

### Constructing and editing documents

```js
const entity = model.createDoc(
  "DocumentedEntity",
  "ClassDoc",
  {
    "description": "This is a programmatically created document!",
  }
);

const entityNs = model.doc("Documentation.Entities", documentTree);

model.addChildDoc(entity, entityNs);
```

@webdoc/model exports helper functions for creating and searching documents and mounting them into document trees.

### Data types

```js
model.createFunctionType(
  [model.createSimpleKeywordType("Promise")], // params
  model.createSimpleKeywordType("boolean"),   // returns
);
```

@webdoc/model exports helper functions for creating and joining data types. The `DataType` type is defined in [@webdoc/types](/packages/webdoc-types).

### Querying

```js
// Gets all the methods named "generic" in DocumentedEntity. Each signature of the method has a separate document. The
// # operator excludes any static "generic"-named methods.
const genericSignatures = model.query("Documentation.Entities.DocumentedEntity#generic", documentTree);
```

@webdoc/model exports a query engine for its document path language.

### Runtime type-checking

```js
const isInstantiable = model.isClass(doc) || model.isInterface(doc);
```

@webdoc/model exports helper functions for checking the types of document passed.
