"use client";

import { useCarousel } from "./shared/carousel";
import { SectionNav, type Slide } from "./shared/section-nav";

/* ---- Architecture map ---- */
const LEVELS = [
  { name: "System", detail: "The whole repository as one node — the top of the zoom. Where you land when you step all the way out." },
  { name: "Pillar", detail: "Major subsystems that make up the system — how the code is organized at the highest level of intent." },
  { name: "Component", detail: "Modules or packages with a clear responsibility. The unit you usually reason about day to day." },
  { name: "Service", detail: "Runtime services and boundaries — where components talk to each other as separate parts of the system." },
  { name: "Function", detail: "Individual functions and methods. The grain you read when you actually need to change code." },
];

/* ---- Controls ---- */
type Control = {
  Icon: () => React.ReactElement;
  name: string;
  what: string;
  tip?: string;
};

function Stroke({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 16 16" width={16} height={16} fill="none" aria-hidden="true">
      {children}
    </svg>
  );
}

type ControlPanel = {
  id: string;
  title: string;
  blurb: string;
  controls: Control[];
};

const CONTROL_PANELS: ControlPanel[] = [
  {
    id: "left-rail",
    title: "Left rail — shape the map",
    blurb: "Zoom, panels, and adding diagrams. These live in the vertical strip on the far left.",
    controls: [
  {
    Icon: () => (
      <Stroke>
        <text x="8" y="11.5" textAnchor="middle" fontSize="11" fill="currentColor">−</text>
      </Stroke>
    ),
    name: "Zoom out",
    what: "Steps back to see more of the map. Useful when the block you want is just off-screen and you'd rather not drag the camera.",
  },
  {
    Icon: () => (
      <Stroke>
        <text x="8" y="11.5" textAnchor="middle" fontSize="11" fill="currentColor">⊙</text>
      </Stroke>
    ),
    name: "Reset zoom",
    what: "Returns the camera to 100% and re-centers on the project root — a clean known frame after you've panned and zoomed around.",
  },
  {
    Icon: () => (
      <Stroke>
        <text x="8" y="11.5" textAnchor="middle" fontSize="11" fill="currentColor">+</text>
      </Stroke>
    ),
    name: "Zoom in",
    what: "Drills into the map to read a block closely without moving it off-center.",
  },
  {
    Icon: () => (
      <Stroke>
        <path fill="none" stroke="currentColor" strokeWidth="1.3" d="M1.65 3.15h12.7v9.7H1.65z" />
        <path fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" d="m4.2 6.4 1.8 1.6-1.8 1.6M8.2 10.2h3.4" />
      </Stroke>
    ),
    name: "Terminal",
    what: "Docks a real terminal under the canvas. Run git, the engine, or any shell work without leaving the app; the session survives open/close.",
    tip: "The app is a full dev environment, not just a viewer.",
  },
  {
    Icon: () => (
      <Stroke>
        <rect x="6" y="1.6" width="4" height="3" fill="none" stroke="currentColor" strokeWidth="1.3" />
        <rect x="1.6" y="10.9" width="4" height="3" fill="none" stroke="currentColor" strokeWidth="1.3" />
        <rect x="10.4" y="10.9" width="4" height="3" fill="none" stroke="currentColor" strokeWidth="1.3" />
        <path fill="none" stroke="currentColor" strokeWidth="1.2" d="M8 4.6v3.2M8 7.8H3.6v3.1M8 7.8h4.4v3.1" />
      </Stroke>
    ),
    name: "Project tree",
    what: "Sidebar with the file tree next to the canvas. Clicking a row reveals that node's ancestors on the map and frames the block.",
  },
  {
    Icon: () => (
      <Stroke>
        <rect x="1.8" y="1.8" width="5.4" height="5.4" fill="none" stroke="currentColor" strokeWidth="1.3" strokeDasharray="1.6 1.4" />
        <rect x="8.8" y="1.8" width="5.4" height="5.4" fill="none" stroke="currentColor" strokeWidth="1.3" />
        <rect x="5.3" y="8.8" width="5.4" height="5.4" fill="none" stroke="currentColor" strokeWidth="1.3" />
      </Stroke>
    ),
    name: "Draw…",
    what: "Opens an AI agent that asks what diagram you'd like, then draws it with the codechroma-draw-diagram skill — C1 system context, patterns, impact, sequence, epics, or a custom diagram. Every drawn diagram is managed from the agent rail's Diagrams tab.",
  },
    ],
  },
  {
    id: "canvas",
    title: "On the canvas — the view",
    blurb: "Controls pinned to the canvas itself — one floating button, plus selection and dragging.",
    controls: [
  {
    Icon: () => (
      <Stroke>
        <path fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" d="M8 1.8 14.2 5 8 8.2 1.8 5z" />
        <path fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" d="M1.8 8.4 8 11.6l6.2-3.2" />
        <path fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" d="M1.8 11.4 8 14.6l6.2-3.2" />
      </Stroke>
    ),
    name: "Fit All",
    what: "Fits every currently open block into view — one click to see the whole expanded picture at once. Label rather than glyph: a plain button floating on the canvas.",
  },
  {
    Icon: () => (
      <Stroke>
        <rect x="3" y="3.5" width="4" height="4" fill="none" stroke="currentColor" strokeWidth="1.3" />
        <rect x="9.6" y="3.5" width="4" height="4" fill="none" stroke="currentColor" strokeWidth="1.3" />
        <rect x="3" y="10" width="4" height="4" fill="none" stroke="currentColor" strokeWidth="1.3" />
        <rect x="9.6" y="10" width="4" height="4" fill="none" stroke="currentColor" strokeWidth="1.3" />
      </Stroke>
    ),
    name: "Multi-select & drag",
    what: "Shift/ctrl-click a block — or drag a marquee around several — to select them together, then drag to move the whole group in step. Clicking one unselected block collapses the selection down to it.",
  },
    ],
  },
  {
    id: "top-bar",
    title: "Top bar — run your work",
    blurb: "Branches, settings, agents, and pull requests. These live in the strip above the canvas.",
    controls: [
  {
    Icon: () => (
      <Stroke>
        <circle cx="4" cy="3" r="1.6" fill="none" stroke="currentColor" strokeWidth="1.3" />
        <circle cx="4" cy="13" r="1.6" fill="none" stroke="currentColor" strokeWidth="1.3" />
        <circle cx="12" cy="3" r="1.6" fill="none" stroke="currentColor" strokeWidth="1.3" />
        <path fill="none" stroke="currentColor" strokeWidth="1.3" d="M4 4.6v6.8" />
        <path fill="none" stroke="currentColor" strokeWidth="1.3" d="M4 7.4c0 2.4 8 2.4 8 0V4.6" />
      </Stroke>
    ),
    name: "Branch switcher",
    what: "Switches which branch of the repo the map shows. Each workspace keeps its own worktree, so the canvas follows the branch.",
  },
  {
    Icon: () => (
      <Stroke>
        <circle cx="4" cy="3.2" r="1.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
        <circle cx="4" cy="12.8" r="1.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
        <circle cx="12" cy="3.2" r="1.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
        <path fill="none" stroke="currentColor" strokeWidth="1.3" d="M4 4.7v6.6" />
        <path fill="none" stroke="currentColor" strokeWidth="1.3" d="M12 4.7v4.4" />
        <path fill="currentColor" d="M12 13.1 10.1 9.6h3.8z" />
      </Stroke>
    ),
    name: "Review a pull request",
    what: "Opens an existing GitHub pull request as a workspace on the map. Review happens visually — changes appear as diagrams.",
  },
  {
    Icon: () => (
      <Stroke>
        <circle cx="8" cy="8" r="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" d="M6.6 2.4l.4-1.2h2l.4 1.2 1.1.5 1.1-.5 1 1.7-.4 1.1.4 1.1-.1 1.2 1.1.9.8 1.9-1.2 1.1-.6.7.1 1.3-1.7.9-1.2-.1-1 .4-.6.7-2-.3-1.1-.3v-1.1l-1.1-.8-.9.2-1.5-.6-.3-2 .6-1.2 1-.2v-1.2l.9-1.2.9.2.8-.4z" />
      </Stroke>
    ),
    name: "Settings",
    what: "App settings, including which LLM provider and model the agents use.",
  },
  {
    Icon: () => (
      <Stroke>
        <path fill="none" stroke="currentColor" strokeWidth="1.3" d="M1.65 2.15h9.7v7.7h-9.7z" />
        <path fill="none" stroke="currentColor" strokeWidth="1.3" d="M4.65 6.15h9.7v7.7h-9.7z" />
      </Stroke>
    ),
    name: "Run agent",
    what: "Launches an AI agent attached to the workspace you're viewing. It works in its own window on the same map — a real parallel reviewer/writer.",
    tip: "Run several agents at once, each in its own window, across multiple projects.",
  },
    ],
  },
];

