"use client";
import { useEffect, useRef, useState } from "react";
// Copied from code-chroma/web/src/canvas/strategies/nodeChrome.tsx (MIT).
const COPY_FLASH_MS = 1200;

const COPY_GLYPH = { idle: <CopyIcon />, copied: "✓", failed: "✕" };

/** Two overlapping rounded squares -- the idle copy glyph; strokes follow the button's text color. */
function CopyIcon() {
  return (
    <svg
      className="copy-icon"
      viewBox="0 0 16 16"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      aria-hidden="true"
    >
      <rect x="5.5" y="5.5" width="8" height="8" rx="2.2" />
      <path d="M10.5 3.7V4a2.2 2.2 0 0 0-2.2-2.2H4A2.2 2.2 0 0 0 1.8 4v4.3A2.2 2.2 0 0 0 4 10.5h.3" />
    </svg>
  );
}

export function CopyButton({
  text,
  name,
  variant,
  testId,
}: {
  text: string;
  name: string;
  variant: string;
  testId?: string;
}) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const flash = (next: "copied" | "failed") => {
    setState(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), COPY_FLASH_MS);
  };

  return (
    <button
      type="button"
      className={`${variant}-copy-button${state === "idle" ? "" : ` is-${state}`}`}
      aria-label={`Copy ${name}`}
      title={`Copy ${text}`}
      data-copy-state={state}
      data-testid={testId}
      onClick={(event) => {
        // The block root and the tree label both toggle expand on click.
        event.stopPropagation();
        const write = navigator.clipboard?.writeText(text);
        if (!write) {
          flash("failed");
          return;
        }
        write.then(() => flash("copied")).catch(() => flash("failed"));
      }}
    >
      {COPY_GLYPH[state]}
    </button>
  );
}


