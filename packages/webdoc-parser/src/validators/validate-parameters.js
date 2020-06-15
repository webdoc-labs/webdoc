// @flow

import type {Doc} from "@webdoc/types";
import type {SymbolSignature} from "../types/Symbol";

// Validate the parameters are structurally (not nominally) correct
function validateParameters(doc: $Shape<Doc>, meta: SymbolSignature): void {
  // Only validate if parameters are documented AND exist
  if (!meta.params || !doc.params) {
    return;
  }

  let lastParam = null;

  for (let i = 0, j = 0; i < doc.params.length; i++) {
    const param = doc.params[i];
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
    if (j >= meta.params.length) {
      throw new Error(`"${name}" is not a parameter & cannot` +
            ` come after the last parameter "${lastParam}"`);
    }

    ++j;
    lastParam = name;
  }
}

export default {
  name: "Validators.Parameters",
  validate: validateParameters,
};
