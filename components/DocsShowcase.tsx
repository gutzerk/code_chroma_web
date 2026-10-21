"use client";

import { useEffect, useState } from "react";

const publicAsset = (path: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;

/** One section of the docs page. Sections are grouped in the table of contents. */
type Section = {
  id: string;
  group: string;
  label: string;
  title: string;
  blurb: string;
  content: React.ReactNode;
};

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

/* ---- Plan, run, verify: the workflow the product is built around ---- */
const PLAN_POINTS = [
  { title: "Describe it in plain words", body: "Open Draw… and say what you want, for example “add refresh tokens to the auth flow”. The agent asks a question only when the design depends on your answer." },
  { title: "Get a process diagram you own", body: "The feature is drawn on the map as planned blocks: dashed outlines, tagged + ADD for new blocks and ~ MODIFY for existing ones. Nothing has been written yet, so changing your mind costs nothing." },
  { title: "Planned blocks have no code yet", body: "Opening a planned block shows its description instead of a file. The agent creates the file when it runs." },
];
const VERIFY_POINTS = [
  { title: "Same map, now with results", body: "When agents finish, the planned blocks turn solid and show NEW or the size of the change. You compare the result with your plan instead of reading every file." },
  { title: "Spot drift quickly", body: "A block that changed but was never in your plan, or a planned block that never appeared, is the signal to look closer. Open it to see the diff, grouped by the block each line belongs to." },
  { title: "Open the code only when you need to", body: "If the pattern and the whole picture match your design, you do not need to read what is inside. When they do not, every block opens into the exact code behind it." },
  { title: "Review a PR the same way", body: "Paste a GitHub pull request URL to open it as a read-only workspace. Changes appear as diagrams, not walls of diff text." },
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
    body: "Several agents can run at once, each in its own window on the same map. Start a feature, add a second agent for the next one, and go work on something else. Works across multiple projects too, not one at a time.",
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
    body: "Point CodeChroma at any repo. It analyzes the code and builds the semantic map: a zoomable System → Pillar → Component → Service → Function hierarchy.",
  },
  {
    title: "Plan a feature",
    body: "Use the “Draw…” control and describe what you want. The agent draws it on the map as planned blocks, so you decide the design before any code is written.",
  },
  {
    title: "Run agents",
    body: "Click “Run workflow” or “Run agent” to start an agent on the workspace you're viewing. Add more to run in parallel. Each works in its own git worktree, so nothing collides.",
  },
  {
    title: "Verify on the map",
    body: "When agents finish, compare the result with your plan. Blocks that match are done. Open anything that drifted to see the diff.",
  },
  {
    title: "Open the PR",
    body: "Once the map matches your plan, create the pull request from the top bar.",
  },
];

/* ---- Keyboard & CLI ---- */
const KEYBOARD_ROWS = [
  { keys: "Scroll / drag", action: "Pan around the zoomable canvas", input: "Mouse" },
  { keys: "Zoom in / out", action: "Drill into a block or step back from it", input: "Mouse" },
  { keys: "Shift/ctrl-click", action: "Multi-select and drag several blocks together", input: "Mouse" },
  { keys: "Click a tree row", action: "Reveal ancestors and frame the block", input: "Mouse" },
];

/* ---- Troubleshooting ---- */
const TROUBLESHOOTING_ITEMS = [
  {
    title: "The app won't open on macOS",
    body: "The desktop app is unsigned for now. On first launch, right-click the app and choose Open — then confirm in Gatekeeper.",
  },
  {
    title: "Installer refuses to run",
    body: "Every install script verifies the downloaded DMG against the release's published SHA-256 checksum and refuses to proceed when none is present. Re-download from the latest GitHub Release and retry.",
  },
  {
    title: "AI features are unavailable",
    body: "Analysis, the canvas, and live sync run on a deterministic offline summarizer — no key needed. Set ANTHROPIC_API_KEY, or connect a provider in the gear icon's LLM settings, to unlock diagram generation and AI summaries.",
  },
  {
    title: "Connect a different LLM provider",
    body: "Route any feature to a different provider — a CLI tool, a direct-API endpoint, or a local model — from the LLM settings panel. No restart required.",
  },
];

/* ---- Privacy & tokens ---- */
const FAQ_ITEMS = [
  {
    title: "Does CodeChroma send my project anywhere?",
    body: "No. Everything runs locally on your machine, and there is no telemetry. The AI provider is yours: you pick it, so you can use only the ones approved by your management — including a local model.",
  },
  {
    title: "What will it cost in tokens?",
    body: "Exploring the map, the canvas, and live sync run on a built-in offline summarizer and use no tokens. Only AI features (diagram generation, AI summaries, agents) call your provider, and tokens are billed by that provider on your own account.",
  },
];

