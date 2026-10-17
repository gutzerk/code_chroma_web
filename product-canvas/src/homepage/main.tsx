import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { AgentClientProvider } from '../agents/AgentClientContext';
import { MockAgentClient } from '../agents/mockAgentClient';
import { EngineClientProvider } from '../engine-client/EngineClientContext';
import { TerminalClientProvider } from '../terminal/TerminalClientContext';
import { RootCanvas } from '../canvas/RootCanvas';
import { AppErrorBoundary } from '../AppErrorBoundary';
import { HomepageEngineClient, HOMEPAGE_IMPACT_POSITIONS, groups } from './seed';
import scenario from './architectureScenario.json';
import { DemoTerminalClient } from './DemoTerminalClient';
import { branchStore } from '../agents/branchStore';
import { clearSavedCameraView } from '../canvas/canvasCameraStore';
import { collapsedLayersStore } from '../canvas/doc/collapsedLayersStore';
import { patchCanvasDoc } from '../canvas/doc/canvasDocStore';
import { runRecipeAndLayout } from '../canvas/doc/diagramCatalog';
import { tutorialSimStore } from '../tutorial/tutorialSim';
import '../styles.css';
import './homepage.css';

const engine = new HomepageEngineClient();
const agentClient = new MockAgentClient();
// Keep branch/PR browsing available, but disable every agent entry point at the client boundary.
agentClient.create = async () => { throw new Error('Agents are not available in the website demo.'); };
const terminal = new DemoTerminalClient();

const DEMO_DIAGRAMS = [
  { key: 'architecture', label: 'Architecture', layer: scenario.name },
  { key: 'sequence', label: 'Sequence', layer: 'sequence', recipe: 'sequence' },
  { key: 'plan', label: 'Plan', layer: 'feature-plan/authorization', recipe: 'feature-plan/authorization' },
  { key: 'impact', label: 'Impact', layer: 'impact', recipe: 'impact' },
] as const;
type DemoDiagramKey = typeof DEMO_DIAGRAMS[number]['key'];

// Fixed homepage Plan layout, keyed by the recipe node ids copied from the canvas.
const PLAN_BLOCK_POSITIONS: Record<string, { x: number; y: number }> = {
  client: { x: 339.18723786480354, y: 1386.5053107489186 },
  'oauth-provider': { x: 1015.9189524167941, y: 1342.0440720032036 },
  'api-gateway': { x: 340.50051356290277, y: 1691.6184351690656 },
  'get-current-user': { x: 343.60700161939627, y: 1982.996850239087 },
  'tenant-policy': { x: 790.5996696490571, y: 2016.7799867269123 },
  postgres: { x: 791.4970913352945, y: 2249.9148152772486 },
  'protected-api': { x: -242.14479103264017, y: 2016.6074808096828 },
  'legacy-auth': { x: 880.0771381211349, y: 1701.2447407264494 },
};

async function applyPlanBlockPositions(): Promise<void> {
  const doc = await engine.getCanvas();
  const ops = Object.values(doc.elements).flatMap((element) => {
    if (element.layer !== 'feature-plan/authorization') return [];
    const key = element.meta.recipe_key;
    const position = typeof key === 'string' ? PLAN_BLOCK_POSITIONS[key] : undefined;
    return position ? [{ op: 'update_element' as const, id: element.id, position }] : [];
  });
  if (ops.length === 0) return;
  const result = await patchCanvasDoc(engine, ops, {
    layer: 'feature-plan/authorization',
    explanation: 'restore fixed homepage Plan positions',
  });
  if (!result.ok) throw new Error(result.errors[0]?.message ?? 'Не удалось закрепить позиции Plan');
}

async function applyImpactBlockPositions(): Promise<void> {
  const doc = await engine.getCanvas();
  const ops = Object.values(doc.elements).flatMap((element) => {
    if (element.layer !== 'impact') return [];
    const key = element.meta.position_key;
    const position = typeof key === 'string' ? HOMEPAGE_IMPACT_POSITIONS[key] : undefined;
    return position ? [{ op: 'update_element' as const, id: element.id, position }] : [];
  });
  if (ops.length === 0) return;
  const result = await patchCanvasDoc(engine, ops, {
    layer: 'impact',
    explanation: 'restore fixed homepage Impact positions',
  });
  if (!result.ok) throw new Error(result.errors[0]?.message ?? 'Не удалось закрепить позиции Impact');
}

