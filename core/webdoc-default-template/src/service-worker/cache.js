// @flow

import {webdocDB} from "../protocol";

export async function fetchVersioned(request: Request | string): Promise<Response> {
  const url = typeof request === "string" ? request : request.url;
  const response = await fetch(request);
  const db = await webdocDB.open();
  const origin = new URL(url).origin;
  const settings = await db.settings.findByOrigin(origin);
  const headers = {
    ...Object.fromEntries([...response.headers.entries()]),
    "x-manifest-hash": settings.manifestHash || "Not Available",
  };

  try {
    return new Response(response.body, {
      status: response.status || 200,
      statusText: response.statusText,
      headers,
    });
  } catch {
    return response;
  }
}
