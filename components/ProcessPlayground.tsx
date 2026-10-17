"use client";

import { useMemo, useState } from "react";

type Detail = "overview" | "detailed" | "steps";
type Node = { id: string; title: string; meta: string; tone: string; x: number; y: number };

const EXAMPLES = [
  "How a user signs in with OAuth",
  "How an order gets paid",
  "How a release reaches production",
];

const FLOWS: Record<string, { title: string; nodes: Node[] }> = {
  auth: {
    title: "OAuth sign-in",
    nodes: [
      { id: "user", title: "User", meta: "Browser / mobile", tone: "blue", x: 7, y: 46 },
      { id: "app", title: "Web app", meta: "Start sign-in", tone: "blue", x: 30, y: 46 },
      { id: "oauth", title: "OAuth provider", meta: "Authenticate", tone: "violet", x: 55, y: 46 },
      { id: "api", title: "API", meta: "Verify token", tone: "green", x: 78, y: 46 },
    ],
  },
  checkout: {
    title: "Payment flow",
    nodes: [
      { id: "customer", title: "Customer", meta: "Checkout", tone: "blue", x: 5, y: 46 },
      { id: "store", title: "Storefront", meta: "Create order", tone: "blue", x: 25, y: 46 },
      { id: "orders", title: "Order service", meta: "Reserve items", tone: "green", x: 47, y: 46 },
      { id: "pay", title: "Payment API", meta: "Authorize", tone: "violet", x: 69, y: 46 },
      { id: "events", title: "Event bus", meta: "Payment confirmed", tone: "amber", x: 84, y: 46 },
    ],
  },
  deploy: {
    title: "Production release",
    nodes: [
      { id: "dev", title: "Developer", meta: "Push commit", tone: "blue", x: 5, y: 46 },
      { id: "git", title: "Git provider", meta: "Open PR", tone: "violet", x: 25, y: 46 },
      { id: "ci", title: "CI pipeline", meta: "Build & test", tone: "green", x: 47, y: 46 },
      { id: "registry", title: "Image registry", meta: "Publish image", tone: "amber", x: 68, y: 46 },
      { id: "prod", title: "Production", meta: "Deploy service", tone: "blue", x: 85, y: 46 },
    ],
  },
  custom: {
    title: "Your process",
    nodes: [
      { id: "start", title: "Trigger", meta: "Request received", tone: "blue", x: 7, y: 46 },
      { id: "route", title: "Coordinator", meta: "Route request", tone: "violet", x: 30, y: 46 },
      { id: "service", title: "Core service", meta: "Run process", tone: "green", x: 55, y: 46 },
      { id: "store", title: "Data store", meta: "Persist result", tone: "amber", x: 78, y: 46 },
    ],
  },
};

const DETAIL_NODES: Record<Detail, Node[]> = {
  overview: [],
  detailed: [
    { id: "policy", title: "Policy check", meta: "Scopes & access", tone: "amber", x: 42, y: 17 },
    { id: "store-detail", title: "State store", meta: "Persist changes", tone: "green", x: 67, y: 75 },
  ],
  steps: [
    { id: "validate", title: "Validate input", meta: "Schema & fields", tone: "amber", x: 18, y: 17 },
    { id: "policy", title: "Policy check", meta: "Scopes & access", tone: "violet", x: 42, y: 75 },
    { id: "store-detail", title: "Write state", meta: "Commit result", tone: "green", x: 67, y: 17 },
  ],
};

function resolveFlow(prompt: string) {
  const normalized = prompt.toLowerCase();
  if (/oauth|sign.?in|auth|login|вход|авторизац/.test(normalized)) return FLOWS.auth;
  if (/order|pay|checkout|заказ|оплат/.test(normalized)) return FLOWS.checkout;
  if (/deploy|release|production|выкат|релиз|депло/.test(normalized)) return FLOWS.deploy;
  return { ...FLOWS.custom, title: prompt.trim().replace(/[?.!]+$/, "") || FLOWS.custom.title };
}

