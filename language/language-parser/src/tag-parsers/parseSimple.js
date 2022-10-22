// @flow

import type {
  AbstractTag,
  AuthorTag,
  BaseDoc,
  ClassDescTag,
  CopyrightTag,
  DataType,
  DefaultTag,
  DeprecatedTag,
  ExampleTag,
  LicenseTag,
  NameTag,
  ReadonlyTag,
  SeeTag,
  SinceTag,
  ThrowsTag,
  TodoTag,
  TypeTag,
} from "@webdoc/types";

import {parseTypedDescription} from "./helper";

// @abstract
// @author <AUTHOR>
// @copyright <COPYRIGHT>
// @default <DEFAULT_VALUE>
// @deprecated <MESSAGE>
// @example <
//   EXAMPLE
// >
// @license <LICENSE>
// @name <NAME>
// @todo <TODO>
// @throws <ERROR_TYPE>
// @type {TYPE}
// @readonly
// @readOnly
// @see <URL | DOC_PATH>
// @since <WHEN>

export function parseAbstract(value: string, doc: $Shape<BaseDoc>): $Shape<AbstractTag> {
  doc.abstract = true;

  return {value, type: "AbstractTag"};
}

export function parseAuthor(value: string, doc: $Shape<BaseDoc>): $Shape<AuthorTag> {
  if (!doc.authors) {
    doc.authors = [];
  }

  doc.authors.push(value);

  return {
    value,
    type: "AuthorTag",
  };
}

export function parseClassDesc(value: string, _doc: $Shape<BaseDoc>): $Shape<ClassDescTag> {
  return {
    value,
    type: "ClassDescTag",
  };
}

export function parseCopyright(value: string, doc: $Shape<BaseDoc>): $Shape<CopyrightTag> {
  doc.copyright = value;

  return {
    value,
    type: "CopyrightTag",
  };
}

export function parseDefault(value: string, doc: $Shape<BaseDoc>): $Shape<DefaultTag> {
  doc.defaultValue = value;

  return {
    value,
    type: "DefaultTag",
  };
}

export function parseDeprecated(value: string, options: $Shape<BaseDoc>): $Shape<DeprecatedTag> {
  options.deprecated = value || true;

  return {
    deprecated: value,
    type: "DeprecatedTag",
    value: "",
  };
}

export function parseExample(value: string, options: $Shape<BaseDoc>): $Shape<ExampleTag> {
  const lines = value.split("\n");
  let start = 0;
  let end = lines.length;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === "") start = i + 1;
    else break;
  }
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].trim() === "") end = i;
    else break;
  }

  const linesTrimmed: string[] = lines.slice(start, end);

  if (linesTrimmed.length > 0) {
    let snippetIndent = 100; // stay away from Infinity

    for (const line of linesTrimmed) {
      let lineIndent = 0;
      for (const ch of line) {
        if (ch === " ") lineIndent++;
        else break;
      }

      snippetIndent = Math.min(snippetIndent, lineIndent);
    }

    for (let i = 0; i < linesTrimmed.length; i++) {
      linesTrimmed[i] = linesTrimmed[i].slice(snippetIndent);
    }
  }

  if (!options.examples) {
    options.examples = [];
  }

  options.examples.push({
    caption: "",
    code: linesTrimmed.join("\n"),
  });

  return {
    name: "example",
    type: "ExampleTag",
    value: "",
  };
}

export function parseLicense(value: string, doc: $Shape<BaseDoc>): $Shape<LicenseTag> {
  doc.license = value;

  return {
    value,
    type: "LicenseTag",
  };
}

export function parseName(value: string, doc: $Shape<BaseDoc>): $Shape<NameTag> {
  doc.name = value;

  return {
    alias: value,
    type: "NameTag",
    value,
  };
}

export function parseTodo(value: string, doc: $Shape<BaseDoc>): $Shape<TodoTag> {
  if (!doc.todo) {
    doc.todo = [];
  }

  doc.todo.push(value);

  return {
    value,
    type: "TodoTag",
  };
}

export function parseThrows(value: string, doc: $Shape<BaseDoc>): $Shape<ThrowsTag> {
  if (!doc.throws) {
    doc.throws = [];
  }

  doc.throws.push(value);

  return {
    value,
    type: "ThrowsTag",
  };
}

export function parseType(value: string, doc: $Shape<{ dataType?: ?DataType }>): $Shape<TypeTag> {
  const dataType = parseTypedDescription(value).dataType;

  doc.dataType = dataType;

  return {
    dataType,
    value,
    type: "TypeTag",
  };
}

export function parseReadonly(value: string, doc: $Shape<BaseDoc>): $Shape<ReadonlyTag> {
  doc.readonly = true;

  return {
    value,
    type: "ReadonlyTag",
  };
}

export function parseSee(value: string, doc: $Shape<BaseDoc>): $Shape<SeeTag> {
  if (!doc.see) {
    doc.see = [];
  }

  doc.see.push(value);

  return {
    value,
    type: "SeeTag",
  };
}

export function parseSince(value: string, doc: $Shape<BaseDoc>): $Shape<SinceTag> {
  doc.since = value;

  return {
    value,
    type: "SinceTag",
  };
}
