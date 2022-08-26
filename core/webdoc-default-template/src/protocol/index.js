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
  offline: boolean;
  stale: boolean;

  constructor(db: webdocDB) {
    this.db = db;
  }

  async init(): webdocService {
    if (!APP_MANIFEST) {
      throw new Error("The documentation manifest was not exported to the website");
    }

    const {manifest, manifestHash, version} = await this.db.settings.get(APP_NAME);
    const {hash: verifiedHash, offline} = await webdocService.verifyManifestHash(manifestHash);

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

      // The manifest changed from a previous non-null value
      if (manifest) this.stale = true;
    }

    this.offline = offline;

    return this;
  }

  postMessage(data: SwMessage) {
    navigator.serviceWorker.controller.postMessage(data);
  }

  static async verifyManifestHash(currentHash: string): Promise<{
    hash: string,
    offline: boolean,
  }> {
    if (!APP_MANIFEST) return {hash: currentHash, offline: false};

    try {
      const response = await fetch(ensureAbsolutePath(APP_MANIFEST + ".md5"));
      const text = await response.text();

      return {hash: text, offline: false};
    } catch (e) {
      console.error("Failed to verify manifest hash", e);
      return {
        hash: currentHash,
        offline: e.message && e.message.includes("Failed to fetch"),
      };// Don't invalidate if request fails
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
