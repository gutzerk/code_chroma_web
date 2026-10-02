"use client";

import { useCallback, useRef, useState } from "react";

/**
 * An interactive "before / after" overlay. The left layer is a C1 system-context diagram
 * (C4 model): the CodeChroma system as one central box, with the people who use it and the
 * external systems it talks to around it, connected by labeled arrows. The right layer is the
 * source project as a half-open file tree. Drag the handle right and the diagram grows, as if
 * peeling the project tree back to reveal the semantic map underneath. Both layers are clipped
 * to the split point.
 */

type Actor = { id: string; label: string; role: string; x: number; y: number };
type ExternalSystem = { id: string; label: string; x: number; y: number; w: number; hue: string };
type Arrow = { from: [number, number]; to: [number, number]; label: string; lx: number; ly: number };

// The actors around the system (stick figures, colored with the C1 person hue).
const ACTORS: Actor[] = [
  { id: "agent", label: "AI Agent", role: "navigates the canvas", x: 13, y: 16 },
  { id: "pm", label: "Product Manager", role: "tracks delivery", x: 13, y: 44 },
  { id: "engineer", label: "Engineer", role: "reads & reviews code", x: 13, y: 72 },
];

// External systems the project talks to (right column).
const EXTERNAL: ExternalSystem[] = [
  { id: "llm", label: "LLM provider", x: 130, y: 15, w: 26, hue: "var(--plan)" },
  { id: "github", label: "GitHub", x: 130, y: 43, w: 26, hue: "var(--patterns)" },
  { id: "fs", label: "File system", x: 130, y: 71, w: 26, hue: "var(--epics)" },
];

// Center system box.
const SYSTEM = { x: 48, y: 33, w: 66, h: 24, hue: "var(--c1)" };

// Arrows: from system's edge to each peer (and back), with labels.
const ARROWS: Arrow[] = [
  // to AI agent (upper-left)
  { from: [SYSTEM.x, SYSTEM.y + 8], to: [34, 21], label: "answers, cited", lx: 26, ly: 9 },
  // to PM (mid-left)
  { from: [SYSTEM.x, SYSTEM.y + 16], to: [34, 49], label: "progress overview", lx: 25, ly: 37 },
  // to engineer (lower-left)
  { from: [SYSTEM.x, SYSTEM.y + 24], to: [34, 77], label: "jump to block", lx: 27, ly: 67 },
  // to LLM provider (upper-right)
  { from: [SYSTEM.x + SYSTEM.w, SYSTEM.y + 8], to: [130, 28], label: "semantic AI", lx: 104, ly: 2 },
  // to GitHub (mid-right)
  { from: [SYSTEM.x + SYSTEM.w, SYSTEM.y + 16], to: [130, 56], label: "diff & PR", lx: 103, ly: 40 },
  // to File system (lower-right)
  { from: [SYSTEM.x + SYSTEM.w, SYSTEM.y + 24], to: [130, 82], label: "live watch", lx: 104, ly: 86 },
];

const HANDLE = "◆";

