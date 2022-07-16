// @flow

const toc /*: Map<string, HTMLElement> */ = new Map();
const css = "page-members-explorer__item--current";
let current /*: HTMLElement | null */ = null;

function onIntersectionChange(entries /*: IntersectionObserverEntry[] */) {
  for (let i = entries.length - 1; i >= 0; i--) {
    const {target, isIntersecting} = entries[i];
    const id = target.getAttribute("data-id");
    const explorerItemElement = toc.get(id);

    explorerItemElement.setAttribute("data-visible", String(isIntersecting));
  }

  let next = null;
  for (const [, explorerItemElement] of toc) {
    if (explorerItemElement.getAttribute("data-visible") === "true") {
      next = explorerItemElement;
    }
  }

  if (next !== current) {
    if (next) next.classList.add(css);
    if (current) current.classList.remove(css);
    current = next;
  }
}

if (typeof IntersectionObserver !== "undefined") {
  const observer = new IntersectionObserver(onIntersectionChange, {
    root: null,
    rootMargin: "0px",
    threshold: [1],
  });

  document.addEventListener("DOMContentLoaded", function() {
    for (const explorerItemElement of document.querySelectorAll(".page-members-explorer__item")) {
      const targetId = explorerItemElement.getAttribute("data-id");
      const targetElement = document.querySelector(`.member__title[data-id="${targetId}"]`);

      if (!targetElement) {
        console.warn(`${targetId} member not found in DOM!`);
        continue;
      }

      toc.set(targetId, explorerItemElement);
      observer.observe(targetElement);
    }
  });
}
