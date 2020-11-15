// @flow

import type {Doc, RootDoc} from "@webdoc/types";
import modDiscoverMembers from "./mod-discover-members";
import modPackageApi from "./mod-package-api";
import modPrune from "./mod-prune";// Next line is f'd up b/c the compiler ran on that file
import modResolveMemberof from "./mod-resolve-memberof"; // eslint-disable-line
import modResolveMembers from "./mod-resolve-members";
import modResolveRelated from "./mod-resolve-related";
import modSort from "./mod-sort-members";

type DoctreeModRecord = {
  name: string,
  stage: number,
  mod: (doc: Doc, tree: RootDoc) => void
}

type DoctreeModRegistry = Array<DoctreeModRecord>;

const installedMods: DoctreeModRegistry = [];

/**
 * The doctree-mod should run before all other mods.
 * @const {number}
 */
export const STAGE_BLANK = 0;

/**
 * The doctree-mod should run when the "members" are resolved to their actual AST parent. This
 * occurs after {@code STAGE_BLANK}.
 *
 * Example:
 * ```js
 * class DocumentedClass {
 *   constructor() {
 *     /** @member {string) *\/
 *     this.instanceProperty = "defaultValue";
 *     /** @member {string} *\/
 *     DocumentedClass.instanceCount = DocumentedClass.instanceCount
 *       ? DocumentedClass.instanceCount + 1 : 1;
 *   }
 * }
 * ```
 *
 * Before STAGE_AST_LIKE, the symbols `instanceProperty` and `instanceCount` will be a child of
 * `DocumentedClass#constructor`. However, in STAGE_ASK_LIKE, they will be resolved as children of
 * `DocumentedClass`.
 *
 * @const {number}
 */
export const STAGE_AST_LIKE = 100;

/**
 * The doctree-mod should run when symbols are placed in their documented parents. The
 * `@modResolveMemberof` tag is resolved in this stage. This occurs after {@code STAGE_AST_LIKE}.
 *
 * Example:
 * ```js
 * /**
 *  * @namespace NS
 *  *\/
 *
 * /**
 *  * @modResolveMemberof NS
 *  *\/
 * class API {}
 * ```
 *
 * Before {@code STAGE_SYMBOLS_RESOLVED}, the symbol {@code API} won't have a parent. However, in
 * {@code STAGE_SYMBOLS_RESOLVED}, the symbol {@code API} will be a child of {@code NS}.
 *
 * @const {number}
 */
export const STAGE_SYMBOLS_RESOLVED = 200;

// REMOVED
/**
 * This stage is where additional symbols are "discovered" or "inferred". This include symbols that
 * are inherited and mixed in. Also, the `overrides` flag is also resolved for class members.
 *
 * This occurs after {@code STAGE_SYMBOLS_RESOLVED}.
 *
 * @const {number}
 */
// export const STAGE_SYMBOLS_DISCOVERED = 300;

/**
 * This stage occurs after all symbol-hierarchy operations are done. This is the best place for
 * doctree-mods that simply alter the doc content without using the parent/members relations.
 *
 * This occurs after {@code STAGE_SYMBOLS_DISCOVERED}.
 *
 * @const {number}
 */
export const STAGE_FINISHED = 400;

/**
 * Registers the doctree-mod so that it will run when {@code parse} is invoked.
 *
 * NOTE: This is an internal API. If you're writing a plugin, use the
 * {@code Parser#installDoctreeMod} API instead.
 *
 * HINT: If your doctree-mod isn't affected by the relations b/w different symbols, then you should
 * pick {@code STAGE_FINISHED}.
 *
 * @param {string} name
 * @param {number} stage
 * @param {Function} mod
 */
export function registerDoctreeMod(
  name: string,
  stage: number,
  mod: (doc: Doc, tree: RootDoc) => void,
): void {
  const modEntry = {name, stage, mod};

  for (let i = 0; i < installedMods.length; i++) {
    if (stage < installedMods[i].stage) {
      installedMods.splice(i, 0, modEntry);
      return;
    }
  }

  installedMods.push(modEntry);
}

// These are the in-built doctree-mods.
registerDoctreeMod("ASTMemberResolution", STAGE_AST_LIKE, modResolveMembers);
registerDoctreeMod("MemberOfResolution", STAGE_SYMBOLS_RESOLVED, modResolveMemberof);
registerDoctreeMod("ExtendsImplementsMixesResolution", STAGE_SYMBOLS_RESOLVED, modResolveRelated);
registerDoctreeMod("Prune", STAGE_FINISHED, modPrune);
registerDoctreeMod("ClassMemberDiscovery", STAGE_FINISHED, modDiscoverMembers);
registerDoctreeMod("Sort", STAGE_FINISHED, modSort);
registerDoctreeMod("PackageApi", STAGE_FINISHED, modPackageApi);

export default function mod(doctree: RootDoc): void {
  for (let i = 0; i < installedMods.length; i++) {
    installedMods[i].mod(doctree, doctree);
  }
}
