#!/usr/bin/env node

const dryRun = process.argv.includes("--dry-run");
const publish = process.argv.includes("--publish");

if (publish) {
  void require("./lib/index.js").publishStub({dryRun, packageDirectory: process.cwd()});
} else {
  console.warn("Usage: stub --publish");
}