/* ---- Agents ---- */
const AGENT_POINTS = [
  {
    title: "One agent = one worktree",
    body: "Each agent runs in its own git worktree on its own branch. The canvas follows which workspace you're viewing, so the map never mixes branches.",
  },
  {
    title: "Attached to what you see",
    body: "The “Run agent” button attaches the new agent to the workspace the canvas currently shows — the main repo, another agent, or a PR review workspace.",
  },
  {
    title: "Truly parallel",
    body: "Several agents can run at once, each in its own window on the same map. Works across multiple projects too, not one at a time.",
  },
  {
    title: "Artifacts stay in the worktree",
    body: "An agent's outputs live in its own worktree's .codechroma. Closing an agent's window keeps the files by default — a deliberate trade so nothing is deleted unless you remove it by hand.",
  },
];

/* ---- Diagrams ---- */
const DIAGRAM_KINDS = [
  { name: "Sequence", body: "How the system actually works at runtime: the flow from request to response, who calls what, and the order of steps between components." },
  { name: "Impact", body: "Built for code review. Turns the same git diff into one card per changed symbol, pinned to the nearest existing block. See what a change touches before you merge — changes render as diagrams, not walls of diff text." },
  { name: "Epics", body: "One chosen work item at a time — its acceptance criteria, stories, references, and delivery artifacts as connected boxes, derived from files on disk. A deterministic planning view: nothing is invented." },
];

