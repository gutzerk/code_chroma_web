"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { initHomeDemo } from "./demoEngine";
import InstallBox from "./InstallBox";

/** `m` is what the map shows at that step, so each step adds something new instead of repeating the story. */
const STEPS = [
  { s: 1, t: "Plan", d: "Describe a feature. The agent asks, then draws it as a diagram you own.", m: "Map: dashed blocks appear" },
  { s: 2, t: "Run agents", d: "Start as many as you need, each one on its own branch.", m: "Map: same blocks, each claimed by an agent" },
  { s: 3, t: "Walk away", d: "Work on something else while they build.", m: "Map: progress only, nothing to watch" },
  { s: 4, t: "Verify", d: "Check the result on the same map: it matches your plan or it doesn't.", m: "Map: blocks turn solid, verdict appears" },
];

/** The CodeChroma app window the scripted demo plays in. */
function DemoWindow({ label, panelOpen, onTogglePanel }: { label: string; panelOpen: boolean; onTogglePanel: () => void }) {
  return (
    <div className="win" id="win" aria-label={label} data-panel={panelOpen ? "on" : "off"} data-sheet="off">
      <svg className="cursor" id="cursor" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M3 2 L3 15 L6.5 11.8 L9 17 L11.2 16 L8.8 10.9 L13.5 10.5 Z" fill="#fff" stroke="#000" strokeWidth="1" />
      </svg>
      <div className="frame-bar">
        <span className="dots"><i /><i /><i /></span>
        <span className="repo">acme-platform</span>
        <span className="grow" />
        <span className="pill">⎇ task/refresh-tokens</span>
        <button className="pill wfpill" id="wfpill" type="button" data-act="noop" hidden />
        <button className="pill panelbtn" id="panelbtn" type="button" aria-pressed={panelOpen} onClick={onTogglePanel}>{panelOpen ? "Hide panel" : "Agent panel"}</button>
        <button className="pill run" id="run" type="button">▶ Run<span className="lg"> workflow</span></button>
        <button className="pill pr" id="pr" type="button">Create PR ↗</button>
      </div>
      <div className="win-body">
        <div className="col">
          <div className="mapwrap">
            <div className="tools">
              <button className="pill" id="draw" type="button">✎ Draw…</button>
            </div>
            <div className="map" id="map" />
            <div className="agentbar" id="agentbar" hidden />
            <div className="away" id="away" hidden />
            <div className="verdict" id="verdict" hidden>
              <b>✓ Matches your plan</b>
              <span>2 of 2 planned blocks built · 0 unplanned changes</span>
            </div>
          </div>
          <div className="drawer">
            <section id="d-prompt">
              <div className="d-title"><b>Draw…</b> what should I draw?</div>
              <div className="prompt-in" id="ptext" />
            </section>
            <section id="d-q">
              <div className="d-title"><b>● Agent asks</b><span className="grow" />1 of 1</div>
              <div className="q-text">Where should refresh tokens be stored?</div>
              <div className="opts">
                <button className="opt rec" type="button">PostgreSQL<small>reuses db/roles · recommended</small></button>
                <button className="opt" type="button">Redis<small>faster, one more service</small></button>
                <button className="opt" type="button">Type your own…</button>
              </div>
            </section>
            <section id="d-desc">
              <div className="d-title">
                <b>Token store</b> planned · no code yet
              </div>
              <p>
                A place to keep refresh tokens, so users stay signed in after the access token expires. It has no
                file yet, so there is nothing to open. The agent creates <span className="mono">auth/refresh.py</span>{" "}
                when you run it.
              </p>
            </section>
          </div>
        </div>
        <aside className="panel" id="panel" aria-label="Agents" />
      </div>
    </div>
  );
}

/** Hero: the headline is a note pinned to a live, scripted demo of the CodeChroma window. */
export default function HomeDemo() {
  const ref = useRef<HTMLElement>(null);
  // phones show the map only; the agent panel opens on demand
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => (ref.current ? initHomeDemo(ref.current) : undefined), []);

  return (
    <section ref={ref} className="stage" id="demo" data-plan="0" data-drawer="">
      <div className="grid-bg" />
      <div className="stage-inner">
        <div className="note">
          <span className="eyebrow">Speed without losing the plot</span>
          <h1 className="h1">Vibe-code at full speed. Stay in control of the whole picture.</h1>
          <p className="lead">
            You design and review in process diagrams. Agents write the code in parallel while you work on something
            else, and every change lands on a map you already understand.
          </p>
          <div className="cta">
            <Link className="btn btn-primary" href="/install">Install free</Link>
            <Link className="btn" href="/canvas">Explore a real map</Link>
          </div>
          <ol className="flow" id="flow">
            {STEPS.map((x) => (
              <li key={x.s} data-s={x.s}>
                <button type="button">
                  <span className="num">{x.s}</span>
                  <span>
                    <strong>{x.t}</strong>
                    <span className="d">{x.d}</span>
                    <span className="m">{x.m}</span>
                  </span>
                </button>
                <i className="bar" />
              </li>
            ))}
          </ol>
          <button className="replay" id="replay" type="button">↺ replay the demo</button>
        </div>

        <DemoWindow label="CodeChroma, scripted demo" panelOpen={panelOpen} onTogglePanel={() => setPanelOpen((v) => !v)} />
        <InstallBox />
      </div>
    </section>
  );
}
