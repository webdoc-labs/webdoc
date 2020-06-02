// @flow

import type {AssemblyModifier} from "../types/AssemblyModifier";
import modResolveAssignedMembers from "./mod-resolve-assigned-members";

const mods: AssemblyModifier[] = [];

registerAssemblyModifier("{@assembly-mod resolve-assigned-members}", modResolveAssignedMembers);

export function registerAssemblyModifier(name: string, mod: (tree: Symbol[]) => void) {
  mods.push({
    mod,
  });
}
