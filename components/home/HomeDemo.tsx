"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import Link from "next/link";
import { initHomeDemo } from "./demoEngine";

const LEGEND = [
  ["client", "client"], ["edge", "edge"], ["identity", "identity"], ["auth", "auth"],
  ["policy", "policy"], ["service", "service"], ["jobs", "jobs"], ["data", "data"],
] as const;

const STEPS = [
  { s: 1, t: "Explore", d: "Click a block to read the real code behind it." },
  { s: 2, t: "Plan", d: "Describe a feature. The agent draws it on the map." },
  { s: 3, t: "Build & review", d: "An agent codes it in its own branch. You review a diagram, not a diff." },
];

/** Hero: the headline is a note pinned to a live, scripted demo of the CodeChroma window. */
export default function HomeDemo() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => (ref.current ? initHomeDemo(ref.current) : undefined), []);

  return (
    <section ref={ref} className="stage" id="demo" data-plan="0" data-dock="0" data-drawer="">
      <div className="grid-bg" />
      <div className="stage-inner">
        <div className="note">
          <span className="eyebrow">Code → map → agents</span>
          <h1 className="h1">Work on the map, not the files.</h1>
          <p className="lead">
            CodeChroma draws how your project really works. Open any block for its code, describe a change, and an
            agent builds it while the map keeps up.
          </p>
          <ol className="flow" id="flow">
            {STEPS.map((x) => (
              <li key={x.s} data-s={x.s}>
                <button type="button">
                  <span className="num">{x.s}</span>
                  <span>
                    <strong>{x.t}</strong>
                    <span className="d">{x.d}</span>
                  </span>
                </button>
                <i className="bar" />
              </li>
            ))}
          </ol>
          <button className="replay" id="replay" type="button">↺ replay the demo</button>
          <div className="cta">
            <a className="btn btn-primary" href="#install">Install CodeChroma</a>
            <Link className="btn" href="/documentation">Read the docs</Link>
          </div>
        </div>

        <div className="win" id="win" aria-label="CodeChroma, interactive demo">
          <svg className="cursor" id="cursor" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M3 2 L3 15 L6.5 11.8 L9 17 L11.2 16 L8.8 10.9 L13.5 10.5 Z" fill="#fff" stroke="#000" strokeWidth="1" />
          </svg>
          <div className="frame-bar">
            <span className="dots"><i /><i /><i /></span>
            <span className="repo">acme-platform</span>
            <span className="grow" />
            <span className="pill">⎇ main ▾</span>
            <span className="pill">Pull request</span>
            <button className="pill run" id="run" type="button">▶ Run agent</button>
            <button className="pill pr" id="pr" type="button">Create PR ↗</button>
          </div>
          <div className="win-body">
            <div className="col">
              <div className="mapwrap">
                <div className="tools">
                  <button className="pill" id="draw" type="button">✎ Draw…</button>
                  <span className="hintline" id="hintline">click a block</span>
                </div>
                <div className="map" id="map" />
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
                <section id="d-agent">
                  <div className="d-title"><b>● Agent 1 · claude</b><span>⎇ feat/refresh-tokens</span></div>
                  <div className="term" id="term">
                    <div className="u">› implement the feature plan</div>
                    <div>own worktree, main is untouched</div>
                    <div>editing auth/deps.py</div>
                    <div>creating auth/refresh.py</div>
                    <div>tests: 14 passed</div>
                    <div className="ok">✔ done · 1 new block, 1 changed</div>
                  </div>
                </section>
                <section id="d-desc">
                  <div className="d-title">
                    <b>Token store</b> planned · no code yet<span className="grow" />
                    <button className="x" id="desc-x" type="button" aria-label="Close description">✕</button>
                  </div>
                  <p>
                    A place to keep refresh tokens, so users stay signed in after the access token expires. It has no
                    file yet, so there is nothing to open. The agent creates <span className="mono">auth/refresh.py</span>{" "}
                    when you run it.
                  </p>
                </section>
              </div>
            </div>
            <aside className="dock"><div className="dock-in" id="dock" /></aside>
          </div>
        </div>
      </div>
      <div className="legend">
        {LEGEND.map(([g, label]) => (
          <span key={g} style={{ "--c": `var(--g-${g})` } as CSSProperties}><i />{label}</span>
        ))}
      </div>
    </section>
  );
}
