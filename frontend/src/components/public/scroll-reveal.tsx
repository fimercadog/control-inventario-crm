"use client";

import { useEffect } from "react";

const SELECTOR = ".realty-animate-fade-up, .realty-animate-fade-in, .realty-animate-scale-in";

/**
 * Mounted once in the public layout. Watches every element carrying one of
 * the realty-animate-* classes and sets [data-revealed] the first time it
 * scrolls into view — see the matching CSS in globals.css for why this
 * exists (those classes used to run as plain CSS animations that fired on
 * mount, finishing invisibly before anyone scrolled to them).
 *
 * Uses a data-attribute rather than a class: React never renders this
 * attribute itself, so hydration never compares it and there's nothing to
 * mismatch — a plain classList.add on a React-owned className did trigger
 * a (harmless but very visible, dev-overlay-blocking) hydration warning
 * whenever it touched content still streaming in behind a <Suspense>
 * boundary (the property catalog pages, for example).
 */
export function ScrollReveal() {
  useEffect(() => {
    const reveal = (el: Element) => el.setAttribute("data-revealed", "");

    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll(SELECTOR).forEach(reveal);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            reveal(entry.target);
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -80px 0px" },
    );

    const watch = (el: Element) => observer.observe(el);
    document.querySelectorAll(SELECTOR).forEach(watch);

    // Server Components behind <Suspense> (the property catalog pages, for
    // example) stream their content in *after* this effect's first run —
    // a one-off querySelectorAll never sees them, so they'd sit at
    // opacity: 0 forever. Watch for nodes added later and pick those up too.
    const mutationObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (!(node instanceof Element)) continue;
          if (node.matches(SELECTOR)) watch(node);
          node.querySelectorAll(SELECTOR).forEach(watch);
        }
      }
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return null;
}
