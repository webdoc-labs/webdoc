// @flow

import type {$Request, $Response} from "express";
import {Buffer} from "buffer";
import compression from "compression";
import express from "express";
import helmet from "helmet";
import https from "https";

const VALID_EULAS = [
  "noncommercial",
  "commercial",
  "free-trial",
];
const FEED_ID = process.env.FEED_ID;
const PAT = process.env.PAT;
const PORT = Number(process.env.PORT ?? 8080);

if (!FEED_ID || !PAT) {
  throw new Error("Environment variables not set!");
}

const PAT_B64 = Buffer.from(`:${PAT}`).toString("base64");

const app = express();

app.use(compression());
app.use(helmet());

app.get("/@:scope/:name/versions/:version", async function(req: $Request, res: $Response) {
  const eula = req.header("X-EULA");

  if (!VALID_EULAS.includes(eula)) {
    return res
      .status(400)
      .send(`EULA must be one of ${VALID_EULAS.join(", ")}`);
  }

  const {scope, name, version} = req.params;
  const content = "https://pkgs.dev.azure.com/webdoc-labs/webdoc/_apis/packaging/feeds/" +
    `${FEED_ID}/npm/packages/@${scope}/${name}/versions/${version}/content`;

  https.request(content, {
    method: "GET",
    headers: {
      "Accept": "*/*",
      "Authorization": `Basic ${PAT_B64}`,
    },
  }, (proxy) => {
    if (proxy.statusCode !== 303 || !proxy.headers.location) {
      proxy.pipe(res);
      proxy.on("end", function() {
        res.status(404).end();
      });
      return;
    }

    const location = proxy.headers.location;

    https.request(location, {
      method: "GET",
      headers: {
        "Accept": "*/*",
      },
    }, (resource) => {
      res.status(resource.statusCode);
      resource.pipe(res);
      resource.on("end", function() {
        res.end();
      });
    }).end();
  }).end();
});

app.listen(PORT);
console.log(`Listening on https://localhost:${PORT}`);
