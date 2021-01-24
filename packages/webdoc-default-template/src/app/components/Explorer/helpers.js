export function isSamePage(data) {
  const path = `${window.location.pathname}.html`;

  if (data.page.startsWith("/") && data.page === path) {
    return true;
  } else if (!data.page.startsWith("/") && path.includes(`/${data.page}`)) {
    return true;
  }

  return false;
}
