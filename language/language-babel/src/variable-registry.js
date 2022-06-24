// @flow

export const VARIABLE = 0xff;

export const PARAMETER = 0xffff;

// Parameters have variable-semantics but are not documentable separately. That's why
// they are given special treatment.
export type VariableType = typeof VARIABLE | typeof PARAMETER;

// A variable block records all the declared variable-symbols inside scope symbol.
export type VariableBlock = {
  [id: string]: VariableType,
};

// The stack of variable blocks composes a variable-registry. Each variable-block
// corresponds to a scope symbol.
export type VariableRegistry = VariableBlock[];

// Only one registry exists at one time (per thread).
export const variableRegistry: VariableRegistry = [];

// No. of blocks in the registry (need not equal variableRegistry.length)
let registryBlocks = 0;

// Declare a parameter in the current block
export function declareParameter(id: string): void {
  variableRegistry[registryBlocks - 1][id] = PARAMETER;
}

// Declare a variable in the parent block
export function declareVariable(id: string): void {
  variableRegistry[registryBlocks - 2][id] = VARIABLE;
}

// Create a new block scope
export function createBlock(): void {
  ++registryBlocks;

  if (variableRegistry.length < registryBlocks) {
    let i = variableRegistry.length;

    variableRegistry.length = registryBlocks;

    for (; i < registryBlocks; i++) {
      variableRegistry[i] = {};
    }
  } else {
    variableRegistry[registryBlocks - 1] = {};
  }
}

// Remove the last block scope
export function removeBlock(): void {
  --registryBlocks;
}

// Clear all blocks
export function clearRegistry(): void {
  registryBlocks = 0;
}

// If the given variable exists, find its variable-type
export function queryType(id: string): VariableType | null {
  for (let i = registryBlocks - 1; i >= 0; i--) {
    const block = variableRegistry[i];

    for (const vid in block) {
      if (vid === id) {
        return block[id];
      }
    }
  }

  return null;
}
