declare module "@webdoc/parser" {
  import type {Doc} from "@webdoc/types";

  /**
   * The parser will accept:
   * + a file's contents
   * + an array of file contents
   + + a map mapping file-names to file contents
   */
  declare type ParserInput = string | string[] | Map<string, string>;

  declare function parse(input: ParserInput): Doc;
}