export default function ProcessPlayground() {
  const [prompt, setPrompt] = useState(EXAMPLES[0]);
  const [submitted, setSubmitted] = useState(EXAMPLES[0]);
  const [detail, setDetail] = useState<Detail>("overview");
  const flow = useMemo(() => resolveFlow(submitted), [submitted]);
  const nodes = [...flow.nodes, ...DETAIL_NODES[detail]];

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!prompt.trim()) return;
    setSubmitted(prompt.trim());
  }

  return (
    <section className="mx-auto max-w-[110rem] px-5 py-20 sm:px-10 lg:px-6" aria-labelledby="process-playground-title">
      <div className="mb-9 max-w-3xl">
        <p className="font-mono text-xs tracking-[.18em]" style={{ color: "var(--accent)" }}>FROM A PROMPT TO A LIVING MAP</p>
        <h2 id="process-playground-title" className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Any process. The detail you need.</h2>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-[color:var(--text-2)] sm:text-lg">
          Describe a workflow in your own words, then move from a system overview into the steps, checks, and data behind it.
        </p>
      </div>

      <div className="grid overflow-hidden rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-1)] lg:grid-cols-[minmax(280px,360px)_1fr]">
        <form onSubmit={submit} className="flex flex-col gap-5 border-b border-[color:var(--border)] p-5 sm:p-7 lg:border-b-0 lg:border-r">
          <label htmlFor="process-prompt" className="text-sm font-medium text-[color:var(--text-1)]">Describe a process</label>
          <textarea
            id="process-prompt"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            rows={3}
            className="w-full resize-y rounded-md border border-[color:var(--border)] bg-[color:var(--surface-code)] p-3 text-sm leading-relaxed text-[color:var(--text-1)] outline-none transition focus:border-[color:var(--accent)]"
            placeholder="For example: how an order gets paid"
          />
          <div className="flex flex-wrap gap-2" aria-label="Example prompts">
            {EXAMPLES.map((example) => <button
              key={example}
              type="button"
              onClick={() => setPrompt(example)}
              className="rounded-full border border-[color:var(--border)] px-2.5 py-1.5 text-left text-xs text-[color:var(--text-2)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--text-1)]"
            >{example}</button>)}
          </div>

          <fieldset className="mt-1">
            <legend className="mb-2 text-sm font-medium text-[color:var(--text-1)]">Level of detail</legend>
            <div className="grid grid-cols-3 gap-1 rounded-md border border-[color:var(--border)] bg-[color:var(--surface-code)] p-1">
              {([
                ["overview", "Overview"], ["detailed", "Detailed"], ["steps", "Step by step"],
              ] as const).map(([key, label]) => <button
                key={key}
                type="button"
                aria-pressed={detail === key}
                onClick={() => setDetail(key)}
                className="min-h-9 rounded px-1 text-xs text-[color:var(--text-2)] transition aria-pressed:bg-[color:var(--surface-3)] aria-pressed:text-[color:var(--text-1)]"
              >{label}</button>)}
            </div>
          </fieldset>

          <button type="submit" className="mt-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[color:var(--accent)] px-4 text-sm font-semibold text-[#101722] transition hover:brightness-110">
            Build preview <span aria-hidden="true">↗</span>
          </button>
          <p className="-mt-2 text-xs leading-relaxed text-[color:var(--text-3)]">Interactive product preview · sample workflows</p>
        </form>

        <div className="min-w-0 p-4 sm:p-6 lg:p-7">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--text-3)]">Generated process</p>
              <h3 className="mt-1 text-lg font-medium text-[color:var(--text-1)]">{flow.title}</h3>
            </div>
            <span className="rounded-full border border-[color:var(--border)] px-2.5 py-1 font-mono text-[10px] text-[color:var(--text-2)]">{nodes.length} blocks · {detail === "steps" ? "step view" : `${detail} view`}</span>
          </div>
          <div className="overflow-x-auto rounded-lg border border-[#29405a] bg-[#0b1725]">
          <div className="relative min-h-[290px] min-w-[700px] overflow-hidden sm:min-w-0 sm:min-h-[350px]">
            <div className="absolute inset-0 opacity-40" aria-hidden="true" style={{ backgroundImage: "linear-gradient(rgba(136,174,208,.09) 1px, transparent 1px),linear-gradient(90deg,rgba(136,174,208,.09) 1px,transparent 1px)", backgroundSize: "24px 24px" }} />
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              {flow.nodes.slice(0, -1).map((node, index) => {
                const next = flow.nodes[index + 1];
                return <g key={`${node.id}-${next.id}`}>
                  <path d={`M ${node.x + 8} ${node.y + 4} C ${(node.x + next.x) / 2} ${node.y + 4}, ${(node.x + next.x) / 2} ${next.y + 4}, ${next.x} ${next.y + 4}`} fill="none" stroke="#83a8cc" strokeWidth=".55" vectorEffect="non-scaling-stroke" />
                  <path d={`M ${next.x - .8} ${next.y + 3.2} l 1.4 .8 -1.4 .8`} fill="none" stroke="#b8cee2" strokeWidth=".55" vectorEffect="non-scaling-stroke" />
                </g>;
              })}
              {DETAIL_NODES[detail].map((extra) => {
                const nearest = [...flow.nodes].sort((a, b) => Math.abs(a.x - extra.x) - Math.abs(b.x - extra.x))[0];
                return <path key={`edge-${extra.id}`} d={`M ${nearest.x + 8} ${nearest.y + 4} C ${nearest.x + 14} ${nearest.y + 4}, ${extra.x + 4} ${extra.y + 4}, ${extra.x} ${extra.y + 4}`} fill="none" stroke="#8194a8" strokeWidth=".45" strokeDasharray="2 1.5" vectorEffect="non-scaling-stroke" />;
              })}
            </svg>
            {nodes.map((node) => <div
              key={node.id}
              className={`absolute z-10 w-[112px] -translate-y-1/2 rounded-md border bg-[#17283a] px-2 py-2 shadow-lg sm:w-[142px] sm:px-3 ${
                node.tone === "violet" ? "border-violet-300/70" : node.tone === "green" ? "border-emerald-300/70" : node.tone === "amber" ? "border-amber-300/70" : "border-sky-300/70"
              }`}
              style={{ left: `${node.x}%`, top: `${node.y}%`, transform: "translate(-8px,-50%)" }}
            >
              <p className="truncate text-[10px] font-semibold text-slate-100 sm:text-xs">{node.title}</p>
              <p className="mt-1 truncate text-[8px] text-slate-300 sm:text-[10px]">{node.meta}</p>
            </div>)}
            <div className="absolute bottom-3 left-3 z-20 rounded bg-[#101d2c]/90 px-2 py-1 font-mono text-[9px] text-slate-400">{detail === "overview" ? "SYSTEM MAP" : detail === "detailed" ? "COMPONENT VIEW" : "PROCESS STEPS"}</div>
          </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-[color:var(--text-3)]"><span className="h-1.5 w-1.5 rounded-full bg-[color:var(--added)]" /> Change the prompt or detail level to reshape the map.</div>
        </div>
      </div>
    </section>
  );
}
