// @flow

const fs = require("fs");
const hljs = require("highlight.js");
// $FlowFixMe
const {isMainThread, parentPort} = require("worker_threads");

function onMessage(data /*: { id: number, file: string } */) {
  const {id, file} = data;

  fs.readFile(file, "utf8", function onFileRead(err, raw) {
    if (err) {
      return parentPort.postMessage({
        id,
        file,
        error: true,
        result: null,
      });
    }

    const languageSubset = file.endsWith(".js") ? ["javascript"] : undefined;
    const result = hljs.highlightAuto(raw, languageSubset).value;

    parentPort.postMessage({
      id,
      file,
      error: false,
      result,
    });
  });
}

if (!isMainThread) {
  parentPort.on("message", onMessage);
}
