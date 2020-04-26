import {parserLogger, tag} from "../Logger";
import type {PublicTag, ProtectedTag, PrivateTag, VisiblityTag} from "@webdoc/types";

// Parse the @visiblity [public, private, protected] tag
export function parseVisibility(value: string, options: any): VisiblityTag {
  value = value.trim();

  if (value === "public" || value === "protected" || value === "private") {
    options.visiblity = value;
  } else {
    parserLogger.warn(tag.TagParser,
      "@visiblity tag only accepts one of [public, private, protected]");
    options.visiblity = "public";
  }

  return {
    name: "visibility",
    type: "VisibilityTag",
  };
}

// Parse the no-description @public tag
export function parsePublic(value: string, options: any): PublicTag {
  if (value.trim() !== "") {
    parserLogger.warn(tag.TagParser, "@public tags do not contain any description");
  }

  options.visiblity = "public";

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

  options.visiblity = "protected";

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

  options.visiblity = "private";

  return {
    name: "private",
    type: "PrivateTag",
  };
}
