const appData = typeof window !== "undefined" && window.appData ? window.appData : null;
const origin = typeof window !== "undefined" ? window.origin : "nil";

// Don't use this in a service worker context!
export const APP_NAME = `${appData && appData.applicationName}-${origin}`;
export const APP_MANIFEST: ?string = (appData && appData.manifest) ?? null;
export const PAGE_SETTINGS = appData && appData.pages.settings;
export const VERSION = 1;