/* ---- Overview cards ---- */
const OVERVIEW_POINTS = [
  { title: "Design in process diagrams", body: "Describe a feature and see it drawn as planned blocks on the map. You decide the design before an agent writes a line." },
  { title: "Agents build in parallel", body: "Each agent works in its own worktree on the same canvas, so you can start the next thing while they run." },
  { title: "Verify on the same map", body: "Review the result as diagrams. If the pattern and the whole picture match your plan, you do not need to read the code inside." },
  { title: "Local and under your control", body: "Everything runs on your machine, with no telemetry, and you choose the AI provider." },
];

/* ---- Settings (configuration) ---- */
type Setting = { title: string; body: string; scope: string };

const LLM_SETTINGS: Setting[] = [
  { scope: "Agents", title: "Provider", body: "Which LLM service the agents use. Choose the provider you already have an account and key for." },
  { scope: "Agents", title: "Model", body: "The specific model for coding and agent work. More capable models are slower but better at large-scale reasoning across the map." },
  { scope: "Agents", title: "Agent worktree behavior", body: "Whether agents may create their own git worktrees per project. Keeping this on isolates each agent's changes on its own branch." },
];
const APPEARANCE_SETTINGS: Setting[] = [
  { scope: "Canvas", title: "Theme", body: "Pick the app theme. Switching themes re-colors the surfaces and borders." },
  { scope: "Diagram views", title: "View hue accents", body: "Choose the accent colors for each diagram kind — system context, process/patterns, epics, impact, and trace. Highlighted blocks follow the hue they belong to." },
];
const CANVAS_SETTINGS: Setting[] = [
  { scope: "Canvas", title: "Default zoom level", body: "Where the camera lands on open — from the whole System at the top all the way into Components or Functions. Regain control with Fit All anytime." },
  { scope: "Canvas", title: "Auto-fit on open", body: "Frame every open block at startup instead of centering on the project root. Useful when you leave the canvas in a busy, expanded state." },
];
const ENV_SETTINGS: Setting[] = [
  { scope: "Workspaces", title: "Connected projects", body: "Manage which repositories CodeChroma has indexed. Re-index a project when the map looks stale after heavy refactors." },
  { scope: "Workspaces", title: "Default branch", body: "Which branch the canvas follows when a workspace has no explicit selection. Each workspace keeps its own worktree for the branch it shows." },
  { scope: "Terminal", title: "Docked terminal", body: "Set the shell the docked terminal opens with. The session survives open/close, so pending work in the shell stays put." },
];

/* ---- Render helpers ---- */
function Card({ title, body, tag }: { title: string; body: string; tag?: string }) {
  return (
    <div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-1)] p-5">
      {tag && <div className="mb-1.5 font-mono text-xs uppercase tracking-wide text-[color:var(--text-3)]">{tag}</div>}
      <div className="text-lg font-semibold text-[color:var(--text-1)]">{title}</div>
      <p className="mt-1.5 text-base leading-relaxed text-[color:var(--text-2)]">{body}</p>
    </div>
  );
}

function SettingGroup({ title, items }: { title: string; items: Setting[] }) {
  return (
    <div>
      <h3 className="mb-3 text-xl font-semibold tracking-tight text-[color:var(--text-1)]">{title}</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {items.map((s) => (
          <Card key={s.title} title={s.title} body={s.body} tag={s.scope} />
        ))}
      </div>
    </div>
  );
}

/** A looping product clip, muted and inline (files live in /public). */
function Clip({ name, label }: { name: string; label: string }) {
  return (
    <video
      className="block w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-1)]"
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      aria-label={label}
    >
      <source src={publicAsset(`/${name}.webm`)} type="video/webm" />
      <source src={publicAsset(`/${name}.mp4`)} type="video/mp4" />
    </video>
  );
}