/* ---- Quick start (step by step) ---- */
const QUICK_START_STEPS = [
  {
    title: "Open a repository",
    body: "Point CodeChroma at any repo — local or via the app. It analyzes the code and builds the semantic map: a zoomable System → Pillar → Component → Service → Function hierarchy.",
  },
  {
    title: "Navigate the map",
    body: "Zoom in from the whole system to individual functions. Every block is expandable in place — no reload, no switching between files.",
  },
  {
    title: "Run an agent",
    body: "Click “Run agent” to attach a Claude session to the workspace you're viewing. It works in its own window on the same map, isolated in its own git worktree.",
  },
  {
    title: "Generate a diagram",
    body: "Use the “Draw…” control to ask for a C1 context, design-patterns, impact, sequence, epics, or custom diagram — drawn from the real code.",
  },
  {
    title: "Review a PR",
    body: "Paste a GitHub pull request URL to open it as a read-only workspace. Changes appear as diagrams, not walls of diff text.",
  },
];

/* ---- Keyboard & CLI ---- */
const KEYBOARD_ROWS = [
  { keys: "Scroll / drag", action: "Pan around the zoomable canvas", input: "Mouse" },
  { keys: "Zoom in / out", action: "Drill into a block or step back from it", input: "Mouse" },
  { keys: "Shift/ctrl-click", action: "Multi-select and drag several blocks together", input: "Mouse" },
  { keys: "Click a tree row", action: "Reveal ancestors and frame the block", input: "Mouse" },
  { keys: "Ctrl-C", action: "Stop the bridge and web app together (dev run)", input: "Keyboard" },
];

/* ---- Troubleshooting ---- */
const TROUBLESHOOTING_ITEMS = [
  {
    title: "The app won't open on macOS",
    body: "The desktop app is unsigned for now. On first launch, right-click the app and choose Open — then confirm in Gatekeeper.",
    detail: "Fix",
  },
  {
    title: "Installer refuses to run",
    body: "Every install script verifies the downloaded DMG against the release's published SHA-256 checksum and refuses to proceed when none is present. Re-download from the latest GitHub Release and retry.",
    detail: "Fix",
  },
  {
    title: "AI features are unavailable",
    body: "Analysis, the canvas, and live sync run on a deterministic offline summarizer — no key needed. Set ANTHROPIC_API_KEY, or connect a provider in the gear icon's LLM settings, to unlock diagram generation and AI summaries.",
    detail: "Fix",
  },
  {
    title: "Connect a different LLM provider",
    body: "Route any feature to a different provider — a CLI tool, a direct-API endpoint, or a local model — from the LLM settings panel. No restart required.",
    detail: "Config",
  },
];

