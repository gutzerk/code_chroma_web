import { FIXTURE_NODES, type FixtureNode } from '../engine-client/fixtures';
import { MockBridgeEngineClient } from '../engine-client/mockBridge';
import type { CanvasDoc, CanvasElement } from '../state/types';
import samples from './codeSamples.json';
import scenario from './architectureScenario.json';

export const groups = scenario.nodes;
const connections = scenario.connections;

function ref(id: string, name: string, parent: string | null, children: string[], file?: typeof samples[number]): FixtureNode {
  return { node_id: id, name, level: file ? 'file' : 'folder', parent_id: parent,
    has_children: children.length > 0, child_count: children.length, children,
    ...(file ? { source: file.lines.join('\n'), language: file.name.endsWith('.py') ? 'python' : 'tsx' } : {}) };
}

// The fictional service shares its illustrative source with the falling editor windows.
FIXTURE_NODES.root = ref('root', 'Aurora AI', null, groups.map((_, i) => `homepage-group-${i}`));
groups.forEach((group, i) => {
  const id = `homepage-group-${i}`;
  FIXTURE_NODES[id] = ref(id, group.name, 'root', group.files.map(f => `homepage-file-${f}`));
  group.files.forEach(f => { FIXTURE_NODES[`homepage-file-${f}`] = ref(`homepage-file-${f}`, samples[f].name, id, [], samples[f]); });
});

export class HomepageEngineClient extends MockBridgeEngineClient {
  async seed() {
    const elements: Record<string, CanvasElement> = {};
    const layer = scenario.name;
    const zoneElements: CanvasElement[] = scenario.zones.map((label, i) => ({
      id: `homepage-zone-${i}`, render: 'group', layer, label, description: '',
      node_id: null, position: { x: 0, y: 0 }, size: null, group_id: null, meta: {}, created_by: 'user',
    }));
    const colors: Record<string, string> = { blue: '#659ad2', cyan: '#52b8bf', violet: '#ab8bdd', amber: '#d6ad66', green: '#63b69b', pink: '#c98cb9' };
    groups.forEach((group, i) => {
      const id = `homepage-block-${i}`;
      elements[id] = { id, render: 'c1', layer, label: group.name,
        description: group.description, node_id: `homepage-group-${i}`,
        position: { x: group.x, y: group.y },
        size: { w: 250, h: 100 }, group_id: `homepage-zone-${group.zone}`,
        meta: { kind: group.kind }, style: { 'border-color': colors[group.tint] }, created_by: 'user' };
    });
    const doc: CanvasDoc = { schema_version: 1, doc_id: 'homepage', updated_at: '', elements,
      edges: Object.fromEntries(connections.map(({ from, to, label }, i) => [`homepage-edge-${i}`, {
        id: `homepage-edge-${i}`, from: `homepage-block-${from}`, to: `homepage-block-${to}`,
        label, kind: 'call', layer,
      }])) };
    // Use the public mutation API so dragging/undo/diagrams continue through the real stores.
    const result = await this.patchCanvas({ ops: [
      ...zoneElements.map(element => ({ op: 'add_group' as const, ...element, temp_id: element.id })),
      ...Object.values(elements).map(element => ({ op: 'add_element' as const, ...element, temp_id: element.id })),
      ...Object.values(doc.edges).map(edge => ({ op: 'add_edge' as const, ...edge })),
    ] });
    if (!result.ok) throw new Error(result.errors.map(error => error.message).join('; '));
  }

  async getConnections(nodeId: string) {
    return connections.flatMap(({ from, to }) => {
      const edge = { from_id: `homepage-group-${from}`, to_id: `homepage-group-${to}` };
      return edge.from_id === nodeId || edge.to_id === nodeId ? [edge] : [];
    });
  }

  async getRoute(fromId: string, toId: string): Promise<string[] | null> {
    const queue = [[fromId]];
    const visited = new Set([fromId]);
    while (queue.length) {
      const path = queue.shift()!;
      const current = path[path.length - 1];
      if (current === toId) return path;
      for (const edge of await this.getConnections(current)) {
        if (edge.from_id !== current || visited.has(edge.to_id)) continue;
        visited.add(edge.to_id);
        queue.push([...path, edge.to_id]);
      }
    }
    return null;
  }

  async getSourceFragment(path: string) {
    const file = samples.find(file => file.name === path || path.endsWith(file.name));
    return { path, content: file?.lines.join('\n') ?? '', language: file?.name.endsWith('.py') ? 'python' : 'tsx' };
  }
}
