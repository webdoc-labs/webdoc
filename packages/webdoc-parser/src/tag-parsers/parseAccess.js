import {parserLogger, tag} from "../Logger";
import type {PublicTag, ProtectedTag, PrivateTag, AccessTag} from "@webdoc/types";

// Parse the @access [public, private, protected] tag
export function parseAccess(value: string, options: any): AccessTag {
  value = value.trim();

  if (value === "public" || value === "protected" || value === "private") {
    options.access = value;
  } else {
    parserLogger.warn(tag.TagParser,
      "@access tag only accepts one of [public, private, protected]");
    options.access = "public";
  }

  return {
    name: "access",
    type: "AccessTag",
  };
}

// Parse the no-description @public tag
export function parsePublic(value: string, options: any): PublicTag {
  if (value.trim() !== "") {
    parserLogger.warn(tag.TagParser, "@public tags do not contain any description");
  }

  options.access = "public";

  return {
    name: "public",
    type: "PublicTag",
  };
}

// Parse the no-description @protected tag
export function parseProtected(value: string, options: any): ProtectedTag {
  if (value.trim() !== "") {
    parserLogger.warn(tag.TagParser, "@protected tags do not contain any description");
  }

  options.access = "protected";

  return {
    name: "protected",
    type: "ProtectedTag",
  };
}

// Parse the no-description @private tag
export function parsePrivate(value: string, options: any): PrivateTag {
  if (value.trim() !== "") {
    parserLogger.warn(tag.TagParser, "@private tags do not contain any description");
  }

  options.access = "private";

  return {
    name: "private",
    type: "PrivateTag",
  };
}
