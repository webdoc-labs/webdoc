// @flow

type HyperlinkData = {
  id: string,
  app: string,
  uri: string,
  page: boolean,
};

export class HyperlinkModel {
  static STORE = "pages";
  static KEY_PATH = "id";

  db: IDBDatabase;

  constructor(db: IDBDatabase) {
    this.db = db;
  }

  // eslint-disable-next-line no-undef
  list(app: string, filter: { page?: boolean }, cb: (link: HyperlinkData) => void): void {
    const transaction = this.db.transaction(HyperlinkModel.STORE, "readonly");
    const store = transaction.objectStore(HyperlinkModel.STORE);
    const request = store.openCursor();

    const evaluateFilter = (value: ?HyperlinkData): boolean => {
      if (!value) return false;
      if (filter && typeof filter.page !== "undefined" && filter.page !== value.page) return false;
      return true;
    };

    request.onerror = (e) => {
      console.error(e);
    };

    request.onsuccess = (e) => {
      const cursor = e.target.result;

      if (cursor && cursor.value) {
        if (evaluateFilter(cursor.value)) cb(cursor.value);
        cursor.continue();
      }
    };
  }

  async put(app: string, registry: { [string]: { uri: string } }): Promise<void> {
    const items: $ReadOnlyArray<HyperlinkData> = Object.entries(registry).map(([id, {uri}]) => ({
      app,
      id,
      uri,
      page: !uri.includes("#"),
    }));

    const transaction = this.db.transaction(HyperlinkModel.STORE, "readwrite");
    const store = transaction.objectStore(HyperlinkModel.STORE);

    // TODO(Shukant): We have to delete records for the app,
    //    but right now only 1 app would exist anyway
    const clearRequest = store.clear();
    await new Promise((resolve, reject) => {
      clearRequest.onsuccess = resolve;
      clearRequest.onerror = reject;
    });

    const requests = items.map((item) => store.put(item));

    return Promise.all(requests.map((request) => new Promise((resolve, reject) => {
      request.onsuccess = resolve;
      request.onerror = reject;
    })));
  }

  static async upgrade(db: IDBDatabase): Promise<void> {
    if (!db.objectStoreNames.contains(HyperlinkModel.STORE)) {
      const hyperlinkStore = db.createObjectStore(HyperlinkModel.STORE, {
        keyPath: HyperlinkModel.KEY_PATH,
      });

      hyperlinkStore.createIndex("uri", "uri", {unique: false});
      hyperlinkStore.createIndex("app", "app", {unique: false});
    }
  }
}
