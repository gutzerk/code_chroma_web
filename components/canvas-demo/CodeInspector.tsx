"use client";

import { useEffect, useRef } from "react";
import styles from "../CodeArchitectureHero.module.css";
import { PanelCloseButton } from "./PanelCloseButton";

type SourceFile = { name: string; language: string; lines: string[] };

/** Local source adapter for the product's right-docked inspector and grouped file tabs. */
export default function CodeInspector({ name, files, active, onSelect, onClose, syntaxClass }: {
  name: string; files: SourceFile[]; active: number; onSelect: (index: number) => void;
  onClose: () => void; syntaxClass: (line: string) => string;
}) {
  const sourceRef = useRef<HTMLPreElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const file = files[active] ?? files[0];
  useEffect(() => { headerRef.current?.querySelector("button")?.focus({ preventScroll: true }); }, []);
  useEffect(() => { if (sourceRef.current) { sourceRef.current.scrollTop = 0; sourceRef.current.scrollLeft = 0; } }, [file.name]);

  return (
    <aside data-code-inspector className={styles.inspector} aria-label={`Code inspector: ${name}`} onKeyDown={(event) => {
      if (event.key === "Escape") { event.stopPropagation(); onClose(); }
    }}>
      <header ref={headerRef} className="inspector-panel-header">
        <span className="inspector-panel-title">{name}</span>
        <PanelCloseButton className="inspector-panel-close" ariaLabel="Close code inspector" onClick={onClose} />
      </header>
      <div className="inspector-tabs" role="tablist" aria-label="Component source files">
        {files.map((source, index) => <button key={source.name} type="button" role="tab" className={`inspector-tab ${index === active ? "inspector-tab--active" : ""}`} id={`demo-source-tab-${index}`} aria-controls="demo-source-panel" aria-selected={index === active} tabIndex={index === active ? 0 : -1}
          onClick={() => onSelect(index)} onKeyDown={(event) => {
            let next = index;
            if (event.key === "ArrowRight") next = (index + 1) % files.length;
            else if (event.key === "ArrowLeft") next = (index - 1 + files.length) % files.length;
            else if (event.key === "Home") next = 0;
            else if (event.key === "End") next = files.length - 1;
            else return;
            event.preventDefault(); onSelect(next);
            event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>("button")[next]?.focus();
          }}>{source.name.split("/").pop()}</button>)}
      </div>
      <p className={styles.inspectorPath} title={file.name}>{file.name}</p>
      <div id="demo-source-panel" role="tabpanel" aria-labelledby={`demo-source-tab-${active}`} className={styles.inspectorSourcePanel}>
        <pre ref={sourceRef} className={styles.inspectorSource} tabIndex={0} aria-label={`Source of ${file.name.split("/").pop()}`}><code>
          {file.lines.map((line, index) => <span className={styles.inspectorLine} key={index}><span className={styles.inspectorLineNumber} aria-hidden="true">{index + 1}</span><span className={styles[syntaxClass(line)]}>{line || " "}</span>{"\n"}</span>)}
        </code></pre>
      </div>
      <footer className={styles.inspectorFooter}><span>{file.language}</span><span>{file.lines.length} lines · Read only</span><span>UTF-8</span></footer>
    </aside>
  );
}
