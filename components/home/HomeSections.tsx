"use client";

import Link from "next/link";
import { MINI } from "./featureMinis";

const FEATURES = [
  { k: "plan", eye: "1 · Plan", t: "Draw the feature before anyone writes it.", b: "Describe what you want and get a process diagram of it: the blocks, the flow between them, what is new. You decide the design, so the agents build your idea, not theirs." },
  { k: "workspace", eye: "2 · Build", t: "Agents work in parallel while you do something else.", b: "Start as many agents as you need, each on its own branch. You don't have to watch them type. Step away and work on the next thing." },
  { k: "review", eye: "3 · Verify", t: "Review diagrams, not diffs.", b: "Every change lands on the same map you planned on. If the pattern and the whole picture match your design, you don't need to read the code inside." },
  { k: "grounded", eye: "Trust", t: "Every block points to real code.", b: "The map is built from the source itself and each block is tied to a specific place in it. Nothing is made up, so what you see is what runs." },
  { k: "sync", eye: "Trust", t: "The map never goes stale.", b: "Change the code or the canvas and the other side updates right away. Unlike docs, the map stays true after every edit." },
];

const COMPARE = {
  without: {
    t: "Vibe coding without a map",
    p: ["Agents change things and you don't know what.", "You read diffs you can't judge, or you skip them.", "Problems surface weeks later, in code nobody understands."],
  },
  with: {
    t: "Vibe coding with CodeChroma",
    p: ["You draw the design first, as a process diagram.", "Agents build it in parallel, so you stay free.", "You review the result on the same map and stay responsible for the project."],
  },
};

const ICON = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round", viewBox: "0 0 24 24", "aria-hidden": true } as const;
const SAFE = [
  { t: "Local by default", b: "CodeChroma runs on your machine and does not collect your source code.",
    i: <svg {...ICON}><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /><path d="M9.5 10l2 2 3.5-4" /></svg> },
  { t: "Bring your own agent", b: "Connect the AI provider your company already approves. Its own privacy policy applies.",
    i: <svg {...ICON}><circle cx="8" cy="12" r="3" /><path d="M11 12h10M18 12v3M15 12v2" /></svg> },
  { t: "macOS, Linux and Windows", b: "Free to install on the machines your team already uses.",
    i: <svg {...ICON}><rect x="3" y="5" width="18" height="12" rx="2" /><path d="M3 9h18M7 20h10" /></svg> },
];

/** Everything under the hero: feature grid and the "local" panel. */
export default function HomeSections() {
  return (
    <>
      <section className="sec">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">A new language for software engineers</span>
            <h2 className="h2">Build and review through process diagrams.</h2>
            <p className="lead">
              Code is the agents&rsquo; job now. Your job is the design and the decision to accept it, and diagrams are
              the fastest way to do both.
            </p>
          </div>
          <div className="cols">
            {FEATURES.map((f) => (
              <article className="feat" key={f.k}>
                <div className="mini" dangerouslySetInnerHTML={{ __html: MINI[f.k] }} />
                <div className="feat-text">
                  <span className="eyebrow">{f.eye}</span>
                  <h3 className="h3">{f.t}</h3>
                  <p className="muted">{f.b}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Why it matters</span>
            <h2 className="h2">Speed is easy. Staying in control is the hard part.</h2>
          </div>
          <div className="compare">
            {([COMPARE.without, COMPARE.with] as const).map((c, i) => (
              <article className={`compare-col${i ? " is-with" : ""}`} key={c.t}>
                <h3 className="h3">{c.t}</h3>
                <ul>
                  {c.p.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Local</span>
            <h2 className="h2">Built to run on your machine.</h2>
            <p className="lead">
              CodeChroma is a desktop app that works locally. Your source code stays with you, and you bring the AI
              agent you already use.
            </p>
          </div>
          <div className="safe">
            {SAFE.map((x) => (
              <article className="safe-item" key={x.t}>
                <span className="safe-ico">{x.i}</span>
                <h3 className="h3">{x.t}</h3>
                <p className="muted">{x.b}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head">
            <h2 className="h2">Try it on your own repo.</h2>
            <p className="lead">Free, local, and pre-alpha. Install it, point it at a project and plan your next feature on the map.</p>
            <div className="cta-row">
              <a className="btn btn-primary" href="#install">Install free</a>
              <Link className="btn" href="/documentation">Read the docs</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
