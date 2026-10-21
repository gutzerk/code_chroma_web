/* Engine for the home-page demo: a sample project drawn as a map next to the agent panel of the real
   app, plus a scripted cursor that walks through plan, launch agents, walk away, and verify. A click
   inside the window hands control to the visitor. It works on the markup rendered by HomeDemo.tsx and
   returns a cleanup. */

const NS = "http://www.w3.org/2000/svg";

type Line = [string | null, string, string?];
type FileDef = { n: string; p: string; lines: Line[]; lang: string; total?: number; diff?: string };
type PlanState = 0 | "plan" | "build" | "done";
type WfStatus = "running" | "stopAfter" | "held" | "stopped" | "done";
type Msg = { role: "user" | "agent" | "system"; text: string; chip?: { label: string; node: string } };
type Wf = {
  prompt: string; st: WfStatus; cur: number; bps: number[]; sel: number | null; collapsed: boolean;
  chat: Msg[]; typing: string; redo: { from: number } | null; attempt: number; view: number; redoFrom: number;
};
type State = {
  opened: boolean; reviewed: boolean; sel: string | null; dockOpen: boolean; file: number;
  plan: PlanState; run: number; drawer: string; panel: "code" | "pick" | "wf"; wf: Wf | null;
  agents: number; away: boolean;
  /** phones: the agent panel is open as a sheet over the map */
  peek: boolean;
};
type Scene = { len: number; ev: [number, () => void][] };

const BW = 150, BH = 62;
// c = column 0..2, r = row 0..4; the map is laid out to fill whatever size the canvas has
const NODES = [
  { id: "client", g: "client", kind: "CLIENT · ENTRY", c: 1, r: 0, t: "Web client", f: "web/src/api.ts" },
  { id: "gateway", g: "edge", kind: "EDGE", c: 1, r: 1, t: "API gateway", f: "gateway/routes.py" },
  { id: "oauth", g: "identity", kind: "IDENTITY", c: 2, r: 1, t: "OAuth provider", f: "gateway/keys.py" },
  { id: "api", g: "service", kind: "SERVICE", c: 0, r: 2, t: "Orders API", f: "api/orders.py" },
  { id: "auth", g: "auth", kind: "AUTH", c: 1, r: 2, t: "get_current_user", f: "auth/deps.py" },
  { id: "jobs", g: "jobs", kind: "JOBS", c: 2, r: 2, t: "Audit log", f: "jobs/audit.py" },
  { id: "policy", g: "policy", kind: "POLICY", c: 1, r: 3, t: "Tenant policy", f: "policy/tenants.py" },
  { id: "store", g: "identity", kind: "IDENTITY", c: 0, r: 3, t: "Token store", f: "auth/refresh.py", cls: "store" },
  { id: "db", g: "data", kind: "DATA", c: 1, r: 4, t: "PostgreSQL", f: "db/roles.sql" },
];
const EDGES: { a: string; b: string; kind: "v" | "h" | "r"; l: string; cls?: string }[] = [
  { a: "client", b: "gateway", kind: "v", l: "1 token" },
  { a: "gateway", b: "oauth", kind: "h", l: "2 keys" },
  { a: "gateway", b: "auth", kind: "v", l: "3 verify" },
  { a: "auth", b: "api", kind: "h", l: "7 user" },
  { a: "auth", b: "jobs", kind: "h", l: "6 audit" },
  { a: "auth", b: "policy", kind: "v", l: "4 scopes" },
  { a: "policy", b: "db", kind: "v", l: "5 roles" },
  { a: "auth", b: "store", kind: "r", l: "refresh", cls: "store-edge" },
];
const GROUP: Record<string, string> = Object.fromEntries(NODES.map((n) => [n.id, n.g]));

