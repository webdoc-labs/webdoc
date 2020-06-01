// @flow

import type {TemplatePipelineElement} from "../TemplatePipelineElement";
import fs from "fs";

type FlushData = {
  outputFile: string;
}

/**
 * Writes the {@code input} into {@code pipelineData.outputFile}.
 *
 * @param {string} input
 * @param {FlushData} pipelineData
 * @return {string} if {@code halt} is set to true, then undefined; otherwise, the {@code input}
 */
export class FlushToFile implements TemplatePipelineElement<FlushData> {
  halt: boolean
  skipNullFile: boolean

  /**
   * @param {object} options
   * @param {boolean}[options.halt]
   * @param {boolean}[options.skipNullFile] - don't halt & don't throw error if not file is
   *    passed in {@code pipelineData}
   */
  constructor(options: { halt?: boolean, skipNullFile?: boolean } = {}) {
    this.halt = options.halt;
    this.skipNullFile = options.skipNullFile;
  }

  run(input: string, pipelineData: FlushData = {}): string {
    if (!pipelineData.outputFile) {
      if (this.skipNullFile) {
        return input;
      }

      throw new Error("No outputFile specified in pipeline-data");
    }

    fs.writeFile(pipelineData.outputFile, input, (err) => {
      if (err) throw err;
    });

    if (!this.halt) {
      return input;
    }
  }

  clone() {
    return new FlushToFile({
      halt: this.halt,
      skipNullFile: this.skipNullFile,
    });
  }
}
