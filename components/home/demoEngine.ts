/* Engine for the home-page demo: a sample project drawn as a map, plus a scripted cursor that walks
   through explore, plan and build. A click inside the window hands control to the visitor. Ported
   from the v10 prototype; it works on the markup rendered by HomeDemo.tsx and returns a cleanup. */

const NS = "http://www.w3.org/2000/svg";

type Line = [string | null, string, string?];
type FileDef = { n: string; p: string; lines: Line[]; lang: string; total?: number; diff?: string };
type PlanState = 0 | "plan" | "build" | "done";
type State = {
  opened: boolean; reviewed: boolean; sel: string | null; dockOpen: boolean; file: number;
  plan: PlanState; run: number; drawer: string;
};
type Scene = { len: number; ev: [number, () => void][] };

const W = 150, H = 62;
const NODES = [
  { id: "client", g: "client", x: 30, y: 36, t: "Web client", f: "web/src/api.ts" },
  { id: "gateway", g: "edge", x: 245, y: 36, t: "API gateway", f: "gateway/routes.py" },
  { id: "oauth", g: "identity", x: 460, y: 36, t: "OAuth provider", f: "gateway/keys.py" },
  { id: "api", g: "service", x: 30, y: 176, t: "Orders API", f: "api/orders.py" },
  { id: "auth", g: "auth", x: 245, y: 176, t: "get_current_user", f: "auth/deps.py" },
  { id: "policy", g: "policy", x: 460, y: 176, t: "Tenant policy", f: "policy/tenants.py" },
  { id: "store", g: "identity", x: 30, y: 316, t: "Token store", f: "auth/refresh.py", cls: "store" },
  { id: "jobs", g: "jobs", x: 245, y: 316, t: "Audit log", f: "jobs/audit.py" },
  { id: "db", g: "data", x: 460, y: 316, t: "PostgreSQL", f: "db/roles.sql" },
];
const EDGES = [
  { d: "M180 67 H245", l: "token", lx: 212, ly: 67 },
  { d: "M395 67 H460", l: "keys", lx: 427, ly: 67 },
  { d: "M320 98 V176", l: "verify", lx: 320, ly: 137 },
  { d: "M245 207 H180", l: "user", lx: 212, ly: 207 },
  { d: "M395 207 H460", l: "scopes", lx: 427, ly: 207 },
  { d: "M320 238 V316", l: "audit", lx: 320, ly: 277 },
  { d: "M535 238 V316", l: "roles", lx: 535, ly: 277 },
  { d: "M270 238 V277 H105 V316", l: "refresh", lx: 188, ly: 277, cls: "store-edge" },
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
  const demo = $("demo");
  const win = $("win");
  const cursor = $("cursor") as unknown as SVGElement;

  const fresh = (o?: Partial<State>, run = 0): State => ({
    opened: false, reviewed: false, sel: null, dockOpen: false, file: 0, plan: 0, run, drawer: "", ...o,
  });
  let S = fresh();
  let timers: ReturnType<typeof setTimeout>[] = [];
  let auto = !reduce;
  let scene = 0;
  let disposed = false;
  let raf = 0;
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
  const chips: Record<string, SVGElement> = {};
  function buildMap() {
    const host = $("map");
    host.innerHTML = "";
    host.classList.add("map");
    const svg = svgEl("svg", { viewBox: "0 0 640 400", role: "img", "aria-label": "Architecture map of the sample project" });
    const defs = svgEl("defs", {}, svg);
    const m = svgEl("marker", { id: "cch-arw", viewBox: "0 0 8 8", refX: 7, refY: 4, markerWidth: 7, markerHeight: 7, orient: "auto-start-reverse" }, defs);
    svgEl("path", { d: "M0 0 L8 4 L0 8 z", fill: "var(--faint)" }, m);
    EDGES.forEach((e) => {
      const g = svgEl("g", { class: "edge" + (e.cls ? " " + e.cls : "") }, svg);
      svgEl("path", { d: e.d, "marker-end": "url(#cch-arw)" }, g);
      const lbl = svgEl("g", { class: "lbl" }, g);
      const w = e.l.length * 6.2 + 12;
      svgEl("rect", { x: e.lx - w / 2, y: e.ly - 8, width: w, height: 16, rx: 4 }, lbl);
      svgEl("text", { x: e.lx, y: e.ly + 3.2, "text-anchor": "middle" }, lbl).textContent = e.l;
    });
    NODES.forEach((n) => {
      const g = svgEl("g", { class: "node " + n.id + (n.cls ? " " + n.cls : ""), "data-id": n.id, transform: "translate(" + n.x + " " + n.y + ")", style: "--c:var(--g-" + n.g + ")", tabindex: 0, role: "button", "aria-label": n.t + ", open code" }, svg);
      svgEl("rect", { class: "body", width: W, height: H, rx: 8 }, g);
      svgEl("rect", { class: "stripe", x: 0, y: 10, width: 3, height: H - 20, rx: 1.5 }, g);
      svgEl("text", { class: "t", x: 14, y: 30 }, g).textContent = n.t;
      svgEl("text", { class: "f", x: 14, y: 46 }, g).textContent = n.f;
      nodeEls[n.id] = g as SVGElement;
      const onClick = () => openNode(n.id);
      const onKey = ((ev: KeyboardEvent) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); openNode(n.id); } }) as EventListener;
      g.addEventListener("click", onClick);
      g.addEventListener("keydown", onKey);
    });
    host.appendChild(svg);
    ["auth", "store"].forEach((id) => {
      const c = svgEl("g", { class: "chip" }, nodeEls[id]) as SVGElement;
      svgEl("rect", { y: -8, height: 16, rx: 4 }, c);
      svgEl("text", { y: 3.5, "text-anchor": "middle" }, c);
      c.style.display = "none";
      chips[id] = c;
    });
  }
  function setChip(id: string, text?: string, color?: string) {
    const c = chips[id];
    if (!text) { c.style.display = "none"; return; }
    const w = text.length * 6.2 + 12, x = W - 8 - w;
    const r = c.querySelector("rect")!, t = c.querySelector("text")!;
    r.setAttribute("x", String(x)); r.setAttribute("width", String(w)); r.style.fill = color || "";
    t.setAttribute("x", String(x + w / 2)); t.textContent = text;
    c.style.display = "";
  }

  // ---------- code dock ----------
  function renderDock() {
    const dock = $("dock");
    if (!S.sel || !S.dockOpen) { dock.innerHTML = ""; return; }
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
    dock.innerHTML =
      '<div class="dock-h"><b>' + n.t + "</b>" + badge + '<button class="x" id="dock-x" type="button" aria-label="Close code panel">✕</button></div>' +
      '<div class="dock-tabs">' + files.map((x, i) => '<button type="button" data-f="' + i + '" class="' + (i === S.file ? "on" : "") + '">' + x.n + (S.plan === "done" && files.length > 1 ? (i ? " +" : " ~") : "") + "</button>").join("") + "</div>" +
      '<div class="dock-path">' + f.p + "</div>" +
      '<div class="code">' + rows + "</div>" +
      '<div class="dock-f">' + foot + "</div>";
    $("dock-x").onclick = closeDock;
    dock.querySelectorAll<HTMLElement>("[data-f]").forEach((b) => { b.onclick = () => { S.file = +b.dataset.f!; renderDock(); }; });
  }

  // ---------- actions ----------
  function openNode(id: string) {
    if (id === "store" && !S.plan) return;
    S.opened = true; S.sel = id; S.file = 0;
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
  function doRun() {
    if (S.plan === "build" || S.plan === "done") return;
    S.opened = true;
    const token = ++S.run;
    S.dockOpen = false; S.sel = null;
    S.plan = "build"; S.drawer = "agent";
    const lines = Array.from($("term").children) as HTMLElement[];
    lines.forEach((d) => d.classList.remove("show"));
    render();
    lines.forEach((d, k) => {
      later(() => { if (token !== S.run) return; d.classList.add("show"); if (k === lines.length - 1) { S.plan = "done"; render(); } }, 400 + k * 750);
    });
  }
  function reset(o?: Partial<State>) {
    clearTimers();
    S = fresh(o, S.run);
    $("ptext").textContent = "";
    Array.from($("term").children).forEach((d) => d.classList.remove("show"));
    $("pr").textContent = "Create PR ↗"; $("pr").classList.remove("sent");
    render();
  }

  // ---------- paint ----------
  function render() {
    demo.dataset.plan = String(S.plan || "0");
    demo.dataset.dock = S.dockOpen ? "1" : "0";
    demo.dataset.drawer = S.drawer || "";
    let step = !S.opened ? 1 : !S.plan ? 2 : S.plan !== "done" ? 3 : 4;
    if (S.plan === "plan" && S.drawer === "q") step = 2;
    if (auto) step = scene + 1;
    Object.keys(nodeEls).forEach((id) => {
      nodeEls[id].classList.toggle("sel", id === S.sel && S.dockOpen);
      nodeEls[id].classList.remove("hint");
    });
    const hintId = step === 1 ? "auth" : step === 4 && !S.reviewed ? "auth" : null;
    if (hintId && !auto) nodeEls[hintId].classList.add("hint");
    $("draw").classList.toggle("hintbtn", !auto && step === 2 && !S.drawer);
    $("run").classList.toggle("hintbtn", !auto && step === 3 && S.plan === "plan" && !S.drawer);
    $("hintline").textContent = step === 1 ? "click a block to open its code"
      : step === 2 ? (S.drawer ? "" : "describe a change with Draw…")
      : step === 3 ? (S.plan === "plan" ? "dashed = planned. Run an agent to build it" : "the agent is working in its own branch")
      : (S.reviewed ? "" : "click a changed block to review it");
    if (S.plan === "done") { setChip("auth", "+4 −1", "var(--g-auth)"); setChip("store", "NEW", "var(--accent)"); }
    else if (S.plan) { setChip("auth", "MODIFY", "var(--g-auth)"); setChip("store", "ADD", "var(--accent)"); }
    else { setChip("auth"); setChip("store"); }
    root.querySelectorAll<HTMLElement>("#flow li").forEach((li) => {
      const s = +li.dataset.s!;
      li.classList.toggle("on", s === step);
      li.classList.toggle("done", s < step);
      li.querySelector(".num")!.textContent = s < step ? "✓" : String(s);
    });
    renderDock();
  }

  // ---------- wiring ----------
  buildMap();
  $("draw").onclick = () => doPlan();
  $("run").onclick = doRun;
  $("replay").onclick = () => startScene(0);
  $("desc-x").onclick = () => { S.drawer = ""; S.sel = null; render(); };
  $("pr").onclick = () => { $("pr").textContent = "PR opened ✓"; $("pr").classList.add("sent"); };
  root.querySelectorAll<HTMLElement>(".opt").forEach((b) => { b.onclick = answer; });
  root.querySelectorAll<HTMLElement>("#flow li").forEach((li) => {
    li.querySelector<HTMLElement>("button")!.onclick = () => startScene(+li.dataset.s! - 1);
  });

  // ---------- the demo: a cursor that uses the tool, scene by scene ----------
  let hover = false, visible = true;
  function mv(elm: Element, dx = 0, dy = 0) {
    const a = win.getBoundingClientRect(), r = elm.getBoundingClientRect();
    cursor.style.transform = "translate(" + (r.left - a.left + r.width / 2 + dx) + "px," + (r.top - a.top + r.height / 2 + dy) + "px)";
  }
  function rip() { cursor.classList.remove("click"); void (cursor as unknown as HTMLElement).getBoundingClientRect(); cursor.classList.add("click"); }
  const SCENES: (() => Scene)[] = [
    () => ({ len: 9500, ev: [
      [0, () => { reset(); mv($("map"), -150, 120); }],
      [500, () => mv(nodeEls.auth)],
      [1900, () => { rip(); openNode("auth"); }],
    ] }),
    () => {
      const ev: [number, () => void][] = [
        [0, () => { reset({ opened: true }); mv($("map"), -100, 150); }],
        [500, () => mv($("draw"))],
        [1500, () => { rip(); S.drawer = "prompt"; render(); }],
        [3600, () => { S.plan = "plan"; S.drawer = "q"; render(); }],
        [5000, () => mv(root.querySelector(".opt.rec")!)],
        [6000, () => { rip(); answer(); }],
        [6900, () => mv(nodeEls.store)],
        [8100, () => { rip(); openNode("store"); }],
      ];
      for (let i = 1; i <= TEXT.length; i++) ev.push([1900 + i * 35, () => { $("ptext").textContent = TEXT.slice(0, i); }]);
      return { len: 14000, ev };
    },
    () => {
      const ev: [number, () => void][] = [
        [0, () => { reset({ opened: true, plan: "plan" }); mv($("map"), -100, 150); }],
        [500, () => mv($("run"))],
        [1500, () => { rip(); S.plan = "build"; S.drawer = "agent"; render(); }],
        [7200, () => mv(nodeEls.auth)],
        [8400, () => { rip(); openNode("auth"); }],
        [10600, () => mv($("pr"))],
        [11800, () => { rip(); const b = $("pr"); b.textContent = "PR opened ✓"; b.classList.add("sent"); }],
      ];
      const lines = Array.from($("term").children) as HTMLElement[];
      lines.forEach((d, k) => ev.push([1900 + k * 750, () => d.classList.add("show")]));
      ev.push([1900 + lines.length * 750, () => { S.plan = "done"; render(); }]);
      return { len: 15500, ev };
    },
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
    if (auto && cur && !hover && visible) {
      st += Math.min(dt, 100);
      while (fi < cur.ev.length && cur.ev[fi][0] <= st) { cur.ev[fi][1](); fi++; }
      if (st >= cur.len) startScene((scene + 1) % 3);
    }
    bars.forEach((li, k) => {
      li.style.setProperty("--p", auto && k === scene && cur ? Math.min(100, st / cur.len * 100) + "%" : "0%");
    });
    raf = requestAnimationFrame(frame);
  }
  const onEnter = () => { hover = true; };
  const onLeave = () => { hover = false; };
  // a click inside the window hands control to the visitor
  const onDown = (ev: Event) => {
    if (!auto || !ev.isTrusted) return;
    auto = false; cursor.style.opacity = "0"; clearTimers(); render();
  };
  win.addEventListener("mouseenter", onEnter);
  win.addEventListener("mouseleave", onLeave);
  win.addEventListener("pointerdown", onDown, true);
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
    win.removeEventListener("mouseenter", onEnter);
    win.removeEventListener("mouseleave", onLeave);
    win.removeEventListener("pointerdown", onDown, true);
  };
}