// ---------- code each block opens into ----------
const AUTH: Line[] = [
  [null, "# auth/deps.py"],
  [null, "from fastapi import Depends, HTTPException"],
  ["oauth", "from gateway.keys import jwks"],
  ["policy", "from policy.tenants import check_scopes"],
  ["db", "from db.roles import load_roles"],
  ["jobs", "from jobs.audit import log_access"],
  [null, ""],
  ["auth", "async def get_current_user(token=Depends(bearer)):"],
  ["oauth", "    claims = jwt.decode(token, jwks(), audience=\"api\")"],
  ["db", "    roles = await load_roles(claims[\"tenant\"])"],
  ["policy", "    if not check_scopes(roles, claims[\"scope\"]):"],
  ["policy", "        raise HTTPException(403, \"Missing scope\")"],
  ["jobs", "    await log_access(claims[\"sub\"])"],
  ["api", "    return User(claims[\"sub\"], roles)"],
];
const AUTH_DIFF: Line[] = [
  [null, "# auth/deps.py"],
  [null, "from fastapi import Depends, HTTPException"],
  ["oauth", "from gateway.keys import jwks"],
  ["policy", "from policy.tenants import check_scopes"],
  ["db", "from db.roles import load_roles"],
  ["jobs", "from jobs.audit import log_access"],
  ["identity", "from auth.refresh import issue_refresh", "add"],
  [null, ""],
  ["auth", "async def get_current_user(token=Depends(bearer)):"],
  ["oauth", "    claims = jwt.decode(token, jwks(), audience=\"api\")"],
  ["db", "    roles = await load_roles(claims[\"tenant\"])"],
  ["policy", "    if not check_scopes(roles, claims[\"scope\"]):"],
  ["policy", "        raise HTTPException(403, \"Missing scope\")"],
  ["jobs", "    await log_access(claims[\"sub\"])"],
  ["api", "    return User(claims[\"sub\"], roles)", "del"],
  ["api", "    user = User(claims[\"sub\"], roles)", "add"],
  ["identity", "    user.refresh = await issue_refresh(user)", "add"],
  ["api", "    return user", "add"],
];
const REFRESH: Line[] = [
  [null, "# auth/refresh.py", "add"],
  [null, "import secrets", "add"],
  ["data", "from db.tokens import save_token", "add"],
  [null, "", "add"],
  ["identity", "async def issue_refresh(user):", "add"],
  ["identity", "    token = secrets.token_urlsafe(32)", "add"],
  ["data", "    await save_token(token, user.sub, ttl_days=30)", "add"],
  ["identity", "    return token", "add"],
];
const FILES: Record<string, FileDef[]> = {
  client: [{ n: "api.ts", p: "web/src/api.ts", lines: [[null, "export async function api(path, init) {"], ["oauth", "  const token = await getToken();"], ["gateway", "  return fetch(`/v1${path}`, {"], [null, "    ...init,"], [null, "    headers: { Authorization: `Bearer ${token}` },"], [null, "  });"], [null, "}"]], lang: "typescript", total: 96 }],
  gateway: [{ n: "routes.py", p: "gateway/routes.py", lines: [[null, "@router.api_route(\"/v1/{path:path}\")"], ["gateway", "async def proxy(path, request):"], ["auth", "    user = await verify(request)"], ["api", "    return await forward(request, path, user)"]], lang: "python", total: 142 }],
  oauth: [{ n: "keys.py", p: "gateway/keys.py", lines: [[null, "async def jwks():"], ["oauth", "    return await cache.get(\"jwks\", fetch_jwks)"], [null, ""], [null, "async def fetch_jwks():"], ["oauth", "    return await http.get(settings.OAUTH_JWKS_URL)"]], lang: "python", total: 58 }],
  api: [{ n: "orders.py", p: "api/orders.py", lines: [[null, "@router.get(\"/orders\")"], ["api", "async def list_orders(user=Depends(get_current_user)):"], ["db", "    return await orders.for_tenant(user.tenant)"]], lang: "python", total: 210 }],
  policy: [{ n: "tenants.py", p: "policy/tenants.py", lines: [[null, "def check_scopes(roles, scope):"], ["policy", "    allowed = {s for r in roles for s in r.scopes}"], ["policy", "    return scope in allowed"]], lang: "python", total: 74 }],
  jobs: [{ n: "audit.py", p: "jobs/audit.py", lines: [[null, "async def log_access(sub):"], ["jobs", "    await queue.put({\"event\": \"access\", \"sub\": sub})"]], lang: "python", total: 31 }],
  db: [{ n: "roles.sql", p: "db/roles.sql", lines: [[null, "SELECT role, scopes"], ["db", "FROM roles"], ["db", "WHERE tenant = $1;"]], lang: "sql", total: 22 }],
};

// ---------- the workflow the agent panel runs ----------
const STEPS = ["Plan", "Implement", "Review", "Ship"];
const STEP_SLUG = ["plan", "implement", "review", "ship"];
const ASK = "why Postgres, not Redis?";
// agents started next to the workflow, to show that several run at once on their own branches
const EXTRA_AGENTS = ["audit-log", "rate-limit"];
const PROMPT = "Add refresh tokens to the auth flow";
const WORKFLOWS = [
  { n: "Ship a feature", d: "Plan, build, review, open the PR" },
  { n: "Fix a bug", d: "Reproduce, fix, review, open the PR" },
  { n: "Refactor a module", d: "Plan, move code, review, open the PR" },
];
const STATUS_ICON = { done: "✓", running: "●", held: "‖", stopped: "■", pending: "", aside: "↺" } as const;

