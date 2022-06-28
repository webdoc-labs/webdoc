import * as fs from "fs";
import * as path from "path";
import * as yargs from "yargs";
import type {ConfigSchema} from "../config";

const conf: ConfigSchema = {
  $schema: "https://webdoc.nyc3.digitaloceanspaces.com/schemas/v1/webdoc.conf.schema.json",
  source: {
    include: ["./src"],
    exclude: ["node_modules"],
  },
  template: {
    applicationName: "Vanilla.js",
  },
};

export function init(args: yargs.Argv): Promise<void> {
  const workingDirectory = process.cwd();
  const confFile = path.join(workingDirectory, "webdoc.conf.json");

  fs.writeFileSync(confFile, JSON.stringify(conf, null, 2), "utf8");
}
