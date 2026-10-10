"use client";

import { useCarousel } from "./shared/carousel";
import { SectionNav, type Slide } from "./shared/section-nav";

type Setting = {
  title: string;
  body: string;
  scope: string;
};

/* ---- Model ---- */
const LLM_SETTINGS: Setting[] = [
  {
    scope: "Agents",
    title: "Provider",
    body: "Which LLM service the agents use. Choose the provider you already have an account and key for.",
  },
  {
    scope: "Agents",
    title: "Model",
    body: "The specific model for coding and agent work. More capable models are slower but better at large-scale reasoning across the map.",
  },
  {
    scope: "Agents",
    title: "Agent worktree behavior",
    body: "Whether agents may create their own git worktrees per project. Keeping this on isolates each agent's changes on its own branch.",
  },
];

/* ---- Appearance ---- */
const APPEARANCE_SETTINGS: Setting[] = [
  {
    scope: "Canvas",
    title: "Theme",
    body: "Pick the app theme. The landing shares the dark dev-tool look by default; switching themes re-colors the surfaces and borders.",
  },
  {
    scope: "Diagram views",
    title: "View hue accents",
    body: "Choose the accent colors for each diagram kind — system context, process/patterns, epics, impact, and trace. Highlighted blocks follow the hue they belong to.",
  },
];

/* ---- Canvas defaults ---- */
const CANVAS_SETTINGS: Setting[] = [
  {
    scope: "Canvas",
    title: "Default zoom level",
    body: "Where the camera lands on open — from the whole System at the top all the way into Components or Functions. Regain control with Fit All anytime.",
  },
  {
    scope: "Canvas",
    title: "Auto-fit on open",
    body: "Frame every open block at startup instead of centering on the project root. Useful when you leave the canvas in a busy, expanded state.",
  },
];

/* ---- Environment ---- */
const ENV_SETTINGS: Setting[] = [
  {
    scope: "Workspaces",
    title: "Connected projects",
    body: "Manage which repositories CodeChroma has indexed. Re-index a project when the map looks stale after heavy refactors.",
  },
  {
    scope: "Workspaces",
    title: "Default branch",
    body: "Which branch the canvas follows when a workspace has no explicit selection. Each workspace keeps its own worktree for the branch it shows.",
  },
  {
    scope: "Terminal",
    title: "Docked terminal",
    body: "Set the shell the docked terminal opens with. The session survives open/close, so pending work in the shell stays put.",
  },
];

function Card({ s }: { s: Setting }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-0)] p-5">
      <div className="font-mono text-xs uppercase tracking-wide text-[color:var(--text-3)]">{s.scope}</div>
      <div className="text-lg font-semibold text-[color:var(--text-1)]">{s.title}</div>
      <p className="mt-1 text-base leading-relaxed text-[color:var(--text-2)]">{s.body}</p>
    </div>
  );
}

const SLIDES: Slide[] = [
  {
    id: "overview",
    group: "Overview",
    label: "How it works",
    kicker: "configuration / overview",
    title: "Every setting, explained.",
    blurb: "From the model that powers your agents to how the canvas opens — these are the knobs CodeChroma exposes and what each one changes.",
    content: (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[
          { title: "One place for the model", body: "The provider and model you pick power the agents — one setting, one surface." },
          { title: "Appearance mirrors the map", body: "Theme and the per-view hue accents keep the settings in the same visual language as the canvas." },
          { title: "Canvas opens your way", body: "Default zoom and auto-fit set how the map greets you, so you start where you left off." },
          { title: "Environment is your setup", body: "Connected projects, default branches, and the docked terminal all live under Environment." },
        ].map((p) => (
          <Card
            key={p.title}
            s={{ scope: "Settings", title: p.title, body: p.body }}
          />
        ))}
      </div>
    ),
  },
  {
    id: "model",
    group: "Model",
    label: "LLM provider & model",
    kicker: "model",
    title: "LLM provider & model",
    blurb: "What powers your agents. The one setting that controls how they build and reason across the map.",
    content: (
      <div className="space-y-3">
        {LLM_SETTINGS.map((s) => (
          <Card key={s.title} s={s} />
        ))}
      </div>
    ),
  },
  {
    id: "appearance",
    group: "Appearance",
    label: "Appearance",
    kicker: "view",
    title: "Appearance",
    blurb: "How the canvas and its diagrams look. Tune the surfaces, accents, and per-view hues to your taste.",
    content: (
      <div className="space-y-3">
        {APPEARANCE_SETTINGS.map((s) => (
          <Card key={s.title} s={s} />
        ))}
      </div>
    ),
  },
  {
    id: "canvas",
    group: "Canvas",
    label: "Canvas defaults",
    kicker: "canvas",
    title: "Canvas defaults",
    blurb: "What the map shows when you open it. Set a frame that suits how you actually work.",
    content: (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {CANVAS_SETTINGS.map((s) => (
          <Card key={s.title} s={s} />
        ))}
      </div>
    ),
  },
  {
    id: "environment",
    group: "Environment",
    label: "Environment",
    kicker: "environment",
    title: "Environment",
    blurb: "Your working setup: repos you've connected, branches on the canvas, and the docked terminal.",
    content: (
      <div className="space-y-3">
        {ENV_SETTINGS.map((s) => (
          <Card key={s.title} s={s} />
        ))}
      </div>
    ),
  },
];

export default function SettingsShowcase() {
  const { index, go, goTo, dragHandlers } = useCarousel(SLIDES.length);
  const slide = SLIDES[index];

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[20rem_1fr] lg:gap-16">
      {/* Left panel — switch sections */}
      <SectionNav eyebrow="configuration" slides={SLIDES} index={index} go={go} goTo={goTo} arrowGap="gap-3" />

      {/* Content */}
      <div className="max-w-6xl pt-12 pb-12 lg:min-h-[calc(100vh-6rem)]">
        <header>
          <p className="font-mono text-xs tracking-widest text-[color:var(--accent)]">{slide.kicker}</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">{slide.title}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-[color:var(--text-2)] sm:text-xl">
            {slide.blurb}
          </p>
        </header>

        <div
          className="mt-8 touch-pan-y space-y-4"
          key={slide.id}
          {...dragHandlers}
        >
          {slide.content}
        </div>
      </div>
    </div>
  );
}
