"use client";

import Link from "next/link";
import { useState } from "react";

type Platform = {
  id: string;
  name: string;
  title: string;
  cmd: string;
  script: string;
  note?: string;
};

const SH = "https://codechroma.dev/install.sh";
const PS1 = "https://codechroma.dev/install.ps1";

const PLATFORMS: Platform[] = [
  { id: "macos", name: "macOS", title: "Install script", cmd: `curl -fsSL ${SH} | sh`, script: SH,
    note: "The desktop app is unsigned for now. On first launch, right-click the app, choose Open, then confirm in Gatekeeper." },
  { id: "linux", name: "Linux", title: "Install script", cmd: `curl -fsSL ${SH} | sh`, script: SH },
  { id: "windows", name: "Windows", title: "PowerShell", cmd: `powershell -ExecutionPolicy Bypass -c "irm ${PS1} | iex"`, script: PS1,
    note: "ExecutionPolicy Bypass applies to this one command only. It does not change your system policy." },
];

const SAFETY = [
  "Verifies the download against the release's published SHA-256 checksum, and refuses to continue if none is published.",
  "CodeChroma runs on your machine. It does not collect your source code and has no telemetry.",
  "Free to use. The AI provider is yours, and its own privacy policy and billing apply.",
];

const NEXT_STEPS = [
  { t: "Open a repository", d: "Point CodeChroma at a project. It builds the map from the real code." },
  { t: "Plan a feature", d: "Use Draw… to describe what you want. The agent asks, then draws it as a diagram." },
  { t: "Run agents", d: "Start one or several. Each works on its own branch while you do something else." },
  { t: "Verify on the map", d: "Review what changed as diagrams and open a PR when it matches your plan." },
];

function CommandBlock({ title, cmd }: { title: string; cmd: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(cmd);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable (e.g. non-secure context) — nothing to do */
    }
  }

  return (
    <div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-1)]">
      <div className="flex items-center justify-between border-b border-[color:var(--border-faint)] px-4 py-2">
        <span className="text-xs font-medium text-[color:var(--text-2)]">{title}</span>
        <button
          type="button"
          onClick={copy}
          className="rounded-md bg-[color:var(--accent)] px-3 py-1.5 text-xs font-semibold text-[#06130c] transition-colors hover:bg-[#8de0b0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b1f0c8]"
        >
          {copied ? "Copied ✓" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto px-4 py-3 font-mono text-sm text-[color:var(--text-1)]">
        <code>{cmd}</code>
      </pre>
    </div>
  );
}

export default function InstallTabs() {
  const [platform, setPlatform] = useState(PLATFORMS[0]);

  return (
    <>
      <header>
        <p className="font-mono text-xs tracking-widest" style={{ color: "var(--accent)" }}>
          get started in two minutes
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">Install CodeChroma</h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-[color:var(--text-2)] sm:text-lg">
          One command, free, runs locally. Then plan your first feature on the map and let agents build it.
        </p>
      </header>

      {/* Platform tabs */}
      <div role="tablist" aria-label="Installation platform" className="mt-8 flex gap-2 border-b border-[color:var(--border-faint)]">
        {PLATFORMS.map((p) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            id={`tab-${p.id}`}
            aria-selected={platform.id === p.id}
            aria-controls={`panel-${p.id}`}
            onClick={() => setPlatform(p)}
            className={`-mb-px rounded-t-lg border border-b-0 px-5 py-2.5 text-sm font-medium transition-colors ${
              platform.id === p.id
                ? "border-[color:var(--accent)] bg-[#16281e] text-[#effff4]"
                : "border-transparent text-[color:var(--text-2)] hover:border-[color:var(--border)] hover:bg-[color:var(--surface-2)] hover:text-[color:var(--text-1)]"
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Active panel */}
      <div role="tabpanel" id={`panel-${platform.id}`} aria-labelledby={`tab-${platform.id}`} className="mt-5 max-w-3xl space-y-3">
        <CommandBlock title={platform.title} cmd={platform.cmd} />
        <p className="text-sm text-[color:var(--text-2)]">
          Want to check it first?{" "}
          <a href={platform.script} target="_blank" rel="noreferrer" className="text-[color:var(--accent)] underline underline-offset-2">
            Read the script
          </a>{" "}
          or{" "}
          <a href="https://github.com/gutzerk/code_chroma/releases" target="_blank" rel="noreferrer" className="text-[color:var(--accent)] underline underline-offset-2">
            download the installer from GitHub Releases
          </a>
          .
        </p>
        {platform.note && (
          <p className="rounded-lg border border-[color:var(--border-faint)] bg-[color:var(--surface-1)] px-4 py-3 text-sm text-[color:var(--text-2)]">
            <span className="font-semibold text-[color:var(--text-1)]">Heads up: </span>
            {platform.note}
          </p>
        )}
      </div>

      {/* Why it is safe to run */}
      <section className="mt-14 max-w-3xl" aria-labelledby="install-safe">
        <h2 id="install-safe" className="text-xl font-semibold tracking-tight">What to expect</h2>
        <ul className="mt-4 space-y-2.5">
          {SAFETY.map((s) => (
            <li key={s} className="flex gap-3 text-base leading-relaxed text-[color:var(--text-2)]">
              <span aria-hidden="true" className="mt-0.5 text-[color:var(--accent)]">✓</span>
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* First run */}
      <section className="mt-14 max-w-3xl" aria-labelledby="install-next">
        <h2 id="install-next" className="text-xl font-semibold tracking-tight">After you install</h2>
        <ol className="mt-4 space-y-3">
          {NEXT_STEPS.map((s, i) => (
            <li key={s.t} className="flex gap-4 rounded-lg border border-[color:var(--border-faint)] bg-[color:var(--surface-1)] p-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[color:var(--accent)] font-mono text-sm text-[color:var(--accent)]">
                {i + 1}
              </span>
              <div>
                <div className="font-semibold text-[color:var(--text-1)]">{s.t}</div>
                <p className="mt-0.5 text-base leading-relaxed text-[color:var(--text-2)]">{s.d}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-5 text-sm text-[color:var(--text-2)]">
          Exploring the map works without an API key. Connect an AI provider in Settings to run agents. See{" "}
          <Link href="/documentation#quick-start" className="text-[color:var(--accent)] underline underline-offset-2">
            the quick start
          </Link>{" "}
          or{" "}
          <Link href="/documentation#troubleshooting" className="text-[color:var(--accent)] underline underline-offset-2">
            troubleshooting
          </Link>
          .
        </p>
      </section>
    </>
  );
}
