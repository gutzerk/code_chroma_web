"use client";

import { useSyncExternalStore } from "react";
import styles from "./page.module.css";

const SEEN_KEY = "codechroma-canvas-hint-seen";
const listeners = new Set<() => void>();
// Used when storage is blocked, so a dismissal still lasts for this page view.
let seenInMemory = false;

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function readSeen() {
  if (seenInMemory) return true;
  try {
    return localStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

function markSeen() {
  seenInMemory = true;
  try {
    localStorage.setItem(SEEN_KEY, "1");
  } catch {
    // Remembering the dismissal across visits is a convenience only.
  }
  listeners.forEach((cb) => cb());
}

/** First-visit card that says what the map is and what to do with it. Dismissed once, remembered per browser. */
export default function CanvasHint() {
  // The server snapshot says "seen" so nothing is rendered until the browser has checked storage.
  const seen = useSyncExternalStore(subscribe, readSeen, () => true);

  if (seen) return null;

  return (
    <aside className={styles.tip} role="note" aria-label="How to use the map">
      <b>This is a sample project, drawn as a map.</b>
      <p>
        Each block is a part of the system. Click one to read the code behind it. In the real app, agents build
        against this map and you verify the result here, not in the files.
      </p>
      <button type="button" onClick={markSeen}>Got it</button>
    </aside>
  );
}
