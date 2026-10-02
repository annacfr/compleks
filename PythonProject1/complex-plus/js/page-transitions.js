(function () {
  "use strict";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let leaving = false;

  // Back/forward cache restores the document with its previous classes.
  window.addEventListener("pageshow", () => {
    leaving = false;
    document.body.classList.remove("page-leaving");
  });

  document.addEventListener("click", (event) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      reducedMotion.matches
    )
      return;
    const link = event.target.closest("a[href]");
    if (
      !link ||
      link.hasAttribute("download") ||
      (link.target && link.target !== "_self")
    )
      return;
    const destination = new URL(link.href, window.location.href);
    if (
      destination.origin !== window.location.origin ||
      !destination.pathname.endsWith(".html") ||
      (destination.pathname === window.location.pathname &&
        destination.search === window.location.search)
    )
      return;
    event.preventDefault();
    if (leaving) return;
    leaving = true;
    document.body.classList.add("page-leaving");
    window.setTimeout(() => window.location.assign(destination.href), 180);
  });
})();
