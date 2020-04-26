import type {StaticTag, InstanceTag, InnerTag} from "@webdoc/types";

// Parse the @scope [static, instance, inner] tag
export function parseScope(value: string, options: any): AccessTag {
  value = value.trim();

  if (value === "static" || value === "instance" || value === "inner") {
    options.scope = value;
  } else {
    parserLogger.warn(tag.TagParser,
      "@scope tag only accepts one of [static, instance, inner]");
    options.access = "public";
  }

  return {
    name: "scope",
    type: "ScopeTag",
  };
}

// Parse the no-description @static tag
export function parseStatic(value: string, options: any): StaticTag {
  if (value.trim() !== "") {
    parserLogger.warn(tag.TagParser, "@static tags do not contain any description");
  }

  options.scope = "static";

  return {
    name: "static",
    type: "StaticTag",
  };
}

// Parse the no-description @instance tag
export function parseInstance(value: string, options: any): InstanceTag {
  if (value.trim() !== "") {
    parserLogger.warn(tag.TagParser, "@instance tags do not contain any description");
  }

  options.scope = "instance";

  return {
    name: "instance",
    type: "InstanceTag",
  };
}

// Parse the no-description @inner tag
export function parseInner(value: string, options: any): InnerTag {
  if (value.trim() !== "") {
    parserLogger.warn(tag.TagParser, "@inner tags do not contain any description");
  }

  options.scope = "inner";

  return {
    name: "inner",
    type: "InnerTag",
  };
}
