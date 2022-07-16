const paths = window.location.pathname.includes(".html") ?
  [window.location.pathname] :
  [
    `${window.location.pathname}.html`,
    `${window.location.pathname}/index.html`.replace("//", "/"),
  ];

export function isSamePage(data) {
  if (data.page.startsWith("/") && paths.includes(data.page)) {
    return true;
  } else if (!data.page.startsWith("/") && paths.some((path) => path.includes(`/${data.page}`))) {
    return true;
  }

  return false;
}
