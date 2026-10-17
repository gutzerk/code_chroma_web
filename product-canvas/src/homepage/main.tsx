import React from 'react';
import ReactDOM from 'react-dom/client';
import { AgentClientProvider } from '../agents/AgentClientContext';
import { MockAgentClient } from '../agents/mockAgentClient';
import { EngineClientProvider } from '../engine-client/EngineClientContext';
import { TerminalClientProvider } from '../terminal/TerminalClientContext';
import { RootCanvas } from '../canvas/RootCanvas';
import { AppErrorBoundary } from '../AppErrorBoundary';
import { HomepageEngineClient, groups } from './seed';
import { DemoTerminalClient } from './DemoTerminalClient';
import { branchStore } from '../agents/branchStore';
import { clearSavedCameraView } from '../canvas/canvasCameraStore';
import '../styles.css';
import './homepage.css';

const engine = new HomepageEngineClient();
const agentClient = new MockAgentClient();
// Keep branch/PR browsing available, but disable every agent entry point at the client boundary.
agentClient.create = async () => { throw new Error('Agents are not available in the website demo.'); };
const terminal = new DemoTerminalClient();
// The scene is recreated from a snapshot on refresh, so its camera starts fitted too.
clearSavedCameraView();
branchStore.setBranch(await agentClient.getBranch());
await engine.seed();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <AppErrorBoundary>
    <AgentClientProvider client={agentClient}>
      <EngineClientProvider repoId="homepage" client={engine}>
        <TerminalClientProvider client={terminal}><RootCanvas /></TerminalClientProvider>
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
