// @flow

// This file/directory providse a modular way to verify documented information is structurally
// correct.

import type {Doc} from "@webdoc/types";
import type {SymbolSignature} from "../types/Symbol";

import ValidatorParameters from "./validate-parameters";

// A validator verifies whether documented information is "correct" by
// comparing it with the metadata. If something is found to be incorrect, an error should
// be thrown.
//
// NOTE: The names of related symbols should not be validated. For example,
//
// /** @extends SomeOtherClass */
// class ClassName extends SuperClass {
// }
//
// should pass. This is because SuperClass "might be documented/aliased as SomeOtherClass"
//
// NOTE-2: For "soft"-errors, validators are allowed to correct documented information.
export type Validator = {
  name?: string,
  validate(doc: Doc, meta: SymbolSignature): void,
}

// The registered validators
const validators = [];

// Register a validator. Using a name is recommended!
export function registerValidator(validator: Validator): void {
  validators.push(validator);
}

registerValidator(ValidatorParameters);

// Runs all the registered validators
export default function validate(doc: $Shape<Doc>, meta: SymbolSignature): void {
  validators.forEach((validator) => validator.validate(doc, meta));
}
