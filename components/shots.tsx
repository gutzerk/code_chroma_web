"use client";

import { useEffect, useRef, useState } from "react";

const publicAsset = (path: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;

/**
 * Product visuals for the landing — real screen-recorded webm clips (in /public)
 * shown as expandable thumbnails. Every shot reuses ZoomableVideoShot, a button
 * wrapping a muted autoplaying preview; clicking it asks the parent (Showcase) to
 * open the shared Lightbox below.
 */

export type LightboxItem = {
  src: string;
  kicker: string;
  title: string;
  body: string;
  bullets: string[];
};

/* Video paths shared by the thumbnails and the slide list that feeds the lightbox. */
export const VIDEO = {
  diagrams: "/schema-diagram.webm",
  plan: "/planning.webm",
  diff: "/review.webm",
  workspace: "/all-in-one.webm",
} as const;

/* Full-screen lightbox: the clip on one side, the slide's description on the other,
   with prev/next arrows (and ←/→) to flip through clips without closing. Clicking
   the video plays/pauses it; closing is via the backdrop, the × button, or Esc.
   Modal dialog semantics: focus moves in on open, is trapped while open, and
   returns to the opener on close. */
export function Lightbox({
  items,
  index,
  onIndex,
  onClose,
}: {
  items: LightboxItem[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  // Keep the latest callbacks in a ref so the listener can mount once instead of
  // being torn down and re-added on every parent render.
  const latest = useRef({ items, index, onIndex, onClose });
  useEffect(() => {
    latest.current = { items, index, onIndex, onClose };
  });
  const ref = useRef<HTMLDivElement | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  const item = items[index];

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    ref.current?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") return latest.current.onClose();
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        // Capture phase: keep the page carousel's global arrow handler out of it.
        e.preventDefault();
        e.stopPropagation();
        const { items, index, onIndex } = latest.current;
        const dir = e.key === "ArrowLeft" ? -1 : 1;
        return onIndex((index + dir + items.length) % items.length);
      }

      // Trap Tab within the modal.
      if (e.key !== "Tab" || !ref.current) return;
      const focusables = ref.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, video[controls], [tabindex]:not([tabindex="-1"])'
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
    window.addEventListener("keydown", onKey, true);

    return () => {
      window.removeEventListener("keydown", onKey, true);
      // Return focus to the element that opened the lightbox, if it's still around.
      if (opener?.isConnected) opener.focus();
    };
  }, []);

  const navBtn =
    "flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[color:var(--border)] bg-black/60 text-[color:var(--text-1)] transition-colors hover:border-[color:var(--added)] hover:text-[color:var(--added)]";
  const chevron = (flip: boolean) => (
    <svg
      viewBox="0 0 24 24"
      className={`h-6 w-6 ${flip ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  );

  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      tabIndex={-1}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-3 outline-none sm:p-6"
      onClick={onClose}
    >
      <div
        className="flex max-h-full w-full max-w-[120rem] flex-col gap-4 overflow-y-auto lg:h-full lg:flex-row lg:overflow-visible"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Video column with side arrows */}
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => onIndex((index - 1 + items.length) % items.length)}
            aria-label="Previous video"
            className={navBtn}
          >
            {chevron(true)}
          </button>
          <div className="flex min-w-0 flex-1 items-center justify-center lg:h-full">
            {failed === item.src ? (
              <p className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-1)] p-6 text-center text-[color:var(--text-2)]">
                This video could not be loaded.
              </p>
            ) : (
              <video
                key={item.src}
                className="max-h-full w-full object-contain"
                autoPlay
                muted
                loop
                playsInline
                controls
                preload="auto"
                onError={() => setFailed(item.src)}
              >
                <source src={publicAsset(item.src)} type="video/webm" />
                <source src={publicAsset(item.src.replace(/\.webm$/, ".mp4"))} type="video/mp4" />
              </video>
            )}
          </div>
          <button
            type="button"
            onClick={() => onIndex((index + 1) % items.length)}
            aria-label="Next video"
            className={navBtn}
          >
            {chevron(false)}
          </button>
        </div>

        {/* Info column */}
        <aside className="relative flex shrink-0 flex-col rounded-lg border border-[color:var(--border-faint)] bg-[color:var(--surface-1)] p-5 lg:w-80 lg:overflow-y-auto xl:w-96">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-xl leading-none text-[color:var(--text-2)] hover:text-[color:var(--text-1)]"
          >
            ×
          </button>
          <p className="font-mono text-xs tracking-widest" style={{ color: "var(--accent)" }}>
            {item.kicker} · {index + 1} / {items.length}
          </p>
          <h2 className="mt-3 pr-8 text-2xl font-semibold tracking-tight">{item.title}</h2>
          <p className="mt-3 text-base leading-relaxed text-[color:var(--text-2)]">{item.body}</p>
          <ul className="mt-5 space-y-2 text-sm text-[color:var(--text-2)]">
            {item.bullets.map((b) => (
              <li key={b} className="flex items-start gap-2">
                <span className="mt-0.5 text-[color:var(--added)]">✓</span>
                {b}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}

/* Uniform glowing frame shared by every video shot: a neon accent border with a
   soft permanent halo, brightening on hover to hint the clip opens full screen. */
const GLOW_FRAME =
  "block w-full overflow-hidden rounded-lg border-2 border-[color:var(--accent)] bg-transparent p-0 text-left shadow-[0_0_18px_rgba(111,207,151,0.3)] transition-all duration-200 hover:border-[color:var(--added)] hover:shadow-[0_0_28px_rgba(111,207,151,0.55)]";

export type ShotProps = { onOpen?: () => void };

/** Single expandable video thumbnail. `zoom` scales the video up (cropping empty
    margins) without changing layout size. */
function ZoomableVideoShot({
  src,
  label,
  onOpen,
  zoom = 1,
  className = "",
}: {
  src: string;
  label: string;
  onOpen?: () => void;
  zoom?: number;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`${GLOW_FRAME} ${className}`.trim()}
      aria-label={label}
      aria-haspopup="dialog"
    >
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
        <source src={publicAsset(src.replace(/\.webm$/, ".mp4"))} type="video/mp4" />
      </video>
    </button>
  );
}

/* 0. Hero — the demo video that stands in for the real product. Same glowing
   frame as the expandable shots, but inline (not click-to-open). */
export function HeroShot(props: ShotProps) {
  void props;
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
export function DiffShot({ onOpen }: ShotProps) {
  return (
    <ZoomableVideoShot
      src={VIDEO.diff}
      onOpen={onOpen}
      label="View the changes-as-diagrams demo full screen"
    />
  );
}

/* 3. Diagrams — real product visuals, click to view full screen. Full width,
   matching the other shots. */
export function DiagramsShot({ onOpen }: ShotProps) {
  return (
    <ZoomableVideoShot
      src={VIDEO.diagrams}
      onOpen={onOpen}
      label="View the system architecture demo full screen"
    />
  );
}

/* 3b. Planning — feature planning shown as the real product video. */
export function PlanningShot({ onOpen }: ShotProps) {
  return (
    <ZoomableVideoShot
      src={VIDEO.plan}
      onOpen={onOpen}
      label="View feature planning workspace full screen"
    />
  );
}

/* 4. All in one place — code, diagrams, and agents in a single screen. */
export function AllInOneShot({ onOpen }: ShotProps) {
  return (
    <ZoomableVideoShot
      src={VIDEO.workspace}
      onOpen={onOpen}
      label="View code, diagrams, and agents workspace full screen"
    />
  );
}
