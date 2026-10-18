"use client";

import { useState } from "react";

type Platform = {
  id: string;
  name: string;
  commands: { title: string; cmd: string }[];
};

const PLATFORMS: Platform[] = [
  {
    id: "macos",
    name: "macOS",
    commands: [{ title: "Install script", cmd: "curl -fsSL https://codechroma.dev/install.sh | sh" }],
  },
  {
    id: "linux",
    name: "Linux",
    commands: [{ title: "Install script", cmd: "curl -fsSL https://codechroma.dev/install.sh | sh" }],
  },
  {
    id: "windows",
    name: "Windows",
    commands: [
      {
        title: "PowerShell",
        cmd: 'powershell -ExecutionPolicy Bypass -c "irm https://codechroma.dev/install.ps1 | iex"',
      },
    ],
  },
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
    <div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-0)]">
      <div className="flex items-center justify-between border-b border-[color:var(--border-faint)] px-4 py-2">
        <span className="text-xs font-medium text-[color:var(--text-2)]">{title}</span>
        <button
          type="button"
          onClick={copy}
          className="rounded-md border border-[#8de0b0] bg-[#6fcf97] px-3 py-1.5 text-xs font-semibold text-[#102018] shadow-[0_2px_12px_rgba(111,207,151,0.18)] transition-colors hover:border-[#b1f0c8] hover:bg-[#8de0b0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b1f0c8]"
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
          getting started
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">Install CodeChroma</h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-[color:var(--text-2)] sm:text-lg">
          Pick your platform and copy the command. CodeChroma is available on macOS, Linux, and Windows.
        </p>
      </header>

      {/* Platform tabs */}
      <div
        role="tablist"
        aria-label="Installation platform"
        className="mt-8 flex gap-2 border-b border-[color:var(--border-faint)]"
      >
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
                ? "border-[#8de0b0] bg-[#203b2c] text-[#effff4] shadow-[0_-2px_12px_rgba(111,207,151,0.12)]"
                : "border-transparent text-[color:var(--text-2)] hover:border-[color:var(--border)] hover:bg-[color:var(--surface-0)] hover:text-[color:var(--text-1)]"
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Active panel */}
      <div
        role="tabpanel"
        id={`panel-${platform.id}`}
        aria-labelledby={`tab-${platform.id}`}
        className="mt-5 max-w-3xl space-y-3"
      >
        {platform.commands.map((c) => (
          <CommandBlock key={c.title} title={c.title} cmd={c.cmd} />
        ))}
      </div>

      <a
        href="https://github.com/gutzerk/code_chroma/releases"
        target="_blank"
        rel="noreferrer"
        className="mt-6 inline-flex items-center gap-2 rounded-md border border-[#6fcf97]/60 bg-[#203b2c] px-4 py-2.5 text-sm font-medium text-[#b9f2cc] transition-colors hover:border-[#9be5b3] hover:bg-[#294c37] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9be5b3]"
      >
        Release notes <span aria-hidden="true">↗</span>
      </a>
    </>
  );
}
