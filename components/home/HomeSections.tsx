"use client";

import { useState } from "react";
import { MINI } from "./featureMinis";

const FEATURES = [
  { k: "onboard", eye: "Onboarding", t: "Find your way around any project.", b: "Instead of walls of code you get a map of what the app actually does. Blocks are grouped by real relationships in the code, and the view is yours to arrange." },
  { k: "grounded", eye: "Grounded", t: "Every block points to real code.", b: "The map is built from the source itself, and each block is tied to a specific place in it. Nothing is made up, so what you see is what runs." },
  { k: "sync", eye: "Live", t: "The map never goes stale.", b: "Change the code or the canvas, and the other side updates right away. Unlike docs, the map stays true after every edit." },
  { k: "review", eye: "Review", t: "See changes as diagrams, not diffs.", b: "Every update shows up on the map, so you can see what changed without reading it line by line." },
  { k: "plan", eye: "Planning", t: "Plan a feature before you write it.", b: "Lay a feature out on the canvas and break it down: features into epics, epics into tasks." },
  { k: "workspace", eye: "Workspace", t: "Code, map and agents in one window.", b: "Your editor, the live map and your AI agents sit side by side. Agents work on your real codebase, and the map keeps up as they go." },
];

const LOCAL_LIST = ["100% local, no telemetry", "Bring your own AI provider", "macOS, Linux and Windows"];

const CMDS = {
  macOS: "curl -fsSL https://codechroma.dev/install.sh | sh",
  Linux: "curl -fsSL https://codechroma.dev/install.sh | sh",
  Windows: 'powershell -ExecutionPolicy Bypass -c "irm https://codechroma.dev/install.ps1 | iex"',
} as const;

function Install() {
  const [os, setOs] = useState<keyof typeof CMDS>("macOS");
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(CMDS[os]);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      // Clipboard access can be unavailable outside a secure browser context.
    }
  }

  return (
    <div className="install">
      <div className="install-tabs" role="tablist" aria-label="Choose your operating system">
        {(Object.keys(CMDS) as (keyof typeof CMDS)[]).map((k) => (
          <button key={k} type="button" role="tab" aria-selected={os === k} onClick={() => setOs(k)}>{k}</button>
        ))}
      </div>
      <div className="install-cmd">
        <code>{CMDS[os]}</code>
        <button className="btn btn-primary" type="button" onClick={copy}>{copied ? "Copied" : "Copy"}</button>
      </div>
      <p className="install-note">Pre-alpha: expect rough edges. Free and runs locally.</p>
    </div>
  );
}

/** Everything under the hero: feature grid, the "local" panel and the install box. */
export default function HomeSections() {
  return (
    <>
      <section className="sec">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">What you can do with the map</span>
            <h2 className="h2">Explore, plan and review, all on one canvas.</h2>
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
          <div className="local">
            <div>
              <span className="eyebrow">Local</span>
              <h2 className="h2" style={{ marginTop: 12 }}>Safe for work projects.</h2>
              <p className="lead" style={{ marginTop: 14 }}>
                CodeChroma runs entirely on your machine and sends no telemetry. You choose the AI provider, so you can
                stick to the ones your company approves.
              </p>
            </div>
            <ul className="check">
              {LOCAL_LIST.map((x) => <li key={x}>{x}</li>)}
            </ul>
          </div>
        </div>
      </section>

      <section className="sec" id="install" style={{ paddingTop: 0 }}>
        <div className="wrap final">
          <h2 className="h2">See the map of your own project.</h2>
          <Install />
        </div>
      </section>
    </>
  );
}