const KEYWORDS = /\b(from|import|async|def|await|if|not|raise|return|export|const|function|SELECT|FROM|WHERE)\b/g;
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
function highlight(src: string) {
  if (/^\s*(#|--)/.test(src)) return '<span class="tok-c">' + esc(src) + "</span>";
  return esc(src)
    .replace(/("[^"]*")/g, '<span class="tok-s">$1</span>')
    .replace(KEYWORDS, '<span class="tok-k">$1</span>')
    .replace(/\b([a-z_]+)(?=\()/g, '<span class="tok-f">$1</span>');
}

function svgEl(tag: string, attrs: Record<string, string | number>, parent?: Element) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, String(attrs[k]));
  if (parent) parent.appendChild(e);
  return e;
}

const TEXT = "Plan: add refresh tokens to the auth flow";

export function initHomeDemo(root: HTMLElement): () => void {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = <T extends HTMLElement = HTMLElement>(id: string) => root.querySelector<T>("#" + id)!;
  const demo = root; // the stage section itself carries the data-plan/dock/drawer state
  const win = $("win");
  const cursor = $("cursor") as unknown as SVGElement;
  const panel = $("panel");

  const newWf = (o?: Partial<Wf>): Wf => ({
    prompt: "", st: "running", cur: 0, bps: [], sel: null, collapsed: false, chat: [], typing: "", redo: null,
    attempt: 1, view: 1, redoFrom: 0, ...o,
  });
  const fresh = (o?: Partial<State>, run = 0): State => ({
    opened: false, reviewed: false, sel: null, dockOpen: false, file: 0, plan: 0, run, drawer: "", panel: "code", wf: null, agents: 0, away: false, peek: false, ...o,
  });
  let S = fresh();
  let pickSel = -1, pickText = "", wfName = WORKFLOWS[0].n;
  let timers: ReturnType<typeof setTimeout>[] = [];
  let auto = !reduce;
  let scene = 0;
  let disposed = false;
  let raf = 0;
  const isPhone = () => window.matchMedia("(max-width: 760px)").matches;
  const later = (fn: () => void, ms: number) => { if (reduce) { fn(); return; } timers.push(setTimeout(fn, ms)); };
  const clearTimers = () => { timers.forEach(clearTimeout); timers = []; S.run++; };

  function filesFor(id: string): FileDef[] {
    if (id === "auth") {
      return S.plan === "done"
        ? [{ n: "deps.py", p: "auth/deps.py · diff vs main", lines: AUTH_DIFF, lang: "python", diff: "+4 −1" },
           { n: "refresh.py", p: "auth/refresh.py · new file", lines: REFRESH, lang: "python", diff: "+38" }]
        : [{ n: "deps.py", p: "auth/deps.py", lines: AUTH, lang: "python", total: 88 }];
    }
    if (id === "store") return [{ n: "refresh.py", p: "auth/refresh.py · new file", lines: REFRESH, lang: "python", diff: "+38" }];
    return FILES[id];
  }

  // ---------- map ----------
  const nodeEls: Record<string, SVGElement> = {};
  const tags: Record<string, SVGElement> = {};
  let mapW = 0, mapH = 0, colH = 0;
  function buildMap() {
    const host = $("map");
    host.innerHTML = "";
    host.classList.add("map");
    // laid out for the height left when the bottom drawer is open, so the map never reshuffles when it opens
    mapW = host.clientWidth || 600; colH = ($("map").closest(".col") as HTMLElement | null)?.clientHeight || 650; // on phones the drawer floats over the map, so the map can use the full column height
    const phone = isPhone();
    mapH = Math.max(240, colH - (phone ? 64 : 170));
    // phones get narrower blocks and tighter columns, so the map is drawn larger on a narrow screen
    const W = phone ? 130 : BW, H = phone ? 58 : BH;
    const minW = phone ? 3 * W + 2 * 30 + 12 : 582;
    // blocks keep their size; the grid stretches over the whole canvas (shrinks only when it would not fit)
    const k = Math.min(1, mapW / minW, mapH / 420), vw = mapW / k, vh = mapH / k, pad = 6;
    const pos: Record<string, { x: number; y: number }> = {};
    NODES.forEach((n) => { pos[n.id] = { x: pad + n.c * (vw - W - 2 * pad) / 2, y: pad + n.r * (vh - H - 2 * pad) / 4 }; });
    const svg = svgEl("svg", { viewBox: "0 0 " + vw + " " + vh, style: "width:" + mapW + "px;height:" + mapH + "px", role: "img", "aria-label": "Architecture map of the sample project" });
    const defs = svgEl("defs", {}, svg);
    const m = svgEl("marker", { id: "cch-arw", viewBox: "0 0 8 8", refX: 7, refY: 4, markerWidth: 7, markerHeight: 7, orient: "auto-start-reverse" }, defs);
    svgEl("path", { d: "M0 0 L8 4 L0 8 z", fill: "var(--a-line)" }, m);
    EDGES.forEach((e) => {
      const A = pos[e.a], B = pos[e.b];
      let d: string, lx: number, ly: number;
      if (e.kind === "v") {
        const x = A.x + W / 2, y1 = A.y + H;
        d = "M" + x + " " + y1 + " V" + B.y; lx = x; ly = (y1 + B.y) / 2;
      } else if (e.kind === "h") {
        const left = B.x < A.x, x1 = left ? A.x : A.x + W, x2 = left ? B.x + W : B.x, y = A.y + H / 2;
        d = "M" + x1 + " " + y + " H" + x2; lx = (x1 + x2) / 2; ly = y;
      } else {
        const x1 = A.x + W / 2 - (phone ? 40 : 50), y1 = A.y + H, ym = (y1 + B.y) / 2, x2 = B.x + W / 2;
        d = "M" + x1 + " " + y1 + " V" + ym + " H" + x2 + " V" + B.y; lx = (x1 + x2) / 2; ly = ym;
      }
      const g = svgEl("g", { class: "edge" + (e.cls ? " " + e.cls : "") }, svg);
      svgEl("path", { d, "marker-end": "url(#cch-arw)" }, g);
      const lbl = svgEl("g", { class: "lbl" }, g);
      // short horizontal links on phones show only the step number
      const l = phone && e.kind === "h" ? e.l.split(" ")[0] : e.l;
      const w = l.length * (phone ? 6.4 : 5.6) + 12;
      svgEl("rect", { x: lx - w / 2, y: ly - 8, width: w, height: 16, rx: 8 }, lbl);
      svgEl("text", { x: lx, y: ly + 3.2, "text-anchor": "middle" }, lbl).textContent = l;
    });
    NODES.forEach((n) => {
      const g = svgEl("g", { class: "node " + n.id + (n.cls ? " " + n.cls : ""), "data-id": n.id, transform: "translate(" + pos[n.id].x + " " + pos[n.id].y + ")", style: "--c:var(--g-" + n.g + ")", tabindex: 0, role: "button", "aria-label": n.t + ", open code" }, svg);
      svgEl("rect", { class: "body", width: W, height: H, rx: 10 }, g);
      svgEl("path", { class: "band", d: "M0 18 V10 a10 10 0 0 1 10 -10 H" + (W - 10) + " a10 10 0 0 1 10 10 V18 Z" }, g);
      svgEl("text", { class: "kind", x: 9, y: 12.5 }, g).textContent = n.kind;
      tags[n.id] = svgEl("text", { class: "tag", x: W - 9, y: 12.5, "text-anchor": "end" }, g) as SVGElement;
      svgEl("text", { class: "t", x: 9, y: 37 }, g).textContent = n.t;
      svgEl("text", { class: "f", x: 9, y: 52 }, g).textContent = n.f;
      nodeEls[n.id] = g as SVGElement;
      g.addEventListener("click", () => openNode(n.id));
      g.addEventListener("keydown", ((ev: KeyboardEvent) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); openNode(n.id); } }) as EventListener);
    });
    host.appendChild(svg);
  }
  function setTag(id: string, text?: string, cls?: string) {
    tags[id].textContent = text || "";
    tags[id].setAttribute("class", "tag" + (cls ? " " + cls : ""));
  }

  // ---------- the agent panel ----------
  const wfState = (w: Wf, i: number): { key: keyof typeof STATUS_ICON; meta: string } => {
    if (w.attempt > 1 && w.view === 1) return [
      { key: "done", meta: "spec approved" }, { key: "done", meta: "4 files · +182 −21" },
      { key: "aside", meta: "set aside by redo" }, { key: "pending", meta: "" },
    ][i] as { key: keyof typeof STATUS_ICON; meta: string };
    if (w.st === "done" || i < w.cur) {
      const meta = ["spec approved", "4 files · +182 −21", "approved", "PR opened"][i];
      return { key: "done", meta };
    }
    if (i === w.cur) {
      if (w.st === "held") return { key: "held", meta: "held · " + (w.bps.includes(i) ? "breakpoint" : "stop after") };
      if (w.st === "stopped") return { key: "stopped", meta: "stopped · partial diff kept" };
      if (w.st === "stopAfter") return { key: "running", meta: "finishing · then holds" };
      return { key: "running", meta: ["", "writing 3 of 5 blocks", "reviewing the diff…", "opening the PR…"][i] };
    }
    return { key: "pending", meta: w.bps.includes(i) ? "stops before this step" : i === w.cur + 1 && w.st === "stopAfter" ? "run holds here" : "" };
  };

  function stepControls(w: Wf, i: number): string {
    const b = (act: string, label: string, cls = "") => '<button type="button" class="sbtn ' + cls + '" data-act="' + act + '">' + label + "</button>";
    const st = wfState(w, i).key;
    let out = "";
    if (i === w.cur && w.st !== "done") {
      if (w.st === "running") out = b("stopnow", "■ Stop now", "red") + b("stopafter", "Stop after this step", "amber") + b("redo-open:" + i, "↻ Redo…");
      else if (w.st === "stopAfter") out = b("keep", "Keep running") + b("stopnow", "■ Stop now", "red");
      else if (w.st === "held") out = b("continue", "▶ Continue", "main") + (w.bps.includes(i) ? b("bp:" + i, "Remove breakpoint") : "");
      else if (w.st === "stopped") out = b("resume", "▶ Resume", "main") + b("redo-open:" + i, "↻ Redo from here");
    } else if (st === "done") out = b("redo-open:" + i, "↻ Redo from here");
    else out = b("bp:" + i, w.bps.includes(i) ? "Remove stop" : "● Stop before this step", w.bps.includes(i) ? "" : "red");
    return '<div class="scontrols">' + out + "</div>";
  }

  function renderWf(w: Wf): string {
    const readOnly = w.attempt > 1 && w.view === 1;
    const total = STEPS.length;
    const bar = STEPS.map((_, i) => '<span class="seg" data-k="' + wfState(w, i).key + '"></span>').join("");
    const stateText = w.st === "done" ? "done" : w.st === "held" ? "held" : w.st === "stopAfter" ? "stopping after step " + (w.cur + 1) : w.st === "stopped" ? "stopped" : "running";
    const head =
      '<div class="wf-head"><b>' + wfName + '</b><span class="mono dim">step ' + Math.min(w.cur + 1, total) + "/" + total + "</span>" +
      '<span class="grow"></span><span class="wf-state" data-k="' + (w.st === "stopAfter" ? "held" : w.st) + '">' + stateText + "</span></div>" +
      (w.prompt ? '<p class="wf-prompt">“' + esc(w.prompt) + "”</p>" : "") +
      (w.attempt > 1
        ? '<div class="attempts" role="group" aria-label="Attempts">' +
          [1, 2].filter((n) => n <= w.attempt).map((n) => '<button type="button" class="sbtn" data-act="attempt:' + n + '" aria-pressed="' + (w.view === n) + '">Attempt ' + n + "</button>").join("") + "</div>"
        : "") +
      '<div class="bar4" aria-hidden="true">' + bar + "</div>";
    let rail: string;
    if (w.collapsed) {
      rail = '<button type="button" class="rail-collapsed" data-act="expand">' +
        STEPS.map((_, i) => STEP_SLUG[i] + " " + (STATUS_ICON[wfState(w, i).key] || "○")).join("  ") + " · show steps</button>";
    } else {
      const rerunFrom = w.redo ? w.redo.from : -1;
      rail = '<ol class="rail" aria-label="Workflow steps">' + STEPS.map((name, i) => {
        const s = wfState(w, i);
        const canBp = !readOnly && i > w.cur && w.st !== "done";
        const kept = w.attempt > 1 && !readOnly && i < w.redoFrom ? '<span class="stag kept">from attempt 1</span>' : "";
        const will = rerunFrom >= 0 && i >= rerunFrom ? '<span class="stag will">↻ will rerun</span>' : "";
        const open = w.sel === i && !readOnly;
        return '<li class="srow" data-k="' + s.key + '" data-open="' + open + '" data-rerun="' + (will ? "1" : "0") + '">' +
          '<div class="srow-line">' +
          (canBp ? '<button type="button" class="gut" data-act="bp:' + i + '" aria-pressed="' + w.bps.includes(i) + '" aria-label="Breakpoint before ' + STEP_SLUG[i] + '"><span class="gdot" data-set="' + w.bps.includes(i) + '"></span></button>' : '<span class="gut idle"></span>') +
          '<button type="button" class="shead" data-act="row:' + i + '" aria-expanded="' + open + '"><span class="sico">' + (STATUS_ICON[s.key] || "") + '</span><span class="snum">' + (i + 1) + '</span><span class="sname">' + name + "</span>" + kept + will + '<span class="smeta">' + s.meta + "</span></button></div>" +
          (open ? stepControls(w, i) : "") + "</li>";
      }).join("") + "</ol>";
    }
    let banner = "";
    if (readOnly) banner = '<p class="wf-banner">Attempt 1 is read-only. It was set aside by a redo.</p>';
    else if (w.st === "held") banner = '<div class="wf-banner" data-k="held"><b>Held before step ' + (w.cur + 1) + " · " + STEPS[w.cur] + "</b><span>" + (w.bps.includes(w.cur) ? "You set a breakpoint here." : "You asked to stop after the last step.") + '</span><button type="button" class="sbtn main" data-act="continue">▶ Continue</button></div>';
    else if (w.st === "stopAfter") banner = '<div class="wf-banner" data-k="held"><b>Stopping after step ' + (w.cur + 1) + "</b><span>" + STEPS[w.cur] + ' finishes, then the run holds.</span><button type="button" class="sbtn" data-act="keep">Keep running</button></div>';
    let card = "";
    if (w.redo && !readOnly) {
      const f = w.redo.from;
      const list = (a: number[]) => (a.length ? a.map((i) => STEP_SLUG[i]).join(", ") : "none");
      const idx = STEPS.map((_, i) => i);
      card = '<section class="redo" aria-label="Redo proposal"><h4>Redo from ' + STEP_SLUG[f] + "</h4>" +
        '<label class="rfield"><span>Redo from</span><select data-act="redo-from">' + STEPS.slice(0, 3).map((_, i) => '<option value="' + i + '"' + (i === f ? " selected" : "") + ">" + STEP_SLUG[i] + "</option>").join("") + "</select></label>" +
        '<dl><dt>Reruns</dt><dd>' + list(idx.filter((i) => i >= f)) + "</dd><dt>Keeps</dt><dd>" + list(idx.filter((i) => i < f)) + "</dd><dt>Sets aside</dt><dd>attempt 1 · " + list(idx.filter((i) => i >= f)) + "</dd></dl>" +
        '<p class="rnote">Note for the step: use Redis for token storage.</p>' +
        '<div class="redo-actions"><button type="button" class="sbtn main" data-act="redo-confirm">Redo from ' + STEP_SLUG[f] + '</button><button type="button" class="sbtn" data-act="redo-cancel">Cancel</button></div></section>';
    }
    const log = w.chat.slice(-3).map((m) =>
      m.role === "system" ? '<li class="chat-system">' + esc(m.text) + "</li>"
        : '<li class="chat-msg" data-role="' + m.role + '"><span class="who">' + (m.role === "user" ? "You" : "Agent") + "</span><span>" + esc(m.text) + "</span>" +
          (m.chip ? '<span class="chat-chip">' + esc(m.chip.label) + ' <button type="button" data-act="show:' + m.chip.node + '">Show on canvas</button></span>' : "") + "</li>").join("");
    const input = '<div class="chat-form"><button type="button" class="chat-input" data-act="ask" aria-label="Ask the run">' +
      (w.typing ? '<span class="typed">' + esc(w.typing) + "</span>" : '<span class="ph">Ask the run, or @step to ask one step</span>') + "</button></div>";
    return '<div class="wf">' + head + rail + banner + card + '<ul class="chat-log" aria-label="Chat">' + log + "</ul>" + input + "</div>";
  }

  function renderPanel() {
    let html: string;
    if (S.panel === "pick") {
      html = '<div class="ptabs"><span class="ptab on"><i data-k="ok"></i>agent1 <small class="mono dim">claude · main · idle</small></span></div>' + renderPick();
    } else if (S.panel === "wf" && S.wf) {
      const dot = S.wf.st === "done" ? "ok" : "run";
      const extra = EXTRA_AGENTS.slice(0, S.agents).map((n) => '<span class="ptab"><i data-k="' + dot + '"></i>' + n + "</span>").join("");
      const add = S.agents < EXTRA_AGENTS.length ? '<button type="button" class="ptab add" data-act="addagent">+ agent</button>' : "";
      html = '<div class="ptabs"><span class="ptab on"><i data-k="' + (S.wf.st === "held" || S.wf.st === "stopAfter" ? "held" : "run") + '"></i>ship-refresh <em>WORKFLOW</em></span>' + extra + add + "</div>" + renderWf(S.wf);
    } else {
      html = '<div class="ptabs"><span class="ptab on"><i data-k="ok"></i>agent1 <small class="mono dim">claude · main · idle</small></span></div>' + renderCode();
    }
    panel.innerHTML = html;
  }

  function renderPick(): string {
    const list = WORKFLOWS.map((x, i) =>
      '<li><button type="button" class="wfopt" data-act="pick:' + i + '" aria-pressed="' + (pickSel === i) + '"><b>' + x.n + "</b><span>" + x.d + "</span></button></li>").join("");
    const field = '<div class="chat-form"><button type="button" class="chat-input" data-act="fill" aria-label="Initial prompt">' +
      (pickText ? '<span class="typed">' + esc(pickText) + "</span>" : '<span class="ph">What should the workflow do?</span>') + "</button></div>";
    const ready = pickSel >= 0 && pickText.length > 0;
    return '<div class="wfpick"><h4>Run a workflow</h4><span class="lab">1 · Choose</span><ul>' + list + '</ul><span class="lab">2 · Initial prompt</span>' + field +
      '<div><button type="button" class="sbtn main" data-act="begin"' + (ready ? "" : " disabled") + ">▶ Start workflow</button></div></div>";
  }

  function renderCode(): string {
    if (!S.sel || !S.dockOpen) return '<div class="pempty"><p class="mono dim">click a block to read its code</p></div>';
    const n = NODES.filter((x) => x.id === S.sel)[0];
    const files = filesFor(S.sel), f = files[Math.min(S.file, files.length - 1)];
    let badge = "";
    if (S.plan === "done" && S.sel === "store") badge = "<em>NEW</em>";
    if (S.plan === "done" && S.sel === "auth") badge = '<em class="mod">CHANGED</em>';
    const rows = f.lines.map((l, i) => {
      const g = l[0] ? GROUP[l[0]] || l[0] : null;
      return '<div class="ln' + (l[2] ? " " + l[2] : "") + '"' + (g ? ' data-node style="--c:var(--g-' + g + ')"' : "") + '><span class="bar"></span><span class="num">' + (i + 1) + "</span><span>" + (highlight(l[1]) || " ") + "</span></div>";
    }).join("");
    const foot = f.diff
      ? '<span>diff vs main</span><span class="a">' + f.diff.split(" ")[0] + "</span>" + (f.diff.indexOf("−") > -1 ? '<span class="r">' + f.diff.split(" ")[1] + "</span>" : "") + "<span>14 tests passed</span>"
      : "<span>" + f.lang + "</span><span>" + f.total + " lines · read only</span>";
    return '<div class="dock-h"><b>' + n.t + "</b>" + badge + '<button class="x" data-act="close-code" type="button" aria-label="Close code panel">✕</button></div>' +
      '<div class="dock-tabs">' + files.map((x, i) => '<button type="button" data-act="file:' + i + '" class="' + (i === S.file ? "on" : "") + '">' + x.n + (S.plan === "done" && files.length > 1 ? (i ? " +" : " ~") : "") + "</button>").join("") + "</div>" +
      '<div class="dock-path">' + f.p + "</div>" +
      '<div class="code">' + rows + "</div>" +
      '<div class="dock-f">' + foot + "</div>";
  }

  // ---------- workflow actions ----------
  function wfAdvance() {
    const w = S.wf;
    if (!w || w.st === "done" || w.st === "held" || w.st === "stopped") return;
    const wasStopAfter = w.st === "stopAfter";
    w.sel = null;
    if (w.cur >= STEPS.length - 1) { w.st = "done"; render(); return; }
    w.cur += 1;
    if (w.cur >= 2) S.plan = "done";
    w.st = wasStopAfter || w.bps.includes(w.cur) ? "held" : "running";
    render();
  }
  // a visitor driving the demo: the run advances on its own
  function schedule() {
    if (auto) return;
    const token = S.run;
    later(() => {
      if (token !== S.run || !S.wf || S.wf.st === "done") return;
      if (S.wf.st === "running" || S.wf.st === "stopAfter") wfAdvance();
      if (S.wf.st === "running") schedule();
    }, 1800);
  }
  function ring(id: string) {
    const el = nodeEls[id];
    el.classList.add("ring");
    later(() => el.classList.remove("ring"), 1800);
  }
  function reply(text: string, chip?: Msg["chip"]) { S.wf!.chat.push({ role: "agent", text, chip }); render(); }
  function send(text: string) {
    const w = S.wf!;
    w.collapsed = true; w.typing = "";
    w.chat.push({ role: "user", text });
    render();
  }
  function ask() {
    const w = S.wf;
    if (!w || w.typing || w.chat.length) return;
    send(ASK);
    later(() => { reply("Roles already live in Postgres, so refresh tokens reuse it.", { label: "Token store", node: "store" }); }, 900);
  }

  function act(a: string, value?: string) {
    const [name, arg] = a.split(":");
    const w = S.wf;
    switch (name) {
      case "close-code": closeDock(); return;
      case "file": S.file = +arg; render(); return;
      case "run": openPicker(); return;
      case "pick": pickSel = +arg; wfName = WORKFLOWS[pickSel].n; if (!auto) pickText = PROMPT; render(); return;
      case "fill": if (pickSel >= 0 && !pickText) pickText = PROMPT; render(); return;
      case "begin": doRun(); return;
      case "ask": ask(); return;
      case "show": ring(arg); render(); return;
      case "addagent": if (S.agents < EXTRA_AGENTS.length) S.agents++; render(); return;
    }
    if (!w) return;
    const i = +arg;
    switch (name) {
      case "bp": w.bps = w.bps.includes(i) ? w.bps.filter((x) => x !== i) : [...w.bps, i]; break;
      case "row": w.sel = w.sel === i ? null : i; break;
      case "stopafter": w.st = "stopAfter"; break;
      case "stopnow": w.st = "stopped"; break;
      case "keep": w.st = "running"; schedule(); break;
      case "resume": case "continue": w.st = "running"; w.sel = null; schedule(); break;
      case "expand": w.collapsed = false; break;
      case "redo-open": w.redo = { from: i }; w.collapsed = false; break;
      case "redo-from": w.redo = { from: +(value ?? 1) }; break;
      case "redo-cancel": w.redo = null; break;
      case "redo-confirm": {
        const from = w.redo ? w.redo.from : 1;
        w.attempt = 2; w.view = 2; w.redoFrom = from; w.redo = null; w.cur = from; w.st = "running"; w.sel = null; w.collapsed = false;
        w.chat.push({ role: "system", text: "Attempt 2 started from " + STEP_SLUG[from] + "." });
        schedule();
        break;
      }
      case "attempt": w.view = i; break;
    }
    render();
  }

  // ---------- actions ----------
  function openNode(id: string) {
    if (id === "store" && !S.plan) return;
    // clicking the planned block again closes its description (no separate ✕ button)
    if (id === "store" && S.plan !== "done" && S.drawer === "desc" && S.sel === "store") {
      S.drawer = ""; S.sel = null; render(); return;
    }
    S.opened = true; S.sel = id; S.file = 0; S.panel = "code";
    if (id === "auth" && S.plan === "done") S.reviewed = true;
    if (id === "store" && S.plan !== "done") {
      // a planned block has no code yet: it opens its description, not the code panel
      S.dockOpen = false; S.drawer = "desc";
    } else {
      S.dockOpen = true;
      if (S.drawer === "desc") S.drawer = "";
    }
    render();
  }
  function closeDock() { S.dockOpen = false; S.sel = null; render(); }

  function typeInto(text: string, done: () => void, token: number) {
    const box = $("ptext");
    if (reduce) { box.textContent = text; done(); return; }
    let i = 0;
    (function step() {
      if (token !== S.run) return;
      i++; box.textContent = text.slice(0, i);
      if (i < text.length) timers.push(setTimeout(step, 32)); else timers.push(setTimeout(done, 450));
    })();
  }
  function doPlan() {
    if (S.plan) return;
    S.opened = true;
    const token = ++S.run;
    S.dockOpen = false; S.sel = null;
    S.drawer = "prompt"; render();
    typeInto(TEXT, () => {
      if (token !== S.run) return;
      S.plan = "plan"; S.drawer = "q"; render();
    }, token);
  }
  function answer() { S.drawer = ""; render(); }
  function openPicker() {
    if (S.wf) return;
    S.opened = true;
    ++S.run;
    pickSel = -1; pickText = "";
    S.dockOpen = false; S.sel = null; S.drawer = "";
    S.panel = "pick";
    render();
  }
  function doRun() {
    if (S.wf || pickSel < 0 || !pickText) return;
    ++S.run;
    S.plan = "build"; S.panel = "wf"; S.peek = true; S.wf = newWf({ prompt: pickText });
    render();
    schedule();
  }
  function reset(o?: Partial<State>) {
    clearTimers();
    pickSel = -1; pickText = ""; wfName = WORKFLOWS[0].n;
    S = fresh(o, S.run);
    $("ptext").textContent = "";
    $("pr").textContent = "Create PR ↗"; $("pr").classList.remove("sent");
    Object.values(nodeEls).forEach((n) => n.classList.remove("ring"));
    render();
  }

  // ---------- paint ----------
  function render() {
    demo.dataset.plan = String(S.plan || "0");
    demo.dataset.drawer = S.drawer || "";
    const w = S.wf;
    let step = !S.opened ? 1 : !S.plan ? 2 : !w ? 3 : w.collapsed || w.redo || w.attempt > 1 || w.chat.length ? 4 : 3;
    if (S.plan === "plan" && S.drawer === "q") step = 2;
    if (auto) step = scene + 1;
    Object.keys(nodeEls).forEach((id) => {
      nodeEls[id].classList.toggle("sel", id === S.sel && S.dockOpen);
      nodeEls[id].classList.remove("hint");
    });
    const hintId = step === 1 ? "auth" : null;
    if (hintId && !auto) nodeEls[hintId].classList.add("hint");
    $("draw").classList.toggle("hintbtn", !auto && step === 2 && !S.drawer);
    $("run").classList.toggle("hintbtn", !auto && S.plan === "plan" && !S.drawer && !w && S.panel !== "pick");
    const done = S.plan === "done";
    setTag("auth", done ? "+4 −1" : S.plan ? "~ MODIFY" : "", done ? "ok" : "mod");
    setTag("store", done ? "NEW" : S.plan ? "+ ADD" : "", "ok");
    const away = $("away");
    away.hidden = !S.away;
    away.textContent = "You're away · " + (1 + S.agents) + " agents building";
    $("verdict").hidden = !(done && S.reviewed);
    // agents shown on the map itself (phones hide the side panel behind a sheet)
    const bar = $("agentbar");
    bar.hidden = !w || S.away;
    if (w) {
      const dot = w.st === "done" ? "ok" : w.st === "held" || w.st === "stopAfter" ? "held" : "run";
      bar.innerHTML = ["ship-refresh", ...EXTRA_AGENTS.slice(0, S.agents)].map((n) => '<span class="achip"><i data-k="' + dot + '"></i>' + n + "</span>").join("");
    }
    const pill = $("wfpill");
    pill.hidden = !w;
    if (w) {
      pill.dataset.k = w.st === "held" || w.st === "stopAfter" ? "held" : w.st === "stopped" ? "stop" : "run";
      pill.textContent = w.st === "done" ? wfName + " · done" : wfName + " · step " + (w.cur + 1) + "/4" + (w.st === "held" ? " · held" : "");
    }
    root.querySelectorAll<HTMLElement>("#flow li").forEach((li) => {
      const s = +li.dataset.s!;
      li.classList.toggle("on", s === step);
      li.classList.toggle("done", s < step);
      li.querySelector(".num")!.textContent = s < step ? "✓" : String(s);
    });
    // phones: the agent panel opens as a sheet over the map only while the step is happening in it
    const sheet = S.panel === "pick" ? "full" : (S.panel === "wf" && S.peek && !S.away) ? "tall"
      : S.panel === "code" && S.dockOpen && S.sel ? "short" : "off";
    win.dataset.sheet = sheet;
    renderPanel();
  }

  // ---------- wiring ----------
  buildMap();
  let rzTimer = 0;
  const ro = "ResizeObserver" in window ? new ResizeObserver(() => {
    clearTimeout(rzTimer);
    rzTimer = window.setTimeout(() => {
      const h = $("map"), c = h.closest(".col") as HTMLElement | null;
      if (disposed || (Math.abs(h.clientWidth - mapW) < 3 && Math.abs((c?.clientHeight ?? colH) - colH) < 3)) return;
      buildMap(); render();
    }, 120);
  }) : null;
  ro?.observe($("map").closest(".col") ?? $("map"));
  $("draw").onclick = () => doPlan();
  $("run").onclick = openPicker;
  const replay = root.querySelector<HTMLElement>("#replay");
  if (replay) replay.onclick = () => startScene(0);
  $("pr").onclick = () => { $("pr").textContent = "PR opened ✓"; $("pr").classList.add("sent"); };
  root.querySelectorAll<HTMLElement>(".opt").forEach((b) => { b.onclick = answer; });
  root.querySelectorAll<HTMLElement>("#flow li").forEach((li) => {
    li.querySelector<HTMLElement>("button")!.onclick = () => startScene(+li.dataset.s! - 1);
  });
  const onPanelClick = (ev: Event) => {
    const t = (ev.target as HTMLElement).closest<HTMLElement>("[data-act]");
    if (t && t.tagName !== "SELECT") act(t.dataset.act!);
  };
  const onPanelChange = (ev: Event) => {
    const t = ev.target as HTMLSelectElement;
    if (t.dataset.act) act(t.dataset.act, t.value);
  };
  panel.addEventListener("click", onPanelClick);
  panel.addEventListener("change", onPanelChange);

  // ---------- the demo: a cursor that uses the tool, scene by scene ----------
  let visible = true;
  function mv(elm: Element | null, dx = 0, dy = 0) {
    if (!elm) return;
    const a = win.getBoundingClientRect(), r = elm.getBoundingClientRect();
    // the cursor never leaves the window, however small the screen is
    const x = Math.max(4, Math.min(a.width - 18, r.left - a.left + r.width / 2 + dx));
    const y = Math.max(4, Math.min(a.height - 18, r.top - a.top + r.height / 2 + dy));
    cursor.style.transform = "translate(" + x + "px," + y + "px)";
  }
  // jump the cursor to a spot with no travel, so a scene starts from a clean place
  function place(elm: Element | null, dx = 0, dy = 0) {
    cursor.classList.add("snap");
    mv(elm, dx, dy);
    void (cursor as unknown as HTMLElement).getBoundingClientRect();
    cursor.classList.remove("snap");
  }
  const q = (sel: string) => root.querySelector(sel);
  function rip() { cursor.classList.remove("click"); void (cursor as unknown as HTMLElement).getBoundingClientRect(); cursor.classList.add("click"); }
  const pre = (extra: Partial<Wf>, st: Partial<State>): Partial<State> => ({ opened: true, panel: "wf", wf: newWf(extra), ...st });

  // Each scene runs about 8 to 9 seconds and keeps acting until about 1.5s before it ends.
  const SCENES: (() => Scene)[] = [
    // 1 · plan: describe a feature, answer one question, the planned blocks appear on the map
    () => {
      const ev: [number, () => void][] = [
        [0, () => { reset({ opened: true }); place($("map"), 60, 150); }],
        [300, () => mv($("draw"))],
        [950, () => { rip(); S.drawer = "prompt"; render(); }],
        [2900, () => { S.plan = "plan"; S.drawer = "q"; render(); }],
        [3900, () => mv(q(".opt.rec"))],
        [4550, () => { rip(); answer(); }],
        [5050, () => mv(nodeEls.store)],
        [5700, () => { rip(); openNode("store"); }],
        [7550, () => { S.drawer = ""; S.sel = null; render(); }],
      ];
      for (let i = 1; i <= TEXT.length; i++) ev.push([1200 + i * 30, () => { $("ptext").textContent = TEXT.slice(0, i); }]);
      return { len: 9000, ev };
    },
    () => {
      // 2 · run agents: start the workflow, then add two more that run next to it
      const ev: [number, () => void][] = [
        [0, () => { reset({ opened: true, plan: "plan" }); place($("map"), 60, 150); }],
        [300, () => mv($("run"))],
        [950, () => { rip(); act("run"); }],
        [1450, () => mv(q('[data-act="pick:0"]'))],
        [2100, () => { rip(); act("pick:0"); }],
        [2500, () => mv(q('[data-act="fill"]'), 40, 0)],
        [4400, () => mv(q('[data-act="begin"]'))],
        [5050, () => { rip(); act("begin"); }],
        [6200, () => mv(q('[data-act="addagent"]'))],
        [6850, () => { rip(); act("addagent"); }],
        [7500, () => { rip(); act("addagent"); }],
      ];
      for (let i = 1; i <= PROMPT.length; i++) ev.push([2700 + i * 45, () => { pickText = PROMPT.slice(0, i); renderPanel(); }]);
      return { len: 9300, ev };
    },
    () => ({ len: 8200, ev: [
      // 3 · walk away: the cursor leaves, the agents keep building and the planned blocks turn green
      [0, () => { reset(pre({ cur: 1, prompt: PROMPT }, { plan: "build", agents: 2 })); place($("map"), 60, 150); }],
      [400, () => mv(win, 0, 340)],
      [1300, () => { S.away = true; cursor.style.opacity = "0"; render(); }],
      [3300, () => wfAdvance()],
      [5600, () => wfAdvance()],
    ] }),
    () => ({ len: 9200, ev: [
      // 4 · verify: back on the same map, the result either matches the plan or it doesn't
      [0, () => { reset(pre({ cur: 3, prompt: PROMPT }, { plan: "done", agents: 2 })); cursor.style.opacity = "1"; place($("map"), 60, 150); }],
      [400, () => mv(nodeEls.auth)],
      [1050, () => { rip(); openNode("auth"); }],
      // phones: close the code sheet first so the next block is in view
      [2900, () => { if (isPhone()) closeDock(); }],
      [3400, () => mv(nodeEls.store)],
      [4050, () => { rip(); openNode("store"); }],
      [5600, () => wfAdvance()],
      [6500, () => mv($("pr"))],
      [7150, () => { rip(); $("pr").click(); }],
    ] }),
  ];
  let cur: Scene | null = null, st = 0, fi = 0, lastT = 0;
  function startScene(i: number) {
    auto = true; scene = i; cursor.style.opacity = "1";
    cur = SCENES[i](); cur.ev.sort((a, b) => a[0] - b[0]);
    st = 0; fi = 0; render();
  }
  const bars = root.querySelectorAll<HTMLElement>("#flow li");
  function frame(now: number) {
    if (disposed) return;
    const dt = now - lastT; lastT = now;
    if (auto && cur && visible) {
      st += Math.min(dt, 100);
      while (fi < cur.ev.length && cur.ev[fi][0] <= st) { cur.ev[fi][1](); fi++; }
      if (st >= cur.len) startScene((scene + 1) % SCENES.length);
    }
    bars.forEach((li, k) => {
      li.style.setProperty("--p", auto && k === scene && cur ? Math.min(100, st / cur.len * 100) + "%" : "0%");
    });
    raf = requestAnimationFrame(frame);
  }
  // the show is a presentation: the window ignores the pointer
  if (!reduce) win.toggleAttribute("inert", true);
  let io: IntersectionObserver | null = null;
  if ("IntersectionObserver" in window) {
    io = new IntersectionObserver((e) => { visible = e[0].isIntersecting; }, { threshold: 0.25 });
    io.observe(win);
  }

  if (auto) { lastT = performance.now(); startScene(0); raf = requestAnimationFrame(frame); } else render();

  return () => {
    disposed = true;
    cancelAnimationFrame(raf);
    timers.forEach(clearTimeout);
    io?.disconnect();
    ro?.disconnect();
    clearTimeout(rzTimer);
    panel.removeEventListener("click", onPanelClick);
    panel.removeEventListener("change", onPanelChange);
  };
}
