declare module "@webdoc/parser" {
  import type {RootDoc} from "@webdoc/types";

  declare function parse(
    target: string | SourceFile[],
    root?: RootDoc,
    options?: $Shape<{ mainThread: boolean }>,
  ): Promise<RootDoc>;
}
