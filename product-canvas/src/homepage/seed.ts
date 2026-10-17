import { FIXTURE_NODES, type FixtureNode } from '../engine-client/fixtures';
import { MockBridgeEngineClient } from '../engine-client/mockBridge';
import type { CanvasBatch, CanvasBatchResult, CanvasDoc, CanvasElement, FunctionDiff, ImpactChanges } from '../state/types';
import type { SidecarKind, SidecarPayload } from '../engine-client/EngineClient';
import samples from './codeSamples.json';
import scenario from './architectureScenario.json';

export const groups = scenario.nodes;
const connections = scenario.connections;
const LAYOUT_STORAGE_KEY = 'codechroma-homepage-layout-v1';

const HOMEPAGE_IMPACT_BLOCKS = [
  { key: 'client', label: 'Web / Mobile Client', description: 'Starts OAuth sign-in and sends the access token with each request.', status: 'context', kind: 'ui', node_id: 'homepage-impact-client', sample: 0, fill: '#183653', border: '#6f9bc2' },
  { key: 'oauth', label: 'OAuth 2.0 Provider', description: 'New Authorization Code + PKCE flow issues short-lived access tokens.', status: 'new', kind: 'auth', node_id: 'homepage-impact-oauth', sample: 3, fill: '#16433f', border: '#42c5ae' },
  { key: 'gateway', label: 'API Gateway', description: 'Changes routing to require a verified bearer token before dispatch.', status: 'modified', kind: 'api', node_id: 'homepage-impact-gateway', sample: 2, fill: '#3b315c', border: '#a98be8' },
  { key: 'jwt-guard', label: 'JWT + Scope Guard', description: 'Verifies issuer, audience, expiry, and required scopes.', status: 'modified', kind: 'auth', node_id: 'homepage-impact-jwt-guard', sample: 3, fill: '#3b315c', border: '#a98be8' },
  { key: 'tenant-policy', label: 'Tenant Policy Service', description: 'New authorization check maps identity claims to tenant permissions.', status: 'new', kind: 'service', node_id: 'homepage-impact-tenant-policy', sample: 9, fill: '#16433f', border: '#42c5ae' },
  { key: 'postgres', label: 'PostgreSQL · roles & tenants', description: 'Existing role and tenant membership data used by policy checks.', status: 'context', kind: 'database', node_id: 'homepage-impact-postgres', sample: 8, fill: '#183653', border: '#6f9bc2' },
  { key: 'protected-api', label: 'Protected API', description: 'Receives the request only after identity and tenant policy checks pass.', status: 'context', kind: 'service', node_id: 'homepage-impact-protected-api', sample: 4, fill: '#183653', border: '#6f9bc2' },
  { key: 'legacy-auth', label: 'Password-only Auth', description: 'Removed legacy path; credentials are no longer checked by the API.', status: 'deleted', kind: 'auth', node_id: 'homepage-impact-legacy-auth', sample: 3, fill: '#452d3c', border: '#cf8397' },
] as const;

