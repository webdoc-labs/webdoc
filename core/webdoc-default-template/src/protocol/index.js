// @flow

import {APP_MANIFEST, APP_NAME, VERSION} from "./const";
import type {SettingsData} from "./webdocDB";
import {webdocDB} from "./webdocDB";

export type SwInitMessage = {
  type: "lifecycle:init",
  app: string,
  manifest: string
};

export type SwSettingsTriggerMessage = {
  type: "trigger:settings",
  app: string,
  change: {
    key: $Keys<SettingsData>,
    value: $Values<SettingsData>,
    previousValue: $Values<SettingsData>,
  },
};

export type SwMessage = SwInitMessage | SwSettingsTriggerMessage;

export function getResourceURI(path) {
  let root = window.appData.siteRoot;
  if (root && !root.startsWith("/")) root = `/${root}`;
  if (!path.startsWith("/")) path = `/${path}`;

  return (root + path).replace("//", "/");
}

export function ensureAbsolutePath(path) {
  return path.startsWith("/") ? path : `/${path}`;
}

export class webdocService {
  db: webdocDB;

  constructor(db: webdocDB) {
    this.db = db;
  }

  async init(): webdocService {
    const {manifest, manifestHash, version} = await this.db.settings.get(APP_NAME);
    const verifiedHash = await webdocService.verifyManifestHash(manifestHash);

    if (manifest !== APP_MANIFEST ||
          manifestHash !== verifiedHash ||
          version !== VERSION) {
      console.info("Manifest change detected, reindexing");
      await this.db.settings.update(APP_NAME, {
        manifest: APP_MANIFEST,
        manifestHash: verifiedHash,
        origin: window.location.origin,
        version: VERSION,
      });
      if (typeof APP_MANIFEST === "string") {
        this.postMessage({
          type: "lifecycle:init",
          app: APP_NAME,
          manifest: APP_MANIFEST,
        });
      }
    }

    return this;
  }

  postMessage(data: SwMessage) {
    navigator.serviceWorker.controller.postMessage(data);
  }

  static async verifyManifestHash(currentHash: string): Promise<string> {
    if (!APP_MANIFEST) return currentHash;

    try {
      const response = await fetch(ensureAbsolutePath(APP_MANIFEST + ".md5"));
      const text = await response.text();

      return text;
    } catch (e) {
      console.error("Failed to verify manifest hash", e);
      return currentHash;// Don't invalidate if request fails
    }
  }
}

export async function registerServiceWorker(): Promise<webdocService> {
  const registration = await navigator.serviceWorker.register(getResourceURI("service-worker.js"));
  const waitOn = navigator.serviceWorker.controller ?
    Promise.resolve() :
    new Promise((resolve, reject) => {
      const worker = registration.installing ?? registration.waiting ?? registration.active;
      if (!worker) return reject(new Error("No worker found"));
      else {
        worker.onstatechange = (e) => {
          if (e.target.state === "active") {
            resolve();
          }
        };
      }
    });

  await waitOn;

  const db = await webdocDB.open();
  // eslint-disable-next-line new-cap
  return new webdocService(db);
}

export * from "./const";
export * from "./webdocDB";
