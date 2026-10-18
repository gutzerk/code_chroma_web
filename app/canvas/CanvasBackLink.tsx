"use client";

import Link from "next/link";
import { useEffect } from "react";

const PRESERVE_DEMO_STATE_KEY = "codechroma-preserve-demo-state-once";

export default function CanvasBackLink({ className }: { className: string }) {
  useEffect(() => {
    // If the full-canvas entry was a client-side route, reset-demo-state.js did not run.
    // Consume the navigation marker here so it cannot suppress a later manual refresh.
    try {
      sessionStorage.removeItem(PRESERVE_DEMO_STATE_KEY);
    } catch {
      // Non-fatal when session storage is unavailable.
    }
  }, []);

  function preserveDemoState() {
    try {
      sessionStorage.setItem(PRESERVE_DEMO_STATE_KEY, "true");
      // If Next handles this as a client-side transition, the reset script will not run. Clear
      // the one-shot marker shortly afterwards so a later manual refresh still starts fresh.
      window.setTimeout(() => sessionStorage.removeItem(PRESERVE_DEMO_STATE_KEY), 2500);
    } catch {
      // Returning to the site still works when session storage is unavailable.
    }
  }

  return (
    <Link className={className} href="/#canvas-demo" aria-label="Back to CodeChroma home" onClick={preserveDemoState}>
      <span aria-hidden="true">←</span> <span>CodeChroma</span>
    </Link>
  );
}
