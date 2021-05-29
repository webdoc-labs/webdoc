// @flow

import * as Indexer from "./";
import type {JobData, JobResult} from "./IndexerWorkerPool";
// $FlowFixMe
import {isMainThread, parentPort} from "worker_threads";
import fs from "fs";

function onMessage(data: JobData) {
  function onFileRead(err: ?Error, contents: string) {
    if (err) {
      return parentPort.postMessage(({
        jobId: data.jobId,
        jobError: err,
      }: JobResult));
    }

    const lang = Indexer.lang(data.jobLanguageIntegrationModule);
    const symbolTree = lang.parse(
      contents,
      data.jobFile,
      data.jobConfig,
    );

    parentPort.postMessage(({
      jobId: data.jobId,
      jobResult: symbolTree,
    }: JobResult));
  }

  if (!data.jobFile.content) {
    fs.readFile(data.jobFile.path, "utf8", onFileRead);
  } else {
    onFileRead(null, data.jobFile.content);
  }
}

if (!isMainThread) {
  parentPort.on("message", onMessage);
}
