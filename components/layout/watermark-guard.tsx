"use client";

import * as React from "react";

const HOST_CLASS = "nexus-watermark";
const HOST_FLAG = "data-watermark";
const RECHECK_MS = 1500;

/**
 * Re-asserts the watermark host's class if it is removed at runtime.
 *
 * Renders nothing. Watches the current <main> for attribute changes and its
 * parent for the element being swapped out, and re-adds the marker class when
 * it goes missing. A low-frequency interval is the backstop for the case where
 * React replaces the whole element and the observer's target goes stale.
 *
 * Scope note: this defeats "delete the class in the inspector", which is the
 * common case. It does NOT make the watermark tamper-proof - disabling
 * JavaScript, editing the stylesheet, or removing this component all defeat
 * it. See the comment block in `app/globals.css`.
 */
export function WatermarkGuard() {
  React.useEffect(() => {
    let observed: HTMLElement | null = null;

    const observer = new MutationObserver(() => enforce());

    function enforce() {
      const host = document.querySelector<HTMLElement>("main");
      if (!host) return;

      // Only write when actually missing, so the observer's own callback
      // can't drive a feedback loop.
      if (!host.classList.contains(HOST_CLASS)) {
        host.classList.add(HOST_CLASS);
      }
      if (host.getAttribute(HOST_FLAG) !== "nexus") {
        host.setAttribute(HOST_FLAG, "nexus");
      }

      // Re-target when React has replaced the element under us.
      if (host !== observed) {
        observer.disconnect();
        observer.observe(host, {
          attributes: true,
          attributeFilter: ["class", HOST_FLAG],
        });
        if (host.parentElement) {
          observer.observe(host.parentElement, { childList: true });
        }
        observed = host;
      }
    }

    enforce();
    const timer = window.setInterval(enforce, RECHECK_MS);

    return () => {
      observer.disconnect();
      window.clearInterval(timer);
    };
  }, []);

  return null;
}