export default function Hero() {
  const [split, setSplit] = useState(28); // % of pane width owned by the diagram (left)
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    dragging.current = true;
    (e.target as Element).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const pct = ((e.clientX - rect.left) / rect.width) * 100;
    setSplit(Math.min(90, Math.max(8, pct)));
  }, []);

  const stop = useCallback((e: React.PointerEvent) => {
    dragging.current = false;
    (e.target as Element).releasePointerCapture(e.pointerId);
  }, []);

  return (
    <div
      ref={ref}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={stop}
      onPointerCancel={stop}
      className="relative aspect-[16/9] w-full select-none overflow-hidden rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-1)] shadow-[0_20px_60px_-30px_rgba(0,0,0,0.9)] cursor-ew-resize"
    >
      {/* C1 DIAGRAM (left) — clipped to the split point */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 160 90"
        preserveAspectRatio="xMidYMid slice"
        style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}
        aria-hidden
      >
        {/* arrows */}
        {ARROWS.map((a) => (
          <g key={a.label}>
            <line
              x1={a.from[0]}
              y1={a.from[1]}
              x2={a.to[0]}
              y2={a.to[1]}
              stroke="var(--border)"
              strokeWidth="0.45"
            />
            {/* arrowhead */}
            <path
              d={`M ${a.to[0]} ${a.to[1]} l -2.2 -1.1 h 1.5 v 2.2 z`}
              fill="var(--border)"
            />
            <text x={a.lx} y={a.ly} fontSize="2.5" fill="var(--text-3)">
              {a.label}
            </text>
          </g>
        ))}

        {/* center system box */}
        <g>
          <rect
            x={SYSTEM.x}
            y={SYSTEM.y}
            width={SYSTEM.w}
            height={SYSTEM.h}
            rx={3}
            fill="var(--surface-2)"
            stroke={SYSTEM.hue}
            strokeWidth="0.8"
          />
          <text x={SYSTEM.x + 3} y={SYSTEM.y + 10} fontSize="5" fill={SYSTEM.hue} fontWeight={700}>
            CodeChroma
          </text>
          <text x={SYSTEM.x + 3} y={SYSTEM.y + 19} fontSize="3.2" fill="var(--text-2)">
            Architecture Map — System
          </text>
        </g>

        {/* actors — stick figures */}
        {ACTORS.map((p) => {
          const cx = p.x;
          const cy = p.y;
          return (
            <g key={p.id}>
              {/* stick figure */}
              <circle cx={cx} cy={cy} r={3} fill="none" stroke="var(--plan)" strokeWidth="0.6" />
              <line x1={cx} y1={cy + 3} x2={cx} y2={cy + 9} stroke="var(--plan)" strokeWidth="0.6" />
              <line x1={cx - 3.2} y1={cy + 5} x2={cx + 3.2} y2={cy + 5} stroke="var(--plan)" strokeWidth="0.6" />
              <line x1={cx} y1={cy + 9} x2={cx - 2.6} y2={cy + 14} stroke="var(--plan)" strokeWidth="0.6" />
              <line x1={cx} y1={cy + 9} x2={cx + 2.6} y2={cy + 14} stroke="var(--plan)" strokeWidth="0.6" />
              {/* label to the right of figure */}
              <text x={cx + 5} y={cy - 1} fontSize="3.4" fill="var(--text-1)" fontWeight={500}>
                {p.label}
              </text>
              <text x={cx + 5} y={cy + 3.4} fontSize="2.6" fill="var(--text-3)">
                {p.role}
              </text>
            </g>
          );
        })}

        {/* external systems */}
        {EXTERNAL.map((s) => (
          <g key={s.id}>
            <rect
              x={s.x}
              y={s.y}
              width={s.w}
              height={12}
              rx={2.5}
              fill="var(--surface-2)"
              stroke={s.hue}
              strokeWidth="0.45"
              opacity={0.9}
            />
            <text x={s.x + 2.5} y={s.y + 6.5} fontSize="3.4" fill={s.hue} fontWeight={500}>
              {s.label}
            </text>
            <text x={s.x + 2.5} y={s.y + 10.2} fontSize="2.4" fill="var(--text-3)">
              external
            </text>
          </g>
        ))}
      </svg>

      {/* CODE TREE (right) — clipped to the right of the split point */}
      <div
        className="absolute inset-0 overflow-hidden bg-[color:var(--surface-code)]"
        style={{ clipPath: `inset(0 0 0 ${split}%)` }}
      >
        <div className="p-5 sm:p-7 font-mono text-[12px] sm:text-[13.5px] leading-[1.65]">
          {TREE.map((l, i) => {
            const color = l.root
              ? "var(--c1)"
              : l.closed
              ? "var(--text-3)"
              : l.dir
              ? "var(--plan)"
              : "var(--text-2)";
            return (
              <div key={i} className={`whitespace-pre ${l.closed ? "italic" : ""}`} style={{ color }}>
                {l.s}
              </div>
            );
          })}
        </div>
      </div>

      {/* SPLIT HANDLE */}
      <div className="absolute inset-y-0 z-10 w-8 -translate-x-1/2" style={{ left: `${split}%` }}>
        <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-[color:var(--accent)] opacity-70 transition-opacity hover:opacity-100" />
        <div className="absolute left-1/2 top-1/2 flex h-14 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[color:var(--accent)] bg-[color:var(--surface-3)] text-[11px] text-[color:var(--accent)] shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          {HANDLE}
        </div>
      </div>

      {/* layer labels */}
      <div className="pointer-events-none absolute left-4 top-4 rounded bg-[color:var(--surface-1)]/80 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-[color:var(--text-3)]">
        C1 · System context
      </div>
      <div className="pointer-events-none absolute right-4 top-4 rounded bg-[color:var(--surface-1)]/80 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-[color:var(--text-3)]">
        Code
      </div>
    </div>
  );
}

// The project as a half-open explorer tree. `dir` lines get a hue; closed folders show "…".
type TreeLine = { s: string; dir?: boolean; root?: boolean; closed?: boolean };
const TREE: TreeLine[] = [
  { s: "codechroma/", dir: true, root: true },
  { s: "├── src/", dir: true },
  { s: "│   └── codechroma/", dir: true },
  { s: "│       ├── bridge/", dir: true },
  { s: "│       │   ├── app.py" },
  { s: "│       │   ├── launch.py" },
  { s: "│       │   └── live.py" },
  { s: "│       ├── engine/   …", dir: true, closed: true },
  { s: "│       ├── terminal/", dir: true },
  { s: "│       │   └── server.py" },
  { s: "│       └── __init__.py" },
  { s: "├── web/", dir: true },
  { s: "│   ├── src/", dir: true },
  { s: "│   │   ├── canvas/", dir: true },
  { s: "│   │   │   └── CanvasViewport.tsx" },
  { s: "│   │   ├── state/", dir: true },
  { s: "│   │   └── index.tsx" },
  { s: "│   └── package.json" },
  { s: "├── desktop/   …", dir: true, closed: true },
  { s: "├── tests/     …", dir: true, closed: true },
  { s: "├── pyproject.toml" },
  { s: "└── README.md" },
];
