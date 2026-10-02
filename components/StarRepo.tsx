"use client";

import { useEffect, useState } from "react";

const REPO = "UshakovDV/code-chroma";

/**
 * A small floating "Star on GitHub" pill pinned to the top-right corner, showing the live
 * star count from the unauthenticated public GitHub API. Falls back to no count on failure.
 */
export default function StarRepo() {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(`https://api.github.com/repos/${REPO}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive && d?.stargazers_count) setStars(d.stargazers_count);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  return (
    <a
      href={`https://github.com/${REPO}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group fixed right-4 top-4 z-50 inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[rgba(16,22,18,0.9)] py-2 pl-3 pr-3.5 text-sm font-medium text-[color:var(--text-1)] backdrop-blur transition-colors hover:border-[color:var(--added)] hover:text-[color:var(--added)] sm:right-6 sm:top-5"
    >
      <svg
        viewBox="0 0 16 16"
        className="h-4 w-4 text-[color:var(--text-3)] transition-colors group-hover:text-[color:var(--added)]"
        fill="currentColor"
        aria-hidden
      >
        <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
      </svg>
      <span>Star</span>
      {stars !== null && (
        <span className="rounded border border-[color:var(--border)] px-1.5 text-xs text-[color:var(--text-2)]">
          {stars}
        </span>
      )}
    </a>
  );
}