const HOMEPAGE_IMPACT_CHANGES: ImpactChanges = {
  fingerprint: 'homepage-auth-impact-v1',
  reviewed_fingerprint: 'homepage-auth-impact-v1',
  has_review: true,
  stale: false,
  summary: 'OAuth 2.0 + PKCE replaces password-only authentication. The gateway validates JWT claims, then tenant policy checks roles before protected APIs run.',
  blocks: [
    { block: 'oauth', node_id: 'homepage-impact-oauth', name: 'OAuth 2.0 Provider', path: 'identity/authorization.py', status: 'added', files: [{ path: 'identity/authorization.py', status: 'added' }], change_count: 1, before: 'The API accepted credentials through a password-only sign-in flow.', after: 'The client uses OAuth 2.0 Authorization Code + PKCE and receives short-lived access tokens.', explanation: 'Centralizes identity and avoids handling user passwords in application services.', pr_comments: [] },
    { block: 'gateway', node_id: 'homepage-impact-gateway', name: 'API Gateway', path: 'gateway/routes.py', status: 'modified', files: [{ path: 'gateway/routes.py', status: 'modified' }], change_count: 1, before: 'Protected routes dispatched requests without a shared token-validation step.', after: 'Every protected route requires a verified bearer token before dispatch.', explanation: 'A single enforcement point prevents individual APIs from skipping authentication.', pr_comments: [] },
    { block: 'jwt-guard', node_id: 'homepage-impact-jwt-guard', name: 'JWT + Scope Guard', path: 'identity/authorization.py', status: 'modified', files: [{ path: 'identity/authorization.py', status: 'modified' }], change_count: 1, before: 'The request guard trusted decoded token claims.', after: 'The guard verifies issuer, audience, expiry, signature, and required scopes.', explanation: 'Rejects forged, expired, or incorrectly scoped tokens before policy evaluation.', pr_comments: [] },
    { block: 'tenant-policy', node_id: 'homepage-impact-tenant-policy', name: 'Tenant Policy Service', path: 'storage/quotas.py', status: 'added', files: [{ path: 'storage/quotas.py', status: 'added' }], change_count: 1, before: 'Authorization did not consistently check tenant membership.', after: 'A policy check resolves tenant roles and resource scopes for each request.', explanation: 'Keeps tenant isolation and role decisions in one reusable authorization step.', pr_comments: [] },
    { block: 'legacy-auth', node_id: 'homepage-impact-legacy-auth', name: 'Password-only Auth', path: 'identity/authorization.py', status: 'removed', files: [{ path: 'identity/authorization.py', status: 'deleted' }], change_count: 1, before: 'Password-only authentication was accepted by the API.', after: 'The password-only path is removed; sign-in goes through OAuth 2.0 + PKCE.', explanation: 'Removes the legacy credential flow after the new provider is enabled.', pr_comments: [] },
  ],
  ghosts: [],
  relationships: [
    { from: 'client', to: 'oauth', label: 'SIGN-IN · PKCE', status: 'added', explanation: 'Clients start the new OAuth authorization flow.' },
    { from: 'legacy-auth', to: 'gateway', label: 'REMOVED · PASSWORD FLOW', status: 'removed', explanation: 'The old password-only route is no longer accepted.' },
  ],
  unassigned: [],
  changed_file_count: 3,
  general_pr_comments: [],
};

function homepageFileNode(nodeId: string, sampleIndex: number): FixtureNode {
  const file = samples[sampleIndex];
  return {
    node_id: nodeId,
    name: file.name,
    level: 'file',
    parent_id: 'homepage-group-1',
    has_children: false,
    child_count: 0,
    children: [],
    source: file.lines.join('\n'),
    language: file.name.endsWith('.py') ? 'python' : 'tsx',
  };
}

const HOMEPAGE_IMPACT_EDGES = [
  { from: 'client', to: 'oauth', label: 'SIGN-IN · PKCE', color: '#58d4c2' },
  { from: 'oauth', to: 'gateway', label: 'ACCESS TOKEN', color: '#58d4c2' },
  { from: 'gateway', to: 'jwt-guard', label: 'VERIFY JWT', color: '#93baff' },
  { from: 'jwt-guard', to: 'tenant-policy', label: 'IDENTITY + SCOPES', color: '#b69aff' },
  { from: 'tenant-policy', to: 'postgres', label: 'LOAD ROLES', color: '#93baff' },
  { from: 'tenant-policy', to: 'protected-api', label: 'ALLOW / DENY', color: '#93baff' },
  { from: 'legacy-auth', to: 'gateway', label: 'REMOVED · PASSWORD FLOW', color: '#9aa8b8', secondary: true },
] as const;

export const HOMEPAGE_IMPACT_POSITIONS: Record<string, { x: number; y: number }> = {
  client: { x: -720, y: 140 },
  oauth: { x: -240, y: 140 },
  gateway: { x: 240, y: 140 },
  'jwt-guard': { x: 720, y: 140 },
  'tenant-policy': { x: 1200, y: 140 },
  postgres: { x: 1200, y: 560 },
  'protected-api': { x: 720, y: 560 },
  'legacy-auth': { x: -240, y: 560 },
};

type SavedPositions = Record<string, { x: number; y: number }>;

