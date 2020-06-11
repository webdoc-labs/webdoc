// @flow

import type {
  AuthorTag,
  CopyrightTag,
  DefaultTag,
  DeprecatedTag,
  Doc,
  LicenseTag,
  NameTag,
  SeeTag,
  SinceTag,
  Tag,
  ThrowsTag,
  TodoTag,
  TypeTag,
} from "@webdoc/types";

import {parseTypedDescription} from "./helper";

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
// @see <URL | DOC_PATH>
// @since <WHEN>

export function parseAuthor(value: string, doc: $Shape<Doc>): $Shape<AuthorTag> {
  if (!doc.authors) {
    doc.authors = [];
  }

  doc.authors.push(value);

  return {
    value,
    type: "AuthorTag",
  };
}

export function parseCopyright(value: string, doc: $Shape<Doc>): $Shape<CopyrightTag> {
  doc.copyright = value;

  return {
    value,
    type: "CopyrightTag",
  };
}

export function parseDefault(value: string, doc: $Shape<Doc>): $Shape<DefaultTag> {
  doc.defaultValue = value;

  return {
    value,
    type: "DefaultTag",
  };
}

export function parseDeprecated(value: string, options: $Shape<Doc>): DeprecatedTag {
  options.deprecated = value || true;

  return {
    name: "deprecated",
    type: "DeprecatedTag",
    value: "",
  };
}

export function parseExample(value: string, options: $Shape<Doc>): Tag {
  if (!options.examples) {
    options.examples = [];
  }

  options.examples.push({caption: "", code: value});

  return {
    name: "example",
    type: "ExampleTag",
    value: "",
  };
}

export function parseLicense(value: string, doc: $Shape<Doc>): LicenseTag {
  doc.license = value;

  return {
    value,
    type: "LicenseTag",
  };
}

export function parseName(value: string, doc: $Shape<Doc>): NameTag {
  doc.name = value;

  return {
    alias: value,
    type: "NameTag",
  };
}

export function parseTodo(value: string, doc: $Shape<Doc>): TodoTag {
  if (!doc.todo) {
    doc.todo = [];
  }

  doc.todo.push(value);

  return {
    value,
    type: "TodoTag",
  };
}

export function parseThrows(value: string, doc: $Shape<Doc>): ThrowsTag {
  if (!doc.throws) {
    doc.throws = [];
  }

  doc.throws.push(value);

  return {
    value,
    type: "ThrowsTag",
  };
}

export function parseType(value: string, doc: $Shape<Doc>): TypeTag {
  const dataType = parseTypedDescription(value).dataType;

  doc.dataType = dataType;

  return {
    dataType,
    value,
    type: "TypeTag",
  };
}

export function parseSee(value: string, doc: $Shape<Doc>): SeeTag {
  if (!doc.see) {
    doc.see = [];
  }

  doc.see.push(value);

  return {
    value,
    type: "SeeTag",
  };
}

export function parseSince(value: string, doc: $Shape<Doc>): SinceTag {
  doc.since = value;

  return {
    value,
    type: "SinceTag",
  };
}
