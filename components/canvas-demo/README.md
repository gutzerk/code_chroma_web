# Homepage canvas demo

This is a local-data adapter of CodeChroma's canvas interaction for the Next.js homepage.

- `useDragOffset.ts` and `dragAxisLock.ts` are copied from `code-chroma/web/src/canvas/` (MIT, license included). The drag hook's viewport import is replaced with a local selector so it does not import the full application.
- `ArchitectureNode.tsx` adapts the product's `CanvasNodeBox` shell to the homepage's six component groups and scroll transition. It uses the original drag hook, including drag thresholds, scale compensation, cleanup and suppression of clicks after dragging.
- `CodeInspector.tsx` follows the product's `InspectorPanel` right dock and grouped-file tabs, with the real source snapshot from `../codeSamples.json` instead of an EngineClient connection.
- `ProductCanvas.module.css` contains the product's design tokens and selected CSS rules verbatim, scoped to the demo. The block title/description layout, stacked Copy/description controls, inspector header and database shape follow `CanvasNodeBox` and `InspectorPanel` markup. Homepage-specific placement and responsive rules remain in the hero stylesheet.
- `C1BlockIcon.tsx`, `CopyButton.tsx` and `PanelCloseButton.tsx` reuse the original SVG glyphs and controls. The icon's kind type is declared locally; CopyButton is extracted from `nodeChrome.tsx` without its application dependencies.
- `ProductDescription.tsx` uses the original DescriptionPopup shell inside a native dialog for focus handling and Escape dismissal.
- The homepage does not include the product's editing, live synchronization, terminal or AI features.

To refresh source snapshots, update `../codeSamples.json`. No filesystem paths or engine endpoints from the developer machine are used at runtime.
