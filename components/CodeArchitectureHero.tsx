"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import styles from "./CodeArchitectureHero.module.css";
import HeroInstallCommand from "./HeroInstallCommand";
import CODE_SAMPLES from "./codeSamples.json";
import SCENARIO from "./architectureScenario.json";
import ArchitectureNode from "./canvas-demo/ArchitectureNode";
import productStyles from "./canvas-demo/ProductCanvas.module.css";

type CodeFile = {
  name: string;
  language: string;
  tint: string;
  offset: [number, number];
  tilt: number;
  lines: string[];
};

const FILES = CODE_SAMPLES as CodeFile[];

// Each source file has a destination of its own; related files form one component.
const COMPONENTS = SCENARIO.nodes.map(node => ({ ...node, x: node.x / 13, y: node.y / 10 }));
const CONNECTIONS = SCENARIO.connections.map(({ from, to }) => [from, to]);
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (value: number) => { const t = clamp(value); return t * t * (3 - 2 * t); };

function syntaxClass(line: string) {
  const trimmed = line.trim();
  if (trimmed.startsWith("#") || trimmed.startsWith("//") || trimmed.startsWith("*")) return "comment";
  if (trimmed.startsWith("@")) return "keyword";
  if (/^(from|import|as|def|class|return|raise|if|elif|else|for|while|try|except|finally|with|async|await|yield|pass|break|continue|export|const|let|function|throw|new|type|interface|switch|case|default|extends|implements|public|private|static|this)\b/.test(trimmed)) return "keyword";
  if (/\b(True|False|None|null|undefined)\b/.test(trimmed)) return "literal";
  if (trimmed.includes("'") || trimmed.includes('"') || trimmed.includes("`")) return "string";
  return "plain";
}

const CodeWindow = memo(function CodeWindow({ file, index }: { file: CodeFile; index: number }) {
  return (
    <article
      data-code-window
      className={`${styles.codeWindow} ${styles[file.tint]}`}
      style={{
        zIndex: index + 1,
        transform: `translate(-50%, -50%) translate(${50 + file.offset[0]}vw, ${50 + file.offset[1]}svh) scale(.84)`,
      }}
    >
      <div className={styles.windowBar}>
        <span className={styles.fileIcon}>{file.name.endsWith(".py") ? "PY" : "TSX"}</span>
        <span className={styles.filename}>{file.name}</span>
        <span className={styles.windowMeta}>{file.language}</span>
        <span className={styles.windowDots}><i /><i /><i /></span>
      </div>
      <div className={styles.codeBody}>
        {file.lines.map((line, lineIndex) => (
          <div className={styles.codeLine} key={`${file.name}-${lineIndex}`}>
            <span className={styles.lineNumber}>{String(lineIndex + 1).padStart(3, "0")}</span>
            <span className={styles[syntaxClass(line)]}>{line || " "}</span>
          </div>
        ))}
      </div>
      <div className={styles.fileFooter}>
        <span>Ln {file.lines.length}, Col 1</span><span>UTF-8 · LF</span><span>code-chroma · source</span>
      </div>
    </article>
  );
});

