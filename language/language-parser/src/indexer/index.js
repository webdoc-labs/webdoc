// @flow

import type {LanguageConfig, LanguageIntegration} from "@webdoc/language-library";
import {parserLogger, tag} from "../Logger";
import {IndexerWorkerPool} from "./IndexerWorkerPool";
import {type SourceFile} from "@webdoc/types";
import {type Symbol} from "@webdoc/language-library";
import _ from "lodash";
import fs from "fs";
import os from "os";
import path from "path";

declare var globalThis: any;

// File-extension -> LanguageIntegration mapping
const languages: { [id: string]: LanguageIntegration } = {};

// Register a language-integration that will be used to generate a symbol-tree for files with its
// file-extensions.
export function register(lang: LanguageIntegration): void {
  for (const ext of lang.extensions) {
    if (languages[ext]) {
      parserLogger.warn("LanguageIntegration",
        `.${ext} file extension has already been registered`);
    }

    languages[ext] = lang;
  }
}

export async function run(
  files: SourceFile[],
  config: LanguageConfig,
  options?: $Shape<{
    mainThread: boolean,
  }> = {},
): Promise<Symbol[]> {
  const startTime = Date.now();
  const maxThreads = Math.min(os.cpus().length, 1 + Math.floor(files.length / 125));

  parserLogger.info(tag.Indexer, "Indexing " + files.length + " files");

  const symbolTrees: Array<Symbol> = new Array(files.length);

  if (maxThreads > 1 && !options.mainThread) {
    const packages = _.keyBy(
      files.map((file) => file.package),
      (pkg) => pkg.id,
    );
    const symbolIndexingOperations: Array<Promise<void>> = new Array(files.length);
    const workerPool = new IndexerWorkerPool(maxThreads);

    for (let i = 0; i < files.length; i++) {
      const fileName = files[i].path;
      const extension = fileName.substring(fileName.lastIndexOf(".") + 1, fileName.length);

      if (!(extension in languages)) {
        throw new Error(`.${extension} language is not registered with the Indexer!`);
      }

      const file = {
        ...files[i],
        path: path.resolve(globalThis.process.cwd(), files[i].path),
      };
      const lang = languages[extension].module;

      symbolIndexingOperations[i] = workerPool.index(lang, file, config, packages).then(
        (symbolTree: Symbol): void => {
          symbolTrees[i] = symbolTree;
        },
      );
    }

    await Promise.all(symbolIndexingOperations);
    workerPool.destroy();
  } else {
    for (let i = 0; i < files.length; i++) {
      const filePath = path.resolve(globalThis.process.cwd(), files[i].path);
      const fileContent = files[i].content || fs.readFileSync(filePath, "utf8");

      symbolTrees[i] = process(fileContent, files[i], config);
    }
  }

  const endTime = Date.now();

  parserLogger.info(tag.Indexer, "Indexing took " + (endTime - startTime) + "ms");

  return symbolTrees;
}

export function process(
  file: string,
  source: SourceFile,
  config: LanguageConfig,
): Symbol {
  const fileName = source.path;
  const lang = languages[fileName.substring(fileName.lastIndexOf(".") + 1, fileName.length)];

  if (!lang) {
    throw new Error(`.${lang} file language is not registered`);
  }

  return lang.parse(file, source, config);
}

export function lang(module: string): LanguageIntegration {
  module = module.replace("@webdoc/parser", "../../");

  // $FlowFixMe
  return ((require(module): any).default: LanguageIntegration);
}