function DiagramSwitcher({
  active,
  onActiveChange,
}: {
  active: DemoDiagramKey;
  onActiveChange: (key: DemoDiagramKey) => void;
}) {
  const [status, setStatus] = useState('');

  function centerVisibleDiagram() {
    let attempts = 0;
    const center = () => {
      if (tutorialSimStore.centerCanvasSelector('.canvas-diagram-frame') || attempts++ >= 45) return;
      requestAnimationFrame(center);
    };
    requestAnimationFrame(() => requestAnimationFrame(center));
  }

  async function showDiagram(key: DemoDiagramKey) {
    const selected = DEMO_DIAGRAMS.find((diagram) => diagram.key === key)!;
    DEMO_DIAGRAMS.filter((diagram) => diagram.key !== key)
      .forEach((diagram) => collapsedLayersStore.collapse(diagram.layer));
    // Hide the old generic Epics demo layer when switching to the new authorization Plan.
    collapsedLayersStore.collapse('epics');
    collapsedLayersStore.collapse(selected.layer);
    try {
      if (selected.recipe) {
        const doc = await engine.getCanvas();
        const exists = Object.values(doc.elements).some((element) => element.layer === selected.layer);
        // Re-run the hard sequence layout so older, wide instances are compacted on first switch.
        if (!exists || key === 'sequence' || key === 'plan' || key === 'impact') {
          const result = await runRecipeAndLayout(engine, selected.recipe);
          if (!result.ok) throw new Error(result.error);
        }
        if (key === 'plan') await applyPlanBlockPositions();
        if (key === 'impact') await applyImpactBlockPositions();
      }
      collapsedLayersStore.expand(selected.layer);
      onActiveChange(key);
      setStatus('');
      centerVisibleDiagram();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : `Не удалось построить ${selected.label}`);
    }
  }

  return <div className="homepage-diagram-switcher" role="group" aria-label="Diagram views"
    onPointerDown={(event) => event.stopPropagation()}>
    {DEMO_DIAGRAMS.map((diagram) => <button
      key={diagram.key}
      className="homepage-diagram-switcher-button"
      type="button"
      aria-pressed={active === diagram.key}
      onClick={() => { void showDiagram(diagram.key); }}
    >{diagram.label}</button>)}
    {status && <span className="homepage-diagram-switcher-error" role="alert">{status}</span>}
  </div>;
}

function CopyLayoutButton({ active }: { active: DemoDiagramKey }) {
  const [status, setStatus] = useState('');

  async function copyLayout() {
    const diagram = DEMO_DIAGRAMS.find((item) => item.key === active)!;
    const doc = await engine.getCanvas();
    const blocks = Object.values(doc.elements)
      .filter((element) => element.layer === diagram.layer && element.render !== 'group')
      .map((element) => ({
        name: element.label,
        x: element.position.x,
        y: element.position.y,
      }));
    if (blocks.length === 0) {
      setStatus(`В диаграмме ${diagram.label} нет блоков`);
      return;
    }
    const text = JSON.stringify({
      name: diagram.key === 'architecture' ? scenario.name : diagram.label,
      blocks,
    }, null, 2);

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const field = document.createElement('textarea');
      field.value = text;
      field.style.position = 'fixed';
      field.style.opacity = '0';
      document.body.appendChild(field);
      field.select();
      const copied = document.execCommand('copy');
      field.remove();
      if (!copied) {
        setStatus('Не удалось скопировать');
        return;
      }
    }

    setStatus(`Скопировано блоков: ${blocks.length}`);
    window.setTimeout(() => setStatus(''), 2200);
  }

  return <button
    className="homepage-copy-layout"
    type="button"
    onPointerDown={(event) => event.stopPropagation()}
    onClick={() => { void copyLayout(); }}
  >
    {status || 'Скопировать позиции'}
  </button>;
}

function HomepageCanvasControls() {
  const [active, setActive] = useState<DemoDiagramKey>('architecture');
  return <>
    <CopyLayoutButton active={active} />
    <DiagramSwitcher active={active} onActiveChange={setActive} />
  </>;
}
// The scene is recreated from a snapshot on refresh, so its camera starts fitted too.
clearSavedCameraView();
branchStore.setBranch(await agentClient.getBranch());
await engine.seed();
// This demo seeds the architecture synchronously, while the other views are generated on demand.
// A previous visit may have persisted Sequence/Plan/Impact as the expanded layer; restoring that
// state on a fresh page leaves an empty canvas and prevents the host page from receiving block
// positions. Always start from the seeded architecture, then let the switcher change views.
DEMO_DIAGRAMS.filter((diagram) => diagram.key !== 'architecture')
  .forEach((diagram) => collapsedLayersStore.collapse(diagram.layer));
collapsedLayersStore.expand(DEMO_DIAGRAMS[0].layer);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <AppErrorBoundary>
    <AgentClientProvider client={agentClient}>
      <EngineClientProvider repoId="homepage" client={engine}>
        <TerminalClientProvider client={terminal}><RootCanvas /><HomepageCanvasControls /></TerminalClientProvider>
      </EngineClientProvider>
    </AgentClientProvider>
  </AppErrorBoundary>,
);

// Report real product block positions so the falling files arrive at those exact blocks.
let last = '';
window.addEventListener('message', event => {
  if (event.source === window.parent && event.origin === window.location.origin && event.data?.type === 'codechroma-request-layout') last = '';
});
function report() {
  const blocks = Array.from({ length: groups.length }, (_, i) => {
    const node = document.querySelector<HTMLElement>(`[data-node-id="homepage-group-${i}"][data-canvas-element]`);
    if (!node) return null;
    const r = node.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height };
  });
  const payload = JSON.stringify(blocks);
  if (blocks.every(Boolean) && payload !== last) {
    last = payload;
    window.parent.postMessage({ type: 'codechroma-canvas-layout', blocks }, window.location.origin);
  }
  requestAnimationFrame(report);
}
requestAnimationFrame(report);
