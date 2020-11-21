// @flow

import type {DocShape, Param} from "@webdoc/types";
import type {SymbolSignature} from "../types/Symbol";

// Validate the parameters are structurally (not nominally) correct
function validateParameters(doc: DocShape, meta: SymbolSignature): void {
  // Only validate if parameters are documented AND exist
  if (!meta.params || !doc.params) {
    return;
  }

  const metaParams = meta.params;
  const docParams = ((doc: any).params: Param[]);

  let lastParam = null;

  for (let i = 0, j = 0; i < docParams.length; i++) {
    const param = docParams[i];
    const name = param.identifier;

    if (!name) {
      throw new Error("Anonymous documented parameters are not supported");
    }

    const dotIndex = name.indexOf(".");

    if (dotIndex >= 0) {
      const firstId = name.slice(0, dotIndex);

      // The following order is illegal. options.title must come right after options.
      // @param {object} options
      // @param {string} string
      // @param {string} options.title
      if (firstId !== lastParam) {
        throw new Error(`Object property ${name} parameter must be placed` +
              `directly after object parameter ${firstId}`);
      }

      continue;
    }
    if (j >= metaParams.length) {
      throw new Error(`"${name}" is not a parameter & cannot` +
            ` come after the last parameter "${lastParam || ""}"`);
    }

    ++j;
    lastParam = name;
  }
}

export default {
  name: "Validators.Parameters",
  validate: validateParameters,
};