export default function CodeArchitectureHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const productLayout = useRef<{ x: number; y: number; width: number; height: number }[] | null>(null);
  const layoutRef = useRef<() => void>(() => {});
  const [productReady, setProductReady] = useState(false);
  const updateLayout = useCallback(() => layoutRef.current(), []);
  const ignoreInteraction = useCallback(() => {}, []);

  useEffect(() => {
    const onLayout = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== frameRef.current?.contentWindow) return;
      if (event.data?.type === "codechroma-page-scroll") {
        if (Number.isFinite(event.data.deltaX) && Number.isFinite(event.data.deltaY)) window.scrollBy({ left: event.data.deltaX, top: event.data.deltaY, behavior: "instant" });
        return;
      }
      if (event.data?.type !== "codechroma-canvas-layout") return;
      const blocks = event.data.blocks;
      if (!Array.isArray(blocks) || blocks.length !== COMPONENTS.length || !blocks.every(block => block && [block.x, block.y, block.width, block.height].every(Number.isFinite))) return;
      productLayout.current = blocks;
      setProductReady(true);
      layoutRef.current();
    };
    window.addEventListener("message", onLayout);
    frameRef.current?.contentWindow?.postMessage({ type: "codechroma-request-layout" }, window.location.origin);
    return () => window.removeEventListener("message", onLayout);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;
    const diagram = canvas.querySelector<HTMLElement>("[data-diagram]")!;
    const cards = Array.from(section.querySelectorAll<HTMLElement>("[data-code-window]"));
    const nodes = Array.from(canvas.querySelectorAll<HTMLElement>("[data-architecture-node]"));
    const edges = Array.from(canvas.querySelectorAll<SVGPathElement>("[data-architecture-edge]"));
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let sectionTop = 0;
    let heroHeight = 0;
    let canvasTop = 0;
    let destinations: { x: number; y: number; width: number; height: number }[] = [];
    const paint = () => {
      frame = 0;
      const scroll = Math.max(0, window.scrollY - sectionTop);
      const progress = clamp(scroll / (heroHeight * .9));
      const arrivals = COMPONENTS.map((_, group) => reducedMotion.matches ? 1 : smooth((progress - .75 - group / Math.max(1, COMPONENTS.length - 1) * .1) / .12));
      const reveal = productLayout.current ? (reducedMotion.matches ? 1 : smooth((progress - .96) / .04)) : 0;
      if (frameRef.current) {
        frameRef.current.style.opacity = String(reveal);
        frameRef.current.style.pointerEvents = reveal > .99 ? "auto" : "none";
        frameRef.current.inert = reveal < .99;
      }
      cards.forEach((card, index) => {
        const group = COMPONENTS.findIndex((component) => component.files.includes(index));
        const destination = destinations[group];
        if (!destination) return;
        const component = COMPONENTS[group];
        const rank = component.files.indexOf(index);
        const travel = reducedMotion.matches ? 0 : smooth((progress - rank * .018) / (.78 + group / Math.max(1, COMPONENTS.length - 1) * .125));
        const startX = section.clientWidth * (.5 + FILES[index].offset[0] / 100);
        const startY = heroHeight * .5 + FILES[index].offset[1] * window.innerHeight / 100;
        const endX = destination.x + (rank - (component.files.length - 1) / 2) * 12;
        const endY = canvasTop + destination.y + rank * 7;
        const scale = .84 + (Math.min(destination.width / card.offsetWidth, destination.height / card.offsetHeight) - .84) * travel;
        card.style.transform = `translate(-50%, -50%) translate3d(${startX + (endX - startX) * travel}px, ${startY + (endY - startY) * travel}px, 0) scale(${scale})`;
        card.style.opacity = String(reducedMotion.matches ? 1 : 1 - arrivals[group]);
      });
      nodes.forEach((node, group) => {
        node.style.opacity = String(arrivals[group] * (1 - reveal));
        node.style.transform = `translate(-50%, -50%) scale(${.94 + .06 * arrivals[group]})`;
        node.inert = true;
      });
      edges.forEach((edge, index) => {
        const [from, to] = CONNECTIONS[index];
        edge.style.opacity = String(Math.min(arrivals[from], arrivals[to]) * (1 - reveal));
      });
    };
    const measure = () => {
      sectionTop = section.getBoundingClientRect().top + window.scrollY;
      heroHeight = section.querySelector<HTMLElement>(`[data-hero-screen]`)!.offsetHeight;
      canvasTop = canvas.offsetTop;
      destinations = nodes.map((node, i) => {
        const target = productLayout.current?.[i];
        if (target) {
          node.style.left = `${target.x + target.width / 2}px`;
          node.style.top = `${target.y + target.height / 2}px`;
          node.style.width = `${target.width}px`;
        }
        return { x: node.offsetLeft, y: node.offsetTop, width: node.offsetWidth, height: node.offsetHeight };
      });
      edges.forEach((edge, index) => {
        const [from, to] = CONNECTIONS[index];
        const a = destinations[from]; const b = destinations[to];
        const dx = b.x - a.x; const dy = b.y - a.y;
        const horizontal = Math.abs(dx) / Math.max(1, a.width) > Math.abs(dy) / Math.max(1, a.height);
        const sign = Math.sign(horizontal ? dx : dy);
        const x1 = (a.x + (horizontal ? sign * a.width / 2 : 0)) / diagram.clientWidth * 100;
        const x2 = (b.x - (horizontal ? sign * b.width / 2 : 0)) / diagram.clientWidth * 100;
        const y1 = (a.y + (horizontal ? 0 : sign * a.height / 2)) / diagram.clientHeight * 100;
        const y2 = (b.y - (horizontal ? 0 : sign * b.height / 2)) / diagram.clientHeight * 100;
        const bendX = (x1 + x2) / 2; const bendY = (y1 + y2) / 2;
        edge.setAttribute("d", horizontal ? `M ${x1} ${y1} C ${bendX} ${y1}, ${bendX} ${y2}, ${x2} ${y2}` : `M ${x1} ${y1} C ${x1} ${bendY}, ${x2} ${bendY}, ${x2} ${y2}`);
      });
      paint();
    };
    layoutRef.current = measure;
    const schedule = () => { if (!frame) frame = requestAnimationFrame(paint); };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(section);
    observer.observe(diagram);
    nodes.forEach((node) => observer.observe(node));
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure);
    reducedMotion.addEventListener("change", measure);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
      reducedMotion.removeEventListener("change", measure);
      layoutRef.current = () => {};
    };
  }, []);

  return (
      <section ref={sectionRef} className={styles.scrollSection} aria-label="From source code to system architecture">
        <div className={styles.codeField} aria-hidden="true">
          {FILES.map((file, index) => <CodeWindow key={file.name} file={file} index={index} />)}
        </div>
        <div data-hero-screen className={styles.pin}>
          <div className={styles.ambient} aria-hidden="true" />
          <div className={styles.grid} aria-hidden="true" />

          <div className={styles.headline}>
            <p className={styles.eyebrow}><span>CODECHROMA</span> A living map of your codebase</p>
            <h1>Your codebase.<br /><em>In clear view.</em></h1>
            <p className={styles.subhead}>Turn a real repository into an architecture map you can explore, understand, and keep in sync.</p>
            <HeroInstallCommand />
            <div className={styles.scrollCue}><span className={styles.mouse}><i /></span><span>SCROLL TO EXPLORE THE CODE</span><span className={styles.cueLine} /></div>
          </div>
        </div>
      <section id="canvas-demo" ref={canvasRef} className={`${styles.canvasSection} ${styles.fullProductSection} ${productStyles.productCanvas}`} aria-label="Interactive CodeChroma application">
        <div className={styles.canvasGrid} aria-hidden="true" />
        <div data-diagram className={styles.diagram} aria-hidden="true" inert>
          <svg className={styles.connections} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <defs><marker id="architecture-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#648b9b" /></marker></defs>
            {CONNECTIONS.map((_, index) => <path data-architecture-edge key={index} markerEnd="url(#architecture-arrow)" />)}
          </svg>
          {COMPONENTS.map((component, index) => (
            <ArchitectureNode key={component.name} component={component} index={index} selected={false} onOpen={ignoreInteraction} onLayout={updateLayout} onDescription={ignoreInteraction} />
          ))}
          </div>
        <iframe ref={frameRef} className={styles.productFrame} src="/product-canvas/index.html?autoexpand=off" onLoad={() => frameRef.current?.contentWindow?.postMessage({ type: "codechroma-request-layout" }, window.location.origin)} title="CodeChroma canvas — interactive demo" allow="clipboard-write; fullscreen" allowFullScreen />
        {!productReady && <p className={styles.productLoading} role="status">Loading CodeChroma canvas…</p>}
      </section>
      </section>
  );
}

