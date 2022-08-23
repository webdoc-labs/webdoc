// @flow

import {
  EPHEMERAL_APP_SHELL_FILES,
  EPHEMERAL_CACHE_KEY,
  MAIN_CACHE_KEY,
  VERSIONED_APP_SHELL_FILES,
} from "./const";
import type {SwInitMessage, SwMessage, SwSettingsTriggerMessage} from "../protocol";
import {webdocDB} from "../protocol";

self.addEventListener("install", function(e: ExtendableEvent) {
  console.info("Installed service worker");
});

self.addEventListener("activate", function(e: ExtendableEvent) {
  console.info("Activated service worker");
});

self.addEventListener("fetch", function(e: FetchEvent) {
  e.respondWith(
    Promise.all([
      caches.open(MAIN_CACHE_KEY),
      caches.open(EPHEMERAL_CACHE_KEY),
    ]).then(async ([mainCache, ephemeralCache]) => {
      const mainCacheHit = await mainCache.match(e.request);
      if (mainCacheHit) return mainCacheHit;

      const ephemeralCacheHit = await ephemeralCache.match(e.request);
      const origin = new URL(e.request.url).origin;
      const db = await webdocDB.open();
      const settings = await db.settings.findByOrigin(origin);

      if (ephemeralCacheHit) {
        const manifestHash = ephemeralCacheHit.headers.get("x-manifest-hash");

        if (settings.manifestHash === manifestHash) return ephemeralCacheHit;
        else {
          console.info("Invalidating ", e.request.url, " due to bad X-Manifest-Hash",
            `${manifestHash} vs ${settings.manifestHash}`);
        }
      }

      const response = await fetch(e.request);
      const headers = {
        ...Object.fromEntries([...response.headers.entries()]),
        "x-manifest-hash": settings.manifestHash || "Not Available",
      };

      try {
        const finalResponse = new Response(response.body, {
          status: response.status || 200,
          statusText: response.statusText,
          headers,
        });

        if (VERSIONED_APP_SHELL_FILES.some((file) => e.request.url.endsWith(file))) {
          mainCache.put(e.request, finalResponse.clone());
        } else if (EPHEMERAL_APP_SHELL_FILES.some((file) => e.request.url.endsWith(file))) {
          ephemeralCache.put(e.request, finalResponse.clone());
        }

        return finalResponse;
      } catch {
        return response;
      }
    }),
  );
});

async function cachePagesOffline(app: string): Promise<void> {
  const [db, appCache]: [webdocDB, Cache] = await Promise.all([
    webdocDB.open(),
    caches.open(MAIN_CACHE_KEY),
  ]);

  for await (const {uri} of db.hyperlinks.list(app, {page: true})) {
    console.info("Caching ", uri);
    appCache.add(new URL(uri, new URL(registration.scope).origin));
  }
}

self.addEventListener("message", async function(e) {
  console.log("Processing ", e.data);
  const message = (e.data: ?SwMessage);
  if (!message) return;

  switch (message.type) {
  case "lifecycle:init": {
    const {app, manifest} = (message: SwInitMessage);

    try {
      const [db, response] = await Promise.all([
        webdocDB.open(),
        fetch(new URL(manifest, new URL(registration.scope).origin)),
      ]);
      const data = await response.json();

      await db.hyperlinks.put(app, data.registry);

      const settings = await db.settings.get(app);
      if (settings.offlineStorage) await cachePagesOffline(app);
    } catch (e) {
      console.error("fetch manifest", e);
    }

    break;
  }
  case "trigger:settings": {
    const {app, change: {key, value}} = (message: SwSettingsTriggerMessage);

    if (key === "offlineStorage") {
      if (value) {
        await cachePagesOffline(app);
      }
    }

    break;
  }
  }
});
