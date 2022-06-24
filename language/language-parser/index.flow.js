declare module "@webdoc/language-parser" {
  import type {LanguageIntegration} from "@webdoc/language-library";
  import type {RootDoc} from "@webdoc/types";

  declare function parse(
    target: string | SourceFile[],
    root?: RootDoc,
    options?: $Shape<{ mainThread: boolean }>,
  ): Promise<RootDoc>;

  declare function installLanguage(lang: LanguageIntegration): void;
}
