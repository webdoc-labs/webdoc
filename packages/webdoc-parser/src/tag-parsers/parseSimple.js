// @flow
import type {
  AuthorTag,
  DefaultTag,
  DeprecatedTag,
  LicenseTag,
  TodoTag,
  ThrowsTag,
  SeeTag,
  SinceTag,
  Doc,
  Tag,
} from "@webdoc/types";
import {parserLogger} from "../Logger";

// @author <AUTHOR>
// @copyright <COPYRIGHT>
// @default <DEFAULT_VALUE>
// @deprecated <MESSAGE>
// @example <
//   EXAMPLE
// >
// @license <LICENSE>
// @todo <TODO>
// @throws <ERROR_TYPE>
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
  if (value.trim() !== "") {
    parserLogger.warn("TagParser", "@deprecated does not accept any value");
  }

  options.deprecated = true;

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
