// @flow

export type SettingsData = {
  app: string,
  manifest: string,
  manifestHash: string,
  offlineStorage: boolean,
  origin: string,
  version: number,
};

const DEFAULT_SETTINGS: $Diff<SettingsData, { app: string }> = {
  app: "",
  manifest: "",
  manifestHash: "",
  offlineStorage: false,
  origin: "",
  version: 0,
};

export class SettingsModel {
  static STORE = "settings";
  static KEY_PATH = "app";

  db: IDBDatabase;

  constructor(db: IDBDatabase) {
    this.db = db;
  }

  async get(app: string): Promise<?SettingsData> {
    return this.findBy("app", app);
  }

  async findByOrigin(origin: string): Promise<?SettingsData> {
    return this.findBy("origin", origin);
  }

  async findBy(index: "app" | "origin" | "hash", value: string): Promise<SettingsData> {
    const transaction = this.db.transaction(SettingsModel.STORE, "readonly");
    const store = transaction.objectStore(SettingsModel.STORE);

    try {
      const request = store.index(index).get(value);

      const data = await new Promise((resolve, reject) => {
        request.onsuccess = (e) => resolve(e.target.result);
        request.onerror = (e) => {
          console.error(e);
          resolve(null);
        };
      });

      return {
        ...DEFAULT_SETTINGS,
        ...data,
      };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  async update(app: string, updates: $Shape<SettingsData>): Promise<mixed> {
    const current = await this.get(app);
    const transaction = this.db.transaction(SettingsModel.STORE, "readwrite");
    const store = transaction.objectStore(SettingsModel.STORE);
    const request = store.put({
      ...current,
      ...updates,
      app,
    });

    return new Promise((resolve, reject) => {
      request.onsuccess = resolve;
      request.onerror = reject;
    });
  }

  static async upgrade(db: IDBDatabase): Promise<void> {
    if (!db.objectStoreNames.contains(SettingsModel.STORE)) {
      const settingsStore = db.createObjectStore(SettingsModel.STORE, {
        keyPath: SettingsModel.KEY_PATH,
      });

      settingsStore.createIndex("app", "app", {unique: true});
      settingsStore.createIndex("hash", "manifestHash", {unique: true});
      settingsStore.createIndex("origin", "origin", {unique: true});
    }
  }
}