/* ---- Overview cards ---- */
const OVERVIEW_POINTS = [
  { title: "A semantic map, not a folder tree", body: "Zoomable levels — System, Pillar, Component, Service, Function — match how you actually reason about a codebase." },
  { title: "Controls that shape the map", body: "The left rail zooms and draws, the canvas holds one floating control, and the top bar runs your work." },
  { title: "Agents attached to what you see", body: "Each agent works in its own worktree on the same canvas, in parallel with the rest of your projects." },
  { title: "Diagrams that earn their place", body: "Sequence, impact, and epics diagrams are generated from real code, tied to it, and kept live." },
];

/* ---- Render helpers ---- */
function Card({
  title,
  body,
  tag,
  detail,
}: {
  title: string;
  body: string;
  tag?: string;
  /** Small mono badge pinned to the right edge — reuse for troubleshooting fixes. */
  detail?: string;
}) {
  return (
    <div className="flex items-start gap-4 rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-0)] p-5">
      <div className="min-w-0 flex-1">
        {tag && <div className="mb-1.5 font-mono text-[10px] uppercase tracking-wide text-[color:var(--text-3)]">{tag}</div>}
        <div className="text-sm font-semibold text-[color:var(--text-1)]">{title}</div>
        <p className="mt-1.5 text-sm leading-relaxed text-[color:var(--text-2)]">{body}</p>
      </div>
      {detail && (
        <span className="mt-0.5 shrink-0 rounded-md border border-[color:var(--border)] px-2 py-1 font-mono text-[10px] uppercase tracking-wide text-[color:var(--accent)]">
          {detail}
        </span>
      )}
    </div>
  );
}