function readSavedPositions(): SavedPositions {
  try {
    const raw = window.localStorage.getItem(LAYOUT_STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};
    const saved = Object.fromEntries(Object.entries(parsed).filter((entry): entry is [string, { x: number; y: number }] => {
      const value = entry[1] as { x?: unknown; y?: unknown } | null;
      return entry[0].startsWith('homepage-group-') && typeof value?.x === 'number' && Number.isFinite(value.x)
        && typeof value?.y === 'number' && Number.isFinite(value.y);
    }));
    const ordered = groups.map((_, index) => saved[`homepage-group-${index}`]);
    // Older builds also saved Sequence participant positions here. Those coordinates form evenly
    // spaced columns with a shared y; they are not a user-authored architecture layout. Restore the
    // canonical scenario coordinates once so a polluted localStorage value cannot keep shifting it.
    const sequenceSnapshot = ordered.length > 2 && ordered.every(Boolean)
      && ordered.every((position) => position!.y === ordered[0]!.y)
      && ordered.slice(1).every((position, index) => Math.abs((position!.x - ordered[index]!.x) - 260) < 0.01);
    if (sequenceSnapshot) {
      const restored = Object.fromEntries(groups.map((group, index) => [
        `homepage-group-${index}`, { x: group.x, y: group.y },
      ]));
      window.localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(restored));
      return restored;
    }
    return saved;
  } catch {
    return {};
  }
}

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
HOMEPAGE_IMPACT_BLOCKS.forEach((block) => {
  FIXTURE_NODES[block.node_id] = homepageFileNode(block.node_id, block.sample);
});
for (const [path, sampleIndex] of [
  ['identity/authorization.py', 3],
  ['gateway/routes.py', 2],
  ['storage/quotas.py', 9],
] as const) {
  const nodeId = `component::${path}`;
  FIXTURE_NODES[nodeId] = homepageFileNode(nodeId, sampleIndex);
}

export class HomepageEngineClient extends MockBridgeEngineClient {
  readonly alwaysShowImpactChanges = true;
  readonly acceptDisabled = true;

  override async getDiff(signal?: AbortSignal): Promise<FunctionDiff[]> {
    const existing = await super.getDiff(signal);
    const snippets: FunctionDiff[] = [
      { node_id: 'homepage-impact-oauth', name: 'OAuth 2.0 Provider', level: 'file', status: 'added', original_source: '', proposed_source: 'async def exchange_code(code: str, verifier: str) -> AccessToken:\n    token = await oauth.exchange(code, code_verifier=verifier)\n    return AccessToken(value=token.access_token, expires_at=token.expires_at)' },
      { node_id: 'homepage-impact-gateway', name: 'API Gateway', level: 'file', status: 'modified', original_source: 'async def dispatch(request):\n    return await route(request)', proposed_source: 'async def dispatch(request):\n    token = bearer_token(request)\n    request.state.user = await get_current_user(token)\n    return await route(request)' },
      { node_id: 'homepage-impact-jwt-guard', name: 'JWT + Scope Guard', level: 'file', status: 'modified', original_source: 'def get_current_user(token):\n    return decode_token(token, verify_signature=False)', proposed_source: 'def get_current_user(token, required_scopes=()):\n    claims = verify_jwt(token, issuer=ISSUER, audience=AUDIENCE)\n    require_scopes(claims, required_scopes)\n    return claims' },
      { node_id: 'homepage-impact-tenant-policy', name: 'Tenant Policy Service', level: 'file', status: 'added', original_source: '', proposed_source: 'async def authorize_tenant(user, tenant_id, resource):\n    roles = await memberships.roles_for(user.id, tenant_id)\n    scopes = scopes_for(roles, resource)\n    return PolicyDecision(allowed=bool(scopes), scopes=scopes)' },
      { node_id: 'homepage-impact-legacy-auth', name: 'Password-only Auth', level: 'file', status: 'deleted', original_source: 'async def authenticate_user(username, password):\n    user = await users.by_username(username)\n    if not verify_password(password, user.password_hash):\n        raise Unauthorized()\n    return user', proposed_source: '' },
    ];
    const syntheticIds = new Set(snippets.map((diff) => diff.node_id));
    return [...existing.filter((diff) => !syntheticIds.has(diff.node_id)), ...snippets];
  }

