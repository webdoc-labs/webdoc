export const appData = window.appData;

export function getResourceURI(path) {
  const root = window.appData.siteRoot;

  if (!path.startsWith("/")) {
    path = `/${path}`;
  }

  return root + path;
}
