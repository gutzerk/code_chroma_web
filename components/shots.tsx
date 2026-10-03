"use client";

import { useEffect, useRef, useState } from "react";

const publicAsset = (path: string) => `${process.env.NEXT_PUBLIC_BASE_PATH}${path}`;

/**
 * Product visuals for the landing — real screen-recorded webm clips (in /public)
 * shown as expandable thumbnails. Every shot reuses ZoomableVideoShot, which wraps
 * a muted autoplaying preview in a button and opens a full-screen lightbox on click.
 */

/* Full-screen lightbox overlay — close by clicking anywhere or pressing Esc.
   Modal dialog semantics: focus moves in on open, is trapped while open, and
   returns to the caller (via restoreFocusRef) on close. */
function Lightbox({
  src,
  onClose,
  restoreFocusRef,
}: {
  src: string;
  onClose: () => void;
  restoreFocusRef: React.RefObject<HTMLButtonElement | null>;
}) {
  // Keep the latest onClose in a ref so the listener can mount once (dep [])
  // instead of being torn down and re-added on every parent render.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Move focus into the modal when it opens.
    ref.current?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") return onCloseRef.current();

      // Trap Tab within the modal.
      if (e.key !== "Tab" || !ref.current) return;
      const focusables = ref.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      // Return focus to the element that opened the lightbox.
      restoreFocusRef.current?.focus();
    };
  }, [restoreFocusRef]);

  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label="Media preview"
      tabIndex={-1}
      className="fixed inset-0 z-50 flex cursor-pointer items-center justify-center bg-black/90 p-4 outline-none sm:p-10"
      onClick={onClose}
    >
      {src.endsWith(".webm") ? (
        <video
          className="max-h-full max-w-full object-contain"
          autoPlay
          loop
          playsInline
          controls
        >
          <source src={src} type="video/webm" />
        </video>
      ) : (
        <img src={src} alt="" className="max-h-full max-w-full object-contain" />
      )}
    </div>
  );
}

/* Uniform glowing frame shared by every video shot: a neon accent border with a
   soft permanent halo, brightening on hover to hint the clip opens full screen. */
const GLOW_FRAME =
  "block w-full overflow-hidden rounded-lg border-2 border-[color:var(--accent)] bg-transparent p-0 text-left shadow-[0_0_18px_rgba(111,207,151,0.3)] transition-all duration-200 hover:border-[color:var(--added)] hover:shadow-[0_0_28px_rgba(111,207,151,0.55)]";

/** Single expandable video — button + lightbox, used by every shot below.
    `className` merges extra layout onto the button; `zoom` scales the video up
    (cropping empty margins) without changing layout size. When the lightbox
    opens the thumbnail unmounts so the same clip doesn't play twice at once. */
function ZoomableVideoShot({
  src,
  label,
  zoom = 1,
  className = "",
}: {
  src: string;
  label: string;
  zoom?: number;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(true)}
        className={`${GLOW_FRAME} ${className}`.trim()}
        aria-label={label}
        aria-haspopup="dialog"
      >
        {!open && (
          <video
            className="block aspect-auto w-full rounded-lg"
            style={zoom !== 1 ? { transform: `scale(${zoom})` } : undefined}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          >
            <source src={publicAsset(src)} type="video/webm" />
          </video>
        )}
      </button>
      {open && (
        <Lightbox src={src} onClose={() => setOpen(false)} restoreFocusRef={buttonRef} />
      )}
    </>
  );
}

/* 0. Hero — the demo video that stands in for the real product. Same glowing
   frame as the expandable shots, but inline (not click-to-open). */
export function HeroShot() {
  return (
    <div
      className={`${GLOW_FRAME} bg-[color:var(--surface-1)]`}
      aria-label="CodeChroma demo video"
    >
      <video
        className="block aspect-video w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={publicAsset("/demo-poster.gif")}
      >
        <source src={publicAsset("/demo-hd.webm")} type="video/webm" />
        Your browser does not support video playback.
      </video>
    </div>
  );
}

/* 2. Diff overlay — a changed function before / after inside its block. */
export function DiffShot() {
  return (
    <ZoomableVideoShot
      src="/review.webm"
      label="View the changes-as-diagrams demo full screen"
    />
  );
}

/* 3. Diagrams — real product visuals, click to view full screen. Full width,
   matching the other shots. */
export function DiagramsShot() {
  return (
    <ZoomableVideoShot
      src="/schema-diagram.webm"
      label="View the system architecture demo full screen"
    />
  );
}

/* 3b. Planning — feature planning shown as the real product video. */
export function PlanningShot() {
  return (
    <ZoomableVideoShot
      src="/planning.webm"
      label="View feature planning workspace full screen"
    />
  );
}

/* 4. All in one place — code, diagrams, and agents in a single screen. */
export function AllInOneShot() {
  return (
    <ZoomableVideoShot
      src="/all-in-one.webm"
      label="View code, diagrams, and agents workspace full screen"
      zoom={1.3}
    />
  );
}
