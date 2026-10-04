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
    commands: [
      {
        title: "Install script",
        cmd: "curl -fsSL https://raw.githubusercontent.com/gutzerk/code_chroma/main/distribution/install.sh | sh",
      },
    ],
  },
  {
    id: "linux",
    name: "Linux",
    commands: [
      {
        title: "Install script",
        cmd: "curl -fsSL https://raw.githubusercontent.com/gutzerk/code_chroma/main/distribution/install.sh | sh",
      },
    ],
  },
  {
    id: "windows",
    name: "Windows",
    commands: [
      {
        title: "PowerShell",
        cmd: 'powershell -ExecutionPolicy Bypass -c "irm https://raw.githubusercontent.com/gutzerk/code_chroma/main/distribution/install.ps1 | iex"',
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
          className="rounded-md border border-[color:var(--border)] px-2.5 py-1 text-xs text-[color:var(--text-2)] transition-colors hover:border-[color:var(--added)] hover:text-[color:var(--added)]"
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
                ? "border-[color:var(--border)] bg-[color:var(--surface-0)] text-[color:var(--text-1)]"
                : "border-transparent text-[color:var(--text-2)] hover:text-[color:var(--text-1)]"
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

      <p className="mt-6 text-sm text-[color:var(--text-2)]">
        To install a specific version, choose it from the{" "}
        <a
          href="https://github.com/gutzerk/code_chroma/releases"
          className="text-[color:var(--accent)] underline underline-offset-4 hover:opacity-80"
        >
          GitHub Releases
        </a>
        .
      </p>
    </>
  );
}
