// @flow

import {type LanguageConfig, type Symbol} from "@webdoc/language-library";
import {type PackageDoc, type SourceFile} from "@webdoc/types";
import {parserLogger, tag} from "../Logger";
import EventEmitter from "events";
// $FlowFixMe
import {Worker} from "worker_threads";
import os from "os";
import path from "path";

export type JobData = {
  jobId: number,
  jobLanguageIntegrationModule: string,
  jobFile: SourceFile,
  jobConfig: LanguageConfig,
};

export type JobResult = {
  jobId: number,
  jobResult?: Symbol,
  jobError?: any,
};

class IndexerWorker extends EventEmitter {
  onError: (ev: "error", ...args: any[]) => void;
  onMessage: (...args: any[]) => void;
  worker: Worker;

  constructor(worker: Worker) {
    super();

    this.onError = this.emit.bind(this, "error");
    this.onMessage = this.onMessageImpl.bind(this);

    this.worker = worker;
    this.worker.on("error", this.onError);
    this.worker.on("message", this.onMessage);
  }

  send(
    jobId: number,
    jobLanguageIntegrationModule: string,
    jobFile: SourceFile,
    jobConfig: LanguageConfig,
  ): number {
    this.worker.postMessage(({
      jobId,
      jobLanguageIntegrationModule,
      jobFile,
      jobConfig,
    }: JobData));

    return jobId;
  }

  onMessageImpl({jobId, jobResult, jobError}: JobResult) {
    this.emit(`response-${jobId}`, jobResult, jobError);
  }

  destroy() {
    this.worker.terminate();
  }
}

export class IndexerWorkerPool {
  workers: IndexerWorker[];
  ptr: number = 0;

  constructor(limit?: number) {
    const workerPoolSize = Math.min(os.cpus().length, limit || 4);
    const workers = new Array<Worker>(workerPoolSize);
    const workerPath = path.resolve(__dirname, "./worker.js");

    parserLogger.info(tag.Indexer, "Using " + workerPoolSize + " worker threads for indexing");

    for (let i = 0; i < workerPoolSize; i++) {
      workers[i] = new IndexerWorker(new Worker(workerPath));
    }

    this.workers = workers;
  }

  repair(symbol: Symbol, packages: { [id: string]: PackageDoc }): Symbol {
    const file = symbol.loc.file;
    const pkgId = file && file.package.id;

    if (file && pkgId && packages[pkgId]) {
      file.package = packages[pkgId];
    }
    for (const child of symbol.members) {
      this.repair(child, packages);
    }

    return symbol;
  }

  index(
    langIntegrationModule: string,
    file: SourceFile,
    config: LanguageConfig,
    packages: { [id: string]: PackageDoc },
  ): Promise<Symbol> {
    return new Promise<Symbol>((resolve, reject) => {
      const jobId = this.ptr++;
      const worker = this.workers[jobId % this.workers.length];

      worker.send(jobId, langIntegrationModule, file, config);
      worker.on(`response-${jobId}`, (jobResult: Symbol, jobError: any): void => {
        if (jobResult) {
          resolve(this.repair(jobResult, packages));
        } else {
          reject(jobError);
        }
      });
    });
  }

  destroy() {
    for (const worker of this.workers) {
      worker.destroy();
    }
    this.workers.length = 0;
  }
}
