"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Shared carousel primitives for the site's slide viewers. The three Showcase
 * pages (home, docs, configuration) used to each copy-paste this state machine,
 * arrow button, and progress strip — with slight drift. Kept here so behavior
 * (wrap-around, keyboard arrows) lives in exactly one place.
 */

/** Wraps a slide index with wrap-around stepping and global arrow-key handling. */
export function useCarousel(total: number) {
  const [index, setIndex] = useState(0);

  const go = useCallback(
    (dir: 1 | -1) => setIndex((i) => (i + dir + total) % total),
    [total]
  );
  const goTo = useCallback((i: number) => setIndex(i), []);

  // Detect horizontal drags on touch screens and step the slide accordingly.
  // Tracks the pointer from pointerdown to a threshold distance moved; small
  // movements, vertical scrolls, and taps are ignored so normal scrolling and
  // selecting text aren't hijacked.
  const drag = useRef<{ x: number; y: number; id: number }>({ x: 0, y: 0, id: -1 });

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    drag.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
  }, []);

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerId !== drag.current.id) return;
      drag.current.id = -1;
      const dx = e.clientX - drag.current.x;
      const dy = e.clientY - drag.current.y;
      // Need a clear horizontal glide; require it to beat both a dead zone
      // and the vertical distance so vertical scrolls aren't misread as swipes.
      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        go(dx < 0 ? 1 : -1);
      }
    },
    [go]
  );

  useEffect(() => {
    function isTypingTarget(t: EventTarget | null): boolean {
      if (!(t instanceof HTMLElement)) return false;
      return (
        t.isContentEditable ||
        t.tagName === "INPUT" ||
        t.tagName === "TEXTAREA" ||
        t.tagName === "SELECT"
      );
    }

    function onKey(e: KeyboardEvent) {
      // Don't hijack arrow keys the user needs for typing, scrolling, or shortcuts.
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTypingTarget(e.target)) return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [total, go]);

  return { index, go, goTo, dragHandlers: { onPointerDown, onPointerUp } };
}

type ArrowProps = {
  dir: "left" | "right";
  onClick: () => void;
  label: string;
  size?: "md" | "lg";
};

export function Arrow({ dir, onClick, label, size = "md" }: ArrowProps) {
  const button = size === "lg" ? "h-14 w-14" : "h-12 w-12";
  const icon = size === "lg" ? "h-7 w-7" : "h-6 w-6";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`group flex ${button} shrink-0 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface-1)] text-[color:var(--text-2)] transition-colors hover:border-[color:var(--added)] hover:text-[color:var(--added)]`}
    >
      <svg
        viewBox="0 0 24 24"
        className={`${icon} ${dir === "left" ? "rotate-180" : ""}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 6l6 6-6 6" />
      </svg>
    </button>
  );
}

type DotsProps = {
  count: number;
  index: number;
  onSelect: (i: number) => void;
  labels: string[];
};

/** Clickable progress strip: wide/accented active dot, narrow inactive dots. */
export function ProgressDots({ count, index, onSelect, labels }: DotsProps) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onSelect(i)}
          aria-label={`Go to ${labels[i] ?? i + 1}`}
          className={`h-1.5 rounded-full transition-all ${
            i === index
              ? "w-6 bg-[color:var(--added)]"
              : "w-1.5 bg-[color:var(--border)] hover:bg-[color:var(--text-3)]"
          }`}
        />
      ))}
    </div>
  );
}
