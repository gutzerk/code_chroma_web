"use client";

import { Arrow, ProgressDots } from "./carousel";

/** One slide in the docs/configuration viewers. */
export type Slide = {
  id: string;
  group: string;
  label: string;
  kicker: string;
  title: string;
  blurb: string;
  content: React.ReactNode;
};

type SectionNavProps = {
  eyebrow: string;
  slides: readonly Slide[];
  index: number;
  go: (dir: 1 | -1) => void;
  goTo: (i: number) => void;
  /** Gap class for the arrow row — docs uses "gap-2", configuration "gap-3". */
  arrowGap?: string;
};

/**
 * Left navigation panel for the docs/configuration slide viewers: a sticky,
 * fixed-height list of grouped section buttons plus the prev/next + progress
 * row. Shared by DocsShowcase and ConfigurationShowcase so the grouping,
 * active-state, and control markup live in one place.
 */
export function SectionNav({ eyebrow, slides, index, go, goTo, arrowGap = "gap-2" }: SectionNavProps) {
  return (
    <aside className="hidden flex-col pt-12 lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)] lg:shrink-0 lg:self-start lg:pb-12 lg:flex">
      <p className="font-mono text-xs tracking-widest text-[color:var(--text-3)]">{eyebrow}</p>
      <nav className="mt-4 space-y-1">
        {slides.map((s, i) => {
          const sameGroup = i > 0 && slides[i - 1].group === s.group;
          return (
            <div key={s.id}>
              {!sameGroup && (
                <div className="px-3 pt-3 font-mono text-[10px] uppercase tracking-widest text-[color:var(--text-3)] first:pt-0">
                  {s.group}
                </div>
              )}
              <button
                type="button"
                onClick={() => goTo(i)}
                aria-current={i === index}
                className={`block w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                  sameGroup ? "ml-3 pl-2" : ""
                } ${
                  i === index
                    ? "bg-[color:var(--surface-2)] text-[color:var(--text-1)]"
                    : "text-[color:var(--text-2)] hover:bg-[color:var(--surface-2)] hover:text-[color:var(--text-1)]"
                }`}
              >
                <span className="text-[color:var(--text-1)]">{s.label}</span>
              </button>
            </div>
          );
        })}
      </nav>

      {/* Slide arrows — prev / next, just below the last menu item */}
      <div className={`mt-6 flex items-center border-t border-[color:var(--border-faint)] pt-5 ${arrowGap}`}>
        <Arrow dir="left" onClick={() => go(-1)} label="Previous section" />
        <ProgressDots count={slides.length} index={index} onSelect={goTo} labels={slides.map((s) => s.label)} />
        <Arrow dir="right" onClick={() => go(1)} label="Next section" />
      </div>
    </aside>
  );
}
