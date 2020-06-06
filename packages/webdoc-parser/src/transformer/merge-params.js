import type {Param} from "@webdoc/types";

// This file merges the data in meta-data parameters into the documented parameters. Here
// is where the dataType, optionality, variadicity of parameters is inferred.

export default function mergeParams(docParams: Param[], metaParams: Param[]): Param[] {
  // If either one doesn't exist, then skip merging
  if (!docParams || !metaParams) {
    return docParams || metaParams;
  }
  // Don't merge things wrong
  if (metaParams.flawed) {
    return docParams || metaParams;
  }

  // NOTE: docParams may be missing some params mapping to those in metaParams.
  // NOTE-2: This implementation assumes that the doc-params are valid against the meta-params as
  //          checked by {@validator parameters}.
  // Example used:
  // @param {*} opts
  // @param {*} opts.subopts
  // @param {*} opts.subsubopts

  // m is the index into metaParams
  for (let i = 0, m = 0; i < docParams.length && m < metaParams.length;) {
    const param = docParams[i];
    const name = param.identifier;
    const nameTokens = name.split(".");
    const paramDepth = nameTokens.length - 1;

    const metaParam = metaParams[m];
    const metaName = metaParam.identifier;
    const metaNameTokens = metaName ? metaName.split(".") : [];

    // Unnamed parameters are always top-level object-spread expressions (paramDepth = 0)
    // Example: functionName({ subopts: subsubopts: {} })
    const metaParamDepth = Math.max(metaNameTokens.length - 1, 0);

    if (metaParamDepth > paramDepth) {
      // Subparameter isn't documented, so try next one for match.
      ++m;
      continue;
    }

    // It means that the user documents a subparamter that doesn't exist explicity
    if (metaParamDepth < paramDepth) {
      ++i;
      continue;
    }

    // Merge metaParam into param

    param.identifier = param.identifier || metaParam.identifier;
    param.dataType = param.dataType || metaParam.dataType;

    if (typeof param.optional === "undefined") {
      param.optional = metaParam.optional;
    }
    if (typeof param.variadic === "undefined") {
      param.variadic = metaParam.variadic;
    }
    if (typeof param.default === "undefined") {
      param.default = metaParam.default;
    }

    // Next param & metaParam
    ++i;
    ++m;
  }

  return docParams;
}
