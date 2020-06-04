// @flow

import type {AssemblyModifier} from "../types/AssemblyModifier";
import modResolveAssignedMembers from "./mod-resolve-assigned-members";
import modResolveLinks from "./mod-resolve-links";
import {parserLogger, tag} from "../Logger";

const mods: AssemblyModifier[] = [];

registerAssemblyModifier("{@assembly-mod resolve-assigned-members}", modResolveAssignedMembers);
registerAssemblyModifier("{@assembly-mod resolve-links}", modResolveLinks);

export function registerAssemblyModifier(name: string, mod: (tree: Symbol[]) => void) {
  mods.push({
    name,
    mod,
  });
}

export default function modAssembly(tree: Symbol): void {
  parserLogger.info(tag.Assembly, "Assembling the symbol-metadata tree:");

  mods.forEach((modEntry) => {
    parserLogger.info(tag.Assembly, `\t${modEntry.name}`);

    modEntry.mod(tree);
  });
}
