"use client";

import { useState } from "react";
import Link from "next/link";

const CMDS = {
  macOS: "curl -fsSL https://codechroma.dev/install.sh | sh",
  Linux: "curl -fsSL https://codechroma.dev/install.sh | sh",
  Windows: 'powershell -ExecutionPolicy Bypass -c "irm https://codechroma.dev/install.ps1 | iex"',
} as const;

export default function InstallBox() {
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
    <div className="install" id="install">
      <div className="install-head">
        <div className="install-tabs" role="tablist" aria-label="Choose your operating system">
          {(Object.keys(CMDS) as (keyof typeof CMDS)[]).map((k) => (
            <button key={k} type="button" role="tab" aria-selected={os === k} onClick={() => setOs(k)}>{k}</button>
          ))}
        </div>
        <p className="install-note">Pre-alpha: expect rough edges. Free and runs locally.</p>
      </div>
      <div className="install-cmd">
        <code>{CMDS[os]}</code>
        <button className="btn btn-primary" type="button" onClick={copy}>{copied ? "Copied" : "Copy"}</button>
      </div>
      <p className="install-more">
        <Link href="/install">All platforms and next steps →</Link>
      </p>
    </div>
  );
}
