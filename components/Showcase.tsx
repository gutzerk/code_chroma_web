"use client";

import { HeroShot, DiagramsShot, DiffShot, AllInOneShot, PlanningShot } from "./shots";
import { Arrow, ProgressDots, useCarousel } from "./shared/carousel";

type Slide = {
  id: string;
  kicker: string;
  title: string;
  body: string;
  bullets: string[];
  Shot: () => React.ReactElement;
};

/**
 * Single-screen product showcase with the same carousel interface as Eris:
 * left/right arrows cycle through the shots (free wrap-around, no first/last
 * stop), plus keyboard arrows, a clickable progress strip, and edge soft-fade.
 */
const SLIDES: Slide[] = [
  {
    id: "hero",
    kicker: "CodeChroma",
    title: "Your codebase. Your map.",
    body: "CodeChroma turns any repo into a semantic map of how the system actually works — so speed doesn't come at the cost of architecture.",
    bullets: [
      "Semantic architecture map for LLM-era code",
      "Runs entirely on your machine — safe for work projects",
    ],
    Shot: HeroShot,
  },
  {
    id: "diagrams",
    kicker: "Diagrams",
    title: "Easy onboarding into any project.",
    body: "Your project becomes clear, customizable diagrams in place of walls of code. Step out of raw text in terminals and IDEs into clean, readable maps of what the app actually does.",
    bullets: [
      "Code → clean, understandable diagrams",
      "Customizable views, not fixed layouts",
      "Grouping follows real code relationships",
    ],
    Shot: DiagramsShot,
  },
  {
    id: "plan",
    kicker: "Planning",
    title: "Planning.",
    body: "Lay out features as diagrams and decompose them down the hierarchy — features into epics, epics into tasks — right on the canvas, before a line of code.",
    bullets: [
      "Design new features visually",
      "Features → epics → tasks",
      "Start from a clear structure",
    ],
    Shot: PlanningShot,
  },
  {
    id: "diff",
    kicker: "Review",
    title: "See changes as diagrams, not diffs.",
    body: "Review what changed right in the map — every update appears as a diagram, so you can review fast without reading through code line by line.",
    bullets: [
      "Changes visualized as diagrams",
      "Review quickly, skip the code walls",
      "Live, up to date on every save",
    ],
    Shot: DiffShot,
  },
  {
    id: "workspace",
    kicker: "Workspace",
    title: "Code, diagrams, and agents in one place.",
    body: "Stop switching between your editor, a diagramming tool, and a terminal. CodeChroma keeps the code, the live architecture diagrams, and your AI agents in the same screen.",
    bullets: [
      "Editor, diagrams, and agents side by side",
      "Agents work directly on your real codebase",
      "Diagrams stay in sync as agents change the code",
    ],
    Shot: AllInOneShot,
  },
  {
    id: "why",
    kicker: "Why CodeChroma",
    title: "Your code. Our map.",
    body: "A semantic map of CodeChroma's edge is grounded in the real code, stays live both ways, and keeps everything — projects, agents, and the canvas — in one place.",
    bullets: ["Grounded in the real code", "Live sync, both ways", "Everything in one place"],
    Shot: WhyShot,
  },
];

/* Why — the "your X, our Y" contrast cards, rendered as the shot side. */
const CONTRASTS = [
  {
    them: "Diagrams that drift from the code",
    us: "Grounded in the real code",
    note: "Diagrams are built from the actual source, with every block tied to a specific piece of code — no hallucinations, no invented structure.",
  },
  {
    them: "Docs go stale the moment you edit",
    us: "Live sync, both ways",
    note: "Change the code or the canvas and it updates right away — the map and the source never drift apart.",
  },
  {
    them: "Scattered tools for every task",
    us: "Everything in one place",
    note: "Explore the project, plan it, write it, and review changes — all on the same canvas, without switching tools.",
  },
  {
    them: "One project, one agent at a time",
    us: "Parallel projects & agents",
    note: "Work on several projects at once and run multiple agents in parallel, each in its own window.",
  },
];

function WhyShot() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {CONTRASTS.map((c) => (
        <div
          key={c.us}
          className="rounded-lg border border-[color:var(--border-faint)] bg-[color:var(--surface-0)] p-5"
        >
          <div className="flex items-center gap-2 text-sm text-[color:var(--text-3)]">
            <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[color:var(--border)] text-[10px]">
              ×
            </span>
            {c.them}
          </div>
          <div className="mt-3 flex items-center gap-2 text-lg font-medium text-[color:var(--text-1)]">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[color:var(--added)] text-[10px] text-[#08120c]">
              ✓
            </span>
            {c.us}
          </div>
          <p className="mt-2 text-sm text-[color:var(--text-2)]">{c.note}</p>
        </div>
      ))}
    </div>
  );
}

export default function Showcase() {
  const { index, go, goTo, dragHandlers } = useCarousel(SLIDES.length);
  const slide = SLIDES[index];

  return (
    <section
      id="showcase"
      className="mx-auto flex min-h-[calc(100vh-57px)] max-w-[110rem] flex-col justify-center gap-8 px-5 py-16 sm:px-10 lg:px-6"
    >
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2 lg:gap-16">
        {/* Text column — sizes to its own content; the text block reserves a fixed
            min-height (the tallest slide, "workspace") so the buttons below sit on
            one line across slides and never overlap the text. */}
        <div className="flex touch-pan-y flex-col" {...dragHandlers}>
          <div className="lg:min-h-[380px]">
            <p className="font-mono text-xs tracking-widest" style={{ color: "var(--accent)" }}>
              {slide.kicker}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              {slide.title}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-[color:var(--text-2)] sm:text-lg">
              {slide.body}
            </p>
            <ul className="mt-6 space-y-2 text-sm text-[color:var(--text-2)]">
              {slide.bullets.map((b) => (
                <li key={b} className="flex items-start gap-2">
                  <span className="mt-0.5 text-[color:var(--added)]">✓</span>
                  {b}
                </li>
              ))}
            </ul>
          </div>

          {/* Controls — left/right arrows + progress strip. Below the reserved text
              block, so they stay in one place on every slide. */}
          <div className="flex items-center gap-3 pt-9">
            <Arrow dir="left" onClick={() => go(-1)} label="Previous view" size="lg" />
            <ProgressDots count={SLIDES.length} index={index} onSelect={goTo} labels={SLIDES.map((s) => s.kicker)} />
            <Arrow dir="right" onClick={() => go(1)} label="Next view" size="lg" />
          </div>
        </div>

        {/* Shot column — fixed height so the row (and the arrows below the text) stays put */}
        <div className="flex w-full lg:h-[540px] lg:items-start">
          <div className="w-full">
            <slide.Shot key={slide.id} />
          </div>
        </div>
      </div>

      {/* Always-visible privacy note — independent of the carousel slide. */}
      <div className="rounded-lg border border-[color:var(--border-faint)] bg-[color:var(--surface-1)] px-5 py-4 text-sm leading-relaxed text-[color:var(--text-2)]">
        <span className="font-semibold text-[color:var(--text-1)]">Safe for work projects.</span>{" "}
        Everything in CodeChroma runs locally, on your machine alone.
        You choose the AI provider yourself, so you can use only the ones approved by your
        management.
      </div>
    </section>
  );
}
