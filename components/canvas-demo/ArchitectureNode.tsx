"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { elementDragPointerDown, useDragOffset, type Offset } from "./useDragOffset";
import styles from "../CodeArchitectureHero.module.css";
import { C1BlockIcon, type C1BlockKind } from "./C1BlockIcon";
import { CopyButton } from "./CopyButton";

export type DemoComponent = {
  name: string; kind: string; description: string; files: number[];
  x: number; y: number; tint: string;
};

/** Uses the product's drag hook, including its click threshold and zoom compensation.
 * The engine-backed CanvasNodeBox is replaced by a local, read-only data adapter.
 */
export default function ArchitectureNode({ component, index, selected, onOpen, onLayout, onDescription }: {
  component: DemoComponent; index: number; selected: boolean;
  onOpen: (index: number) => void; onLayout: () => void;
  onDescription: (index: number) => void;
}) {
  const nodeRef = useRef<HTMLElement>(null);
  const [keyboardOffset, setKeyboardOffset] = useState({ x: 0, y: 0 });
  function constrain(offset: Offset): Offset {
    const node = nodeRef.current; const parent = node?.parentElement;
    if (!node || !parent) return offset;
    const baseX = parent.clientWidth * component.x / 100 + keyboardOffset.x;
    const baseY = parent.clientHeight * component.y / 100 + keyboardOffset.y;
    return {
      x: Math.max(node.offsetWidth / 2 + 8 - baseX, Math.min(parent.clientWidth - node.offsetWidth / 2 - 8 - baseX, offset.x)),
      y: Math.max(node.offsetHeight / 2 + 68 - baseY, Math.min(parent.clientHeight - node.offsetHeight / 2 - 32 - baseY, offset.y)),
    };
  }
  const drag = useDragOffset({ suppressClickAfterDrag: true, scale: 1, resolveFinal: constrain });

  useLayoutEffect(() => { onLayout(); }, [drag.offset, keyboardOffset, onLayout]);

  return (
    <article ref={nodeRef} data-architecture-node data-node-index={index}
      className={`${styles.architectureNode} diagram-node-box ${component.kind === "database" ? "node-shape-database" : ""} ${selected ? "block-inspector-target" : ""} ${drag.isDragging ? styles.nodeDragging : ""}`}
      style={{ left: `calc(${component.x}% + ${drag.offset.x + keyboardOffset.x}px)`, top: `calc(${component.y}% + ${drag.offset.y + keyboardOffset.y}px)` }}
      role="group" tabIndex={0} aria-label={`${component.name}: open source code. Drag or use arrow keys to move.`}
      onPointerDown={elementDragPointerDown(drag.handleProps)}
      onClick={() => onOpen(index)}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onOpen(index); }
        const direction = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[event.key];
        if (direction) {
          event.preventDefault();
          const step = event.shiftKey ? 30 : 10;
          const next = constrain({ x: drag.offset.x + direction[0] * step, y: drag.offset.y + direction[1] * step });
          setKeyboardOffset((offset) => ({ x: offset.x + next.x - drag.offset.x, y: offset.y + next.y - drag.offset.y }));
        }
      }}>
      <div className="diagram-node-box-row">
        <div className="diagram-node-box-header">
          <div className="diagram-node-box-title-wrap">
            <div className="diagram-node-box-title-row">
              <C1BlockIcon kind={component.kind as C1BlockKind} />
              <span className="diagram-node-box-name">{component.name}</span>
            </div>
            <span className="diagram-node-box-desc">{component.description}</span>
          </div>
          <div className="canvas-node-box-buttons">
            <CopyButton text={component.name} name={component.name} variant="canvas-node-box" />
            <button type="button" className="canvas-node-box-desc-button" aria-label={`Show full description for ${component.name}`} title="Show full description" onClick={(event) => { event.stopPropagation(); onDescription(index); }}>?</button>
          </div>
        </div>
      </div>
      <span className={`${styles.port} ${styles.portTop}`} /><span className={`${styles.port} ${styles.portBottom}`} />
      <span className={`${styles.port} ${styles.portLeft}`} /><span className={`${styles.port} ${styles.portRight}`} />
    </article>
  );
}