  async seed() {
    const savedPositions = readSavedPositions();
    const elements: Record<string, CanvasElement> = {};
    const layer = scenario.name;
    const zoneElements: CanvasElement[] = scenario.zones.map((label, i) => ({
      id: `homepage-zone-${i}`, render: 'group', layer, label, description: '',
      node_id: null, position: { x: 0, y: 0 }, size: null, group_id: null, meta: {}, created_by: 'user',
    }));
    const colors: Record<string, { border: string; fill: string }> = {
      blue: { border: '#2563a9', fill: '#b4c9dc' },
      cyan: { border: '#13767b', fill: '#b2d0cf' },
      violet: { border: '#7547a7', fill: '#cbbbdc' },
      amber: { border: '#9a620a', fill: '#dec994' },
      green: { border: '#13744d', fill: '#afd0bf' },
      pink: { border: '#9a3d78', fill: '#d9bdce' },
    };
    groups.forEach((group, i) => {
      const id = `homepage-block-${i}`;
      elements[id] = { id, render: 'pattern', layer, label: group.name,
        description: group.description, node_id: `homepage-group-${i}`,
        position: savedPositions[`homepage-group-${i}`] ?? { x: group.x, y: group.y },
        size: { w: 250, h: 100 }, group_id: `homepage-zone-${group.zone}`,
        meta: {
          kind: group.kind,
          open_file_id: `homepage-file-${group.files[0]}`,
          open_file_name: samples[group.files[0]].name,
        }, style: { 'border-color': colors[group.tint].border, background: colors[group.tint].fill }, created_by: 'user' };
    });
    const doc: CanvasDoc = { schema_version: 1, doc_id: 'homepage', updated_at: '', elements,
      edges: Object.fromEntries(connections.map(({ from, to, label, secondary }, i) => [`homepage-edge-${i}`, {
        id: `homepage-edge-${i}`, from: `homepage-block-${from}`, to: `homepage-block-${to}`,
        label, kind: secondary ? 'secondary' : 'call', layer,
      }])) };
    // Use the public mutation API so dragging/undo/diagrams continue through the real stores.
    const result = await this.patchCanvas({ ops: [
      ...zoneElements.map(element => ({ op: 'add_group' as const, ...element, temp_id: element.id })),
      ...Object.values(elements).map(element => ({ op: 'add_element' as const, ...element, temp_id: element.id })),
      ...Object.values(doc.edges).map(edge => ({ op: 'add_edge' as const, ...edge })),
    ] });
    if (!result.ok) throw new Error(result.errors.map(error => error.message).join('; '));
  }

  override async runRecipe(recipe: string): Promise<CanvasBatchResult> {
    if (recipe !== 'impact') return super.runRecipe(recipe);
    const doc = await this.getCanvas();
    const ops = Object.values(doc.elements)
      .filter((element) => element.layer === 'impact')
      .map((element) => ({ op: 'delete_element' as const, id: element.id }));
    ops.push(...HOMEPAGE_IMPACT_BLOCKS.map((block) => ({
      op: 'add_element' as const,
      temp_id: `homepage-impact-${block.key}`,
      render: 'impact',
      layer: 'impact',
      label: block.label,
      description: block.description,
      node_id: block.node_id ?? null,
      size: { w: 300, h: 108 },
      meta: { recipe_key: block.node_id, position_key: block.key, status: block.status, kind: block.kind },
      style: { 'background-color': block.fill, 'border-color': block.border },
      created_by: 'ai' as const,
    })));
    ops.push(...HOMEPAGE_IMPACT_EDGES.map((edge) => ({
      op: 'add_edge' as const,
      from: `homepage-impact-${edge.from}`,
      to: `homepage-impact-${edge.to}`,
      label: edge.label,
      kind: edge.secondary ? 'impact-secondary' : 'impact',
      layer: 'impact',
      style: { color: edge.color },
    })));
    return this.patchCanvas({ layer: 'impact', explanation: 'homepage authorization change impact', ops });
  }

  override async getSidecar<K extends SidecarKind>(kind: K): Promise<SidecarPayload[K]> {
    if (kind === 'changes') return HOMEPAGE_IMPACT_CHANGES as SidecarPayload[K];
    return super.getSidecar(kind);
  }

  override async patchCanvas(batch: CanvasBatch): Promise<CanvasBatchResult> {
    const result = await super.patchCanvas(batch);
    if (!result.ok) return result;
    try {
      const doc = await this.getCanvas();
      const positions = Object.fromEntries(Object.entries(doc.elements)
        .filter(([, element]) => element.layer === scenario.name
          && element.node_id?.startsWith('homepage-group-') && element.position)
        .map(([, element]) => [element.node_id!, element.position]));
      window.localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(positions));
    } catch {
      // The canvas still works when browser storage is disabled; only cross-reload saving is skipped.
    }
    return result;
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
