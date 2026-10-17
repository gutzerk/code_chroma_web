"use client";

import { useState } from "react";
import styles from "./CodeArchitectureHero.module.css";

const PLATFORMS = [
  { id: "macos", name: "macOS", command: "curl -fsSL https://codechroma.dev/install.sh | sh" },
  { id: "linux", name: "Linux", command: "curl -fsSL https://codechroma.dev/install.sh | sh" },
  {
    id: "windows",
    name: "Windows",
    command: 'powershell -ExecutionPolicy Bypass -c "irm https://codechroma.dev/install.ps1 | iex"',
  },
] as const;

export default function HeroInstallCommand() {
  const [platform, setPlatform] = useState<(typeof PLATFORMS)[number]["id"]>("macos");
  const [copied, setCopied] = useState(false);
  const selected = PLATFORMS.find((item) => item.id === platform) ?? PLATFORMS[0];

  async function copyCommand() {
    try {
      await navigator.clipboard.writeText(selected.command);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard access can be unavailable outside a secure browser context.
    }
  }

  return (
    <div className={styles.installCommandWrap} id="install">
      <div className={styles.installPlatformTabs} role="tablist" aria-label="Choose your operating system">
        {PLATFORMS.map((item) => (
          <button
            key={item.id}
            className={styles.installPlatformTab}
            type="button"
            role="tab"
            aria-selected={platform === item.id}
            onClick={() => {
              setPlatform(item.id);
              setCopied(false);
            }}
          >
            {item.name}
          </button>
        ))}
      </div>
      <div className={styles.installCommand} role="tabpanel" aria-label={`${selected.name} install command`}>
        <code className={styles.installCommandCode}>{selected.command}</code>
        <button className={styles.installCommandButton} type="button" onClick={copyCommand}>
          {copied ? "Copied ✓" : "Copy"}
        </button>
      </div>
    </div>
  );
}
