/* Small static illustrations for the home-page feature grid (trusted markup, rendered as-is). */
const range = (n: number) => Array.from({ length: n }, (_, i) => i);

export const MINI: Record<string, string> = {
  onboard: `<svg viewBox="0 0 280 150" aria-hidden="true">
      ${range(8).map((i) => `<line class="ln" x1="16" y1="${22 + i * 15}" x2="${60 + ((i * 37) % 50)}" y2="${22 + i * 15}"/>`).join("")}
      <path class="wire" d="M122 75 H150" marker-end="url(#ma)"/>
      <defs><marker id="ma" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L8 4L0 8z" fill="var(--faint)"/></marker></defs>
      <rect class="box" x="166" y="18" width="46" height="26" rx="5" style="stroke:var(--g-client)"/>
      <rect class="box" x="222" y="18" width="46" height="26" rx="5" style="stroke:var(--g-edge)"/>
      <rect class="box" x="166" y="62" width="102" height="26" rx="5" style="stroke:var(--g-auth)"/>
      <rect class="box" x="166" y="106" width="46" height="26" rx="5" style="stroke:var(--g-policy)"/>
      <rect class="box" x="222" y="106" width="46" height="26" rx="5" style="stroke:var(--g-data)"/>
      <path class="wire" d="M189 44V62M245 44V62M189 88V106M245 88V106"/></svg>`,
  grounded: `<svg viewBox="0 0 280 150" aria-hidden="true">
      <rect class="box" x="16" y="40" width="108" height="56" rx="7" style="stroke:var(--g-auth)"/>
      <rect x="16" y="52" width="3" height="32" rx="1.5" fill="var(--g-auth)"/>
      <text x="28" y="64" style="fill:var(--text);font:600 10px var(--sans)">get_current_user</text><text x="28" y="80">auth/deps.py:8</text>
      <path class="wire" d="M124 68 C150 68 150 60 168 60" stroke-dasharray="3 3"/>
      ${range(6).map((i) => `<line class="ln" x1="180" y1="${30 + i * 16}" x2="${200 + ((i * 41) % 60)}" y2="${30 + i * 16}" ${i === 2 ? 'style="stroke:var(--g-auth)"' : ""}/>`).join("")}
      <rect x="168" y="52" width="104" height="16" rx="4" fill="none" stroke="var(--g-auth)" stroke-opacity=".6"/></svg>`,
  sync: `<svg viewBox="0 0 280 150" aria-hidden="true">
      ${range(6).map((i) => `<line class="ln" x1="18" y1="${32 + i * 16}" x2="${44 + ((i * 29) % 46)}" y2="${32 + i * 16}" ${i === 3 ? 'style="stroke:var(--accent)"' : ""}/>`).join("")}
      <path class="wire" d="M118 64 H160" marker-end="url(#ms)"/><path class="wire" d="M160 86 H118" marker-end="url(#ms)"/>
      <defs><marker id="ms" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L8 4L0 8z" fill="var(--faint)"/></marker></defs>
      <rect class="box" x="176" y="28" width="86" height="28" rx="6"/>
      <rect class="box" x="176" y="94" width="86" height="28" rx="6" style="stroke:var(--accent)"/>
      <path class="wire" d="M219 56 V94"/></svg>`,
  review: `<svg viewBox="0 0 280 150" aria-hidden="true">
      <rect class="box" x="24" y="24" width="70" height="30" rx="6"/>
      <rect class="box" x="186" y="24" width="70" height="30" rx="6"/>
      <rect class="box" x="105" y="62" width="70" height="30" rx="6" style="stroke:var(--accent);stroke-width:1.8"/>
      <rect x="146" y="54" width="38" height="14" rx="4" fill="var(--accent)"/><text x="165" y="64" text-anchor="middle" style="fill:var(--accent-ink);font-weight:600">+12</text>
      <rect class="box" x="24" y="100" width="70" height="30" rx="6" style="stroke:#ff7a7a;stroke-dasharray:4 3;opacity:.75"/>
      <rect class="box" x="186" y="100" width="70" height="30" rx="6"/>
      <path class="wire" d="M94 39 H186 M140 54 V62 M105 77 H59 V100 M175 77 H221 V100"/></svg>`,
  plan: `<svg viewBox="0 0 280 150" aria-hidden="true">
      <rect class="box" x="100" y="12" width="80" height="26" rx="6" style="stroke:var(--accent)"/><text x="140" y="29" text-anchor="middle" style="fill:var(--text)">feature</text>
      <rect class="box" x="38" y="62" width="80" height="26" rx="6"/><text x="78" y="79" text-anchor="middle">epic</text>
      <rect class="box" x="162" y="62" width="80" height="26" rx="6"/><text x="202" y="79" text-anchor="middle">epic</text>
      ${[14, 72, 138, 196].map((x) => `<rect class="box" x="${x}" y="114" width="52" height="22" rx="5"/><text x="${x + 26}" y="128" text-anchor="middle">task</text>`).join("")}
      <path class="wire" d="M140 38 V50 H78 V62 M140 50 H202 V62 M78 88 V100 H40 V114 M78 100 H98 V114 M202 88 V100 H164 V114 M202 100 H222 V114"/></svg>`,
  workspace: `<svg viewBox="0 0 280 150" aria-hidden="true">
      <rect class="box" x="10" y="14" width="82" height="122" rx="7"/>
      ${range(6).map((i) => `<line class="ln" x1="22" y1="${34 + i * 15}" x2="${44 + ((i * 23) % 40)}" y2="${34 + i * 15}"/>`).join("")}
      <rect class="box" x="99" y="14" width="98" height="122" rx="7"/>
      <rect class="box" x="112" y="32" width="32" height="20" rx="4" style="stroke:var(--g-edge)"/><rect class="box" x="152" y="32" width="32" height="20" rx="4" style="stroke:var(--g-auth)"/>
      <rect class="box" x="132" y="84" width="32" height="20" rx="4" style="stroke:var(--g-data)"/><path class="wire" d="M128 52 V68 H148 V84 M168 52 V68"/>
      <rect class="box" x="204" y="14" width="66" height="122" rx="7"/>
      <rect x="214" y="30" width="44" height="16" rx="8" fill="var(--panel)" stroke="var(--line-2)"/>
      <rect x="222" y="54" width="38" height="16" rx="8" fill="color-mix(in srgb, var(--accent) 25%, transparent)"/>
      <rect x="214" y="78" width="40" height="16" rx="8" fill="var(--panel)" stroke="var(--line-2)"/>
      <text x="51" y="128" text-anchor="middle">code</text><text x="148" y="128" text-anchor="middle">map</text><text x="237" y="128" text-anchor="middle">agents</text></svg>`,
};
