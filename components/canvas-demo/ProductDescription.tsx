"use client";

import { useEffect, useRef } from "react";
import { PanelCloseButton } from "./PanelCloseButton";

/** Product DescriptionPopup markup, hosted in a native dialog for focus and Escape handling. */
export default function ProductDescription({ name, description, onClose }: { name: string; description: string; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    const opener = document.activeElement as HTMLElement | null;
    dialog?.showModal();
    return () => { dialog?.close(); opener?.focus({ preventScroll: true }); };
  }, []);
  return (
    <dialog ref={dialogRef} className="description-popup" aria-labelledby="demo-description-title" onCancel={onClose} onClick={(event) => {
      if (event.target !== event.currentTarget) return;
      const box = event.currentTarget.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) onClose();
    }}>
      <div className="description-popup-titlebar">
        <span className="description-popup-title" id="demo-description-title">{name}</span>
        <PanelCloseButton className="description-popup-close" ariaLabel={`Close ${name} description`} onClick={onClose} />
      </div>
      <div className="description-popup-body">{description}</div>
    </dialog>
  );
}