export default function DocsShowcase() {
  const { index, go, goTo, dragHandlers } = useCarousel(SLIDES.length);
  const slide = SLIDES[index];

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[20rem_1fr] lg:gap-16">
      {/* Left panel — switch sections */}
      <SectionNav eyebrow="documentation" slides={SLIDES} index={index} go={go} goTo={goTo} />

      {/* Content */}
      <div className="max-w-5xl pt-12 pb-24">
        <header>
          <p className="font-mono text-xs tracking-widest text-[color:var(--accent)]">{slide.kicker}</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">{slide.title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[color:var(--text-2)] sm:text-lg">
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

const SLIDES: Slide[] = [
  {
    id: "overview",
    group: "Overview",
    label: "How it works",
    kicker: "docs / overview",
    title: "How CodeChroma works.",
    blurb: "The canvas is a full dev environment in one view — a zoomable semantic map of your repo, controls to shape it, agents to work it, and diagrams to plan and review.",
    content: (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {OVERVIEW_POINTS.map((p) => (
          <Card key={p.title} title={p.title} body={p.body} />
        ))}
      </div>
    ),
  },
  {
    id: "quick-start",
    group: "Start here",
    label: "Quick start",
    kicker: "start here",
    title: "From repo to running agent in five steps",
    blurb: "Works on a deterministic offline summarizer — no API key needed to explore. The quick path from opening a repository to running agents and diagrams.",
    content: (
      <ol className="space-y-3">
        {QUICK_START_STEPS.map((s, i) => (
          <li key={s.title} className="flex gap-4 rounded-lg border border-[color:var(--border-faint)] bg-[color:var(--surface-0)] p-5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[color:var(--accent)] bg-[color:var(--surface-2)] font-mono text-sm text-[color:var(--accent)]">
              {i + 1}
            </span>
            <div>
              <div className="text-sm font-semibold text-[color:var(--text-1)]">{s.title}</div>
              <p className="mt-1 text-sm leading-relaxed text-[color:var(--text-2)]">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
    ),
  },
  {
    id: "architecture",
    group: "The model",
    label: "Architecture map",
    kicker: "architecture map",
    title: "Zoom in from System to Function",
    blurb: "CodeChroma turns a repo into a zoomable semantic map of what the code actually does — not its folder layout. Zoom levels match how you actually reason about a system.",
    content: (
      <div className="space-y-2">
        {LEVELS.map((l, i) => (
          <div key={l.name} className="flex items-start gap-4 rounded-lg border border-[color:var(--border-faint)] bg-[color:var(--surface-0)] px-4 py-3">
            <div className="flex min-w-[7rem] items-center gap-2">
              <span className="font-mono text-xs text-[color:var(--text-3)]">0{i + 1}</span>
              <span className="text-sm font-semibold text-[color:var(--text-1)]">{l.name}</span>
            </div>
            <p className="text-sm leading-relaxed text-[color:var(--text-2)]">{l.detail}</p>
          </div>
        ))}
      </div>
    ),
  },
  // Controls is split into one slide per panel (Left rail / On the canvas / Top bar).
  ...CONTROL_PANELS.map((panel) => ({
    id: `controls-${panel.id}`,
    group: "Controls",
    label: panel.title,
    kicker: "interface",
    title: panel.title,
    blurb: panel.blurb,
    content: (
      <div className="divide-y divide-[color:var(--border-faint)] overflow-hidden rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-0)]">
        {panel.controls.map((c) => (
          <div key={c.name} className="flex flex-col gap-6 p-5 sm:flex-row sm:items-start">
            <div className="flex min-w-[9rem] items-center gap-3 sm:flex-col sm:items-start sm:gap-1">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[color:var(--border)] bg-[color:var(--surface-2)] text-sm text-[color:var(--accent)]">
                <c.Icon />
              </span>
              <div className="text-sm font-semibold text-[color:var(--text-1)]">{c.name}</div>
            </div>
            <p className="text-sm leading-relaxed text-[color:var(--text-2)]">
              {c.what}
              {c.tip && <span className="mt-1 block font-mono text-xs text-[color:var(--accent)]">→ {c.tip}</span>}
            </p>
          </div>
        ))}
      </div>
    ),
  })),
  {
    id: "agents",
    group: "Automation",
    label: "Agents",
    kicker: "automation",
    title: "Agents that work the map with you",
    blurb: "CodeChroma's agents are real Claude sessions attached to the repo you're viewing — each isolated in its own worktree, all sharing one canvas.",
    content: (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {AGENT_POINTS.map((a) => (
          <Card key={a.title} title={a.title} body={a.body} />
        ))}
      </div>
    ),
  },
  {
    id: "diagrams",
    group: "Planning & review",
    label: "Diagrams",
    kicker: "planning & review",
    title: "Diagrams that earn their place",
    blurb: "Diagrams are generated from the real code, tied to it, and kept live — three kinds cover review, planning, and flow.",
    content: (
      <div className="space-y-3">
        {DIAGRAM_KINDS.map((d) => (
          <Card key={d.name} title={d.name} body={d.body} tag="diagram kind" />
        ))}
      </div>
    ),
  },
  {
    id: "keyboard",
    group: "Reference",
    label: "Navigation",
    kicker: "reference",
    title: "Navigate the map",
    blurb: "The canvas is mouse-native, with a keyboard path to match. How to pan, zoom, select, and stop a dev run.",
    content: (
      <div className="overflow-hidden rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-0)]">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[color:var(--border-faint)]">
              <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-[color:var(--text-3)]">Keys</th>
              <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-[color:var(--text-3)]">Action</th>
              <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-[color:var(--text-3)]">Input</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[color:var(--border-faint)]">
            {KEYBOARD_ROWS.map((r) => (
              <tr key={r.keys}>
                <td className="whitespace-normal px-4 py-3 font-mono text-[color:var(--accent)]">{r.keys}</td>
                <td className="px-4 py-3 text-[color:var(--text-2)]">{r.action}</td>
                <td className="px-4 py-3 text-[color:var(--text-3)]">{r.input}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),
  },
  {
    id: "troubleshooting",
    group: "Reference",
    label: "Troubleshooting",
    kicker: "reference",
    title: "When something isn't working",
    blurb: "The most common snags are about signing, checksum verification, or LLM provider setup — each has a concrete fix.",
    content: (
      <div className="space-y-3">
        {TROUBLESHOOTING_ITEMS.map((t) => (
          <Card key={t.title} title={t.title} body={t.body} detail={t.detail} />
        ))}
      </div>
    ),
  },
];