/** Table of contents with scroll-spy. Highlights the section currently in view. */
function Toc({ sections, active }: { sections: Section[]; active: string }) {
  return (
    <aside className="hidden lg:sticky lg:top-20 lg:block lg:max-h-[calc(100vh-6rem)] lg:self-start lg:overflow-y-auto lg:pt-12 lg:pb-12">
      <p className="font-mono text-xs tracking-widest text-[color:var(--text-3)]">documentation</p>
      <nav aria-label="Documentation sections" className="mt-4 space-y-1">
        {sections.map((s, i) => {
          const newGroup = i === 0 || sections[i - 1].group !== s.group;
          return (
            <div key={s.id}>
              {newGroup && (
                <div className="px-3 pt-4 font-mono text-[10px] uppercase tracking-widest text-[color:var(--text-3)] first:pt-0">
                  {s.group}
                </div>
              )}
              <a
                href={`#${s.id}`}
                aria-current={s.id === active ? "location" : undefined}
                className={`block rounded-md px-3 py-2 text-base transition-colors ${
                  s.id === active
                    ? "bg-[color:var(--surface-2)] text-[color:var(--text-1)]"
                    : "text-[color:var(--text-2)] hover:bg-[color:var(--surface-2)] hover:text-[color:var(--text-1)]"
                }`}
              >
                {s.label}
              </a>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

export default function DocsShowcase() {
  const [active, setActive] = useState(SECTIONS[0].id);

  // Scroll-spy: the section whose heading is nearest the top of the viewport is the active one.
  useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter((e): e is HTMLElement => !!e);
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: "-80px 0px -65% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Links from older pages: /documentation#faq now lives under "privacy".
  useEffect(() => {
    if (window.location.hash === "#faq") document.getElementById("privacy")?.scrollIntoView();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[18rem_1fr] lg:gap-16">
      <Toc sections={SECTIONS} active={active} />

      <div className="max-w-5xl pt-12 pb-24">
        <header className="mb-4">
          <p className="font-mono text-xs tracking-widest text-[color:var(--accent)]">documentation</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">Plan it, let agents build it, verify it.</h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-[color:var(--text-2)] sm:text-xl">
            Everything you need to keep vibe-coding speed and still own the whole picture: the workflow first, then the
            map, settings and reference.
          </p>
        </header>

        {SECTIONS.map((s) => (
          <section key={s.id} id={s.id} className="scroll-mt-24 border-t border-[color:var(--border-faint)] pt-12 pb-12 first-of-type:border-t-0">
            <p className="font-mono text-xs tracking-widest text-[color:var(--accent)]">{s.group}</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-4xl">{s.title}</h2>
            <p className="mt-3 max-w-3xl text-lg leading-relaxed text-[color:var(--text-2)]">{s.blurb}</p>
            <div className="mt-8 space-y-5">{s.content}</div>
          </section>
        ))}
      </div>
    </div>
  );
}

const SECTIONS: Section[] = [
  {
    id: "quick-start",
    group: "Start here",
    label: "Quick start",
    title: "From repo to verified PR in five steps",
    blurb: "Exploring the map works offline and needs no API key. Add an AI provider when you are ready to run agents.",
    content: (
      <>
        <ol className="space-y-3">
          {QUICK_START_STEPS.map((s, i) => (
            <li key={s.title} className="flex gap-4 rounded-lg border border-[color:var(--border-faint)] bg-[color:var(--surface-1)] p-5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[color:var(--accent)] bg-[color:var(--surface-2)] font-mono text-base text-[color:var(--accent)]">
                {i + 1}
              </span>
              <div>
                <div className="text-lg font-semibold text-[color:var(--text-1)]">{s.title}</div>
                <p className="mt-1 text-base leading-relaxed text-[color:var(--text-2)]">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <Clip name="all-in-one" label="CodeChroma workspace: code, map and agents in one window" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {OVERVIEW_POINTS.map((p) => (
            <Card key={p.title} title={p.title} body={p.body} />
          ))}
        </div>
      </>
    ),
  },
  {
    id: "plan",
    group: "The workflow",
    label: "Plan a feature",
    title: "Plan a feature on the map",
    blurb: "You set the intent first. The agent draws your idea as a process diagram, so agents build your design, not theirs.",
    content: (
      <>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {PLAN_POINTS.map((p) => (
            <Card key={p.title} title={p.title} body={p.body} />
          ))}
        </div>
        <Clip name="planning" label="Planning a feature on the CodeChroma map" />
      </>
    ),
  },
  {
    id: "agents",
    group: "The workflow",
    label: "Run agents in parallel",
    title: "Agents that build while you do something else",
    blurb: "Agents are AI sessions attached to the repo you are viewing, each isolated in its own worktree, all sharing one canvas.",
    content: (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {AGENT_POINTS.map((a) => (
          <Card key={a.title} title={a.title} body={a.body} />
        ))}
      </div>
    ),
  },
  {
    id: "verify",
    group: "The workflow",
    label: "Verify what was built",
    title: "Verify the result as diagrams, not diffs",
    blurb: "Stay responsible for the project without reading every file. Compare what was built with what you planned.",
    content: (
      <>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {VERIFY_POINTS.map((p) => (
            <Card key={p.title} title={p.title} body={p.body} />
          ))}
        </div>
        <Clip name="review" label="Reviewing a change as diagrams on the CodeChroma map" />
      </>
    ),
  },
  {
    id: "diagrams",
    group: "The model",
    label: "Diagram kinds",
    title: "The diagrams you plan and review with",
    blurb: "Diagrams are generated from the real code, tied to it, and kept live. Three kinds cover review, planning, and flow.",
    content: (
      <>
        <div className="space-y-3">
          {DIAGRAM_KINDS.map((d) => (
            <Card key={d.name} title={d.name} body={d.body} tag="diagram kind" />
          ))}
        </div>
        <Clip name="schema-diagram" label="Generating a diagram on the CodeChroma map" />
      </>
    ),
  },
  {
    id: "architecture",
    group: "The model",
    label: "The architecture map",
    title: "Zoom in from System to Function",
    blurb: "CodeChroma turns a repo into a zoomable semantic map of what the code actually does, not its folder layout.",
    content: (
      <div className="space-y-2">
        {LEVELS.map((l, i) => (
          <div key={l.name} className="flex items-start gap-4 rounded-lg border border-[color:var(--border-faint)] bg-[color:var(--surface-1)] px-4 py-3">
            <div className="flex min-w-[7rem] items-center gap-2">
              <span className="font-mono text-xs text-[color:var(--text-3)]">0{i + 1}</span>
              <span className="text-lg font-semibold text-[color:var(--text-1)]">{l.name}</span>
            </div>
            <p className="text-base leading-relaxed text-[color:var(--text-2)]">{l.detail}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "privacy",
    group: "Trust",
    label: "Privacy & token cost",
    title: "Privacy and token cost",
    blurb: "Safe for work projects: everything runs locally, and the AI provider is the one you choose.",
    content: (
      <>
        <span id="faq" aria-hidden="true" />
        <div className="space-y-3">
          {FAQ_ITEMS.map((f) => (
            <Card key={f.title} title={f.title} body={f.body} />
          ))}
        </div>
      </>
    ),
  },
  ...CONTROL_PANELS.map((panel) => ({
    id: `controls-${panel.id}`,
    group: "Controls",
    label: panel.title,
    title: panel.title,
    blurb: panel.blurb,
    content: (
      <div className="divide-y divide-[color:var(--border-faint)] overflow-hidden rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-1)]">
        {panel.controls.map((c) => (
          <div key={c.name} className="flex flex-col gap-6 p-5 sm:flex-row sm:items-start">
            <div className="flex min-w-[9rem] items-center gap-3 sm:flex-col sm:items-start sm:gap-1">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[color:var(--border)] bg-[color:var(--surface-2)] text-base text-[color:var(--accent)]">
                <c.Icon />
              </span>
              <div className="text-lg font-semibold text-[color:var(--text-1)]">{c.name}</div>
            </div>
            <p className="text-base leading-relaxed text-[color:var(--text-2)]">
              {c.what}
              {c.tip && <span className="mt-1 block font-mono text-xs text-[color:var(--accent)]">→ {c.tip}</span>}
            </p>
          </div>
        ))}
      </div>
    ),
  })),
  {
    id: "settings",
    group: "Reference",
    label: "Settings",
    title: "Settings, explained",
    blurb: "The knobs CodeChroma exposes and what each one changes. The one that matters most is the provider and model, because it decides who builds.",
    content: (
      <div className="space-y-10">
        <SettingGroup title="LLM provider & model" items={LLM_SETTINGS} />
        <SettingGroup title="Appearance" items={APPEARANCE_SETTINGS} />
        <SettingGroup title="Canvas defaults" items={CANVAS_SETTINGS} />
        <SettingGroup title="Environment" items={ENV_SETTINGS} />
      </div>
    ),
  },
  {
    id: "navigation",
    group: "Reference",
    label: "Navigation",
    title: "Navigate the map",
    blurb: "The canvas is mouse-native. How to pan, zoom and select.",
    content: (
      <div className="overflow-x-auto rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-1)]">
        <table className="w-full text-left text-base">
          <thead>
            <tr className="border-b border-[color:var(--border-faint)]">
              <th className="px-4 py-3 font-mono text-xs uppercase tracking-widest text-[color:var(--text-3)]">Keys</th>
              <th className="px-4 py-3 font-mono text-xs uppercase tracking-widest text-[color:var(--text-3)]">Action</th>
              <th className="px-4 py-3 font-mono text-xs uppercase tracking-widest text-[color:var(--text-3)]">Input</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[color:var(--border-faint)]">
            {KEYBOARD_ROWS.map((r) => (
              <tr key={r.keys}>
                <td className="px-4 py-3 font-mono text-[color:var(--accent)]">{r.keys}</td>
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
    title: "When something isn't working",
    blurb: "The most common snags are about signing, checksum verification, or LLM provider setup. Each has a concrete fix.",
    content: (
      <div className="space-y-3">
        {TROUBLESHOOTING_ITEMS.map((t) => (
          <Card key={t.title} title={t.title} body={t.body} />
        ))}
      </div>
    ),
  },
];
