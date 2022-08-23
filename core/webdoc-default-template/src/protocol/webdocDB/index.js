// @flow

import {HyperlinkModel} from "./HyperlinkModel";
import {SettingsModel} from "./SettingsModel";

const DATABASE_NAME = "%%webdocDB%%";
const DATABASE_VERSION = 1;

let databaseOpenPromise: ?Promise<webdocDB> = null;

export class webdocDB {
  static NAME = DATABASE_NAME;
  static VERSION = DATABASE_VERSION;

  db: IDBDatabase;
  hyperlinks: HyperlinkModel;
  settings: SettingsModel;

  constructor(db: IDBDatabase) {
    this.db = db;
    this.hyperlinks = new HyperlinkModel(db);
    this.settings = new SettingsModel(db);
  }

  static async open(): Promise<?webdocDB> {
    if (typeof indexedDB === "undefined") {
      return null;
    }

    if (databaseOpenPromise != null) {
      return databaseOpenPromise;
    }

    return databaseOpenPromise = new Promise((resolve, reject) => {
      const dbOpenRequest = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

      dbOpenRequest.onsuccess = (_: Event) => {
        // eslint-disable-next-line new-cap
        resolve(new webdocDB(dbOpenRequest.result));
      };

      dbOpenRequest.onupgradeneeded = (e) => {
        const db = e.target.result;

        HyperlinkModel.upgrade(db);
        SettingsModel.upgrade(db);
      };

      dbOpenRequest.onerror = (e: Event) => {
        console.error("Failed to open webdocDB:", e);
        reject(e);
      };
    });
  }
}

export type {SettingsData} from "./SettingsModel";
