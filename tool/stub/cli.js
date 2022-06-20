#!/usr/bin/env node

if (process.argv[2] === "--publish") {
  void require("./lib/index.js").publishStub({packageDirectory: process.cwd()});
} else {
  console.warn("Usage: stub --publish");
}
