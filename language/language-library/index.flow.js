declare module "@webdoc/language-library" {
  import type {DataType, DocType, Param, Return, SourceFile} from "@webdoc/types";
  import type {Log} from "missionlog";
  import type {Node} from "@babel/types";

  declare export type SymbolSignature = {
    abstract?: boolean,
    access?: ?string,
    constant?: ?boolean,
    dataType?: ?DataType,
    defaultValue?: ?string,
    extends?: ?Array<string | Symbol>,
    implements?: ?Array<string | Symbol>,
    object?: ?string,
    params?: ?Array<$Shape<Param>>,
    readonly?: boolean,
    returns?: ?Array<$Shape<Return>>,
    scope?: ?string,
    value?: ?string,
    type?: ?DocType,
    typeParameters?: ?Array<string>,
    undocumented?: boolean,
    undocumentedAnchored?: boolean, // Prevent pruning of symbol if parent is retained
  };

  declare export type SymbolLocation = {
    start: { line: number, column: number },
    end: { line: number, column: number },
    fileName?: string,
    file?: SourceFile
  };

  declare export type Symbol = {
    node?: ?Node,
    simpleName: string,
    canonicalName: string,
    flags: number,
    path: string[],
    comment: string,
    parent?: ?Symbol,
    members: Symbol[],
    loc: SymbolLocation,
    meta: SymbolSignature,
    isRoot?: boolean,
    __INITOR__?: ?boolean,
    __INIT__?: ?boolean
  };

  // Language-integration definition - used for parsing code into a symbol-tree
  declare export type LanguageIntegration = {
    extensions: string[],
    module: string,
    parse(file: string, source: SourceFile, config: LanguageConfig): Symbol
  };

  // Config for symbol-parsing
  declare export type LanguageConfig = {
    // Whether to report symbols that don't have any documentation comments & don't have documented
    // children.
    //
    // This is set to true when unit-testing
    reportUndocumented: boolean
  };

  declare export var CANONICAL_DELIMITER: RegExp;
  declare export var IDENTIFIER: RegExp;
  declare export var PASS_THROUGH: number;
  declare export var OBLIGATE_LEAF: number;
  declare export var VIRTUAL: number;

  declare function isObligateLeaf(symbol: Symbol): boolean;
  declare function isPassThrough(symbol: Symbol): boolean;
  declare function isVirtual(symbol: Symbol): boolean;

  declare function findSymbol(canonicalName: string | string[],
                              rootSymbol: Symbol,
                              depth?: number): ?Symbol;
  declare function findAccessedSymbol(referredName: string | string[],
                                      refereeSymbol: Symbol): ?Symbol;
  declare function addChildSymbol(doc: Symbol, scope: Symbol): Symbol;
  declare function removeChildSymbol(doc: Symbol): ?Symbol;
  declare function printSourceLocation(symbol: Symbol): string;
  declare function areEqualLoc(doc1: Symbol, doc2: Symbol): boolean;

  declare export var log: Log;
  declare export var tag: $ObjMap<string, string>;
  declare export function initLogger(defaultLevel?: string): void;
}
