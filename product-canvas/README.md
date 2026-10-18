# Embedded CodeChroma canvas

This is the actual `code-chroma/web/src` frontend, copied from the local project on
2026-10-17, with its MIT license. It is compiled separately and embedded in the Next
homepage to preserve the original React version, CSS, full screen layout and controls.

## Rebuild

`node product-canvas/build.mjs` from the website root.

The script uses this package's installed dependencies, or the sibling
`code-chroma/web/node_modules` checkout for local development. To make it independent,
run `npm ci --prefix product-canvas`. Output is `public/product-canvas` and is served
by the existing Next development server. Rebuild after changing these sources.

## Homepage adapters

- `src/homepage/main.tsx` mounts the actual RootCanvas and original providers.
- `seed.ts` seeds the fictional Aurora AI platform: 16 components, 22 labelled
  connections and four deployment areas. Its illustrative Python source is also
  used in the falling hero files. Both consume `components/architectureScenario.json`
  and `components/codeSamples.json`; the build copies these into the embedded app.
  Edit `scripts/generate-ai-scenario.mjs` and run it to regenerate the scenario.
  These samples explain the design and do not represent deployed infrastructure.
  Data changes are scoped to the browser session.
- `DemoDrawMenu.tsx` loads original prepared diagram examples instead of starting
  an agent. All selection, pan, zoom, drag, multi-selection, undo, panels, code
  highlighting, copying, descriptions, games and diagram-layer controls are original.
- Agent launch controls, agent task tab, tutorial agents, windows and terminal docks
  are removed. Agent creation is also rejected at the client boundary.
- `DemoTerminalClient.ts` keeps the real xterm panel with an explicitly labelled
  browser terminal supporting help/ls/pwd/clear. It does not run a host shell.
- Git/PR browsing uses the product's own fixture client. It does not modify Git or
  access GitHub. AI generation, provider configuration and desktop updates require
  the installed application and are not backed by a server in this website demo.
- The original RootCanvas initially fits the prepared diagram and keeps the
  diagrams panel collapsed by default, without the Agents tab. Full product CSS is
  isolated in the iframe. Canvas-doc edges are the diagram's single edge renderer.
- The frame reports actual block bounds to the homepage so falling code files
  land at the product's own blocks before the interactive screen appears.

This frontend is not connected to the developer's repository, credentials or local
bridge. No Python engine, shell or agent process is exposed to visitors.

The homepage hides the product's top toolbar, left control rail, project explorer,
Generate notice and Fit All button. The initial diagram fits once; subsequent
interactions preserve its scale. Only dragging pans the canvas; wheel scrolling
and trackpad gestures cannot pan or zoom it. Wheel deltas over the canvas are
forwarded to the parent page so normal website scrolling continues across the
iframe boundary. Code panels retain their own scrolling. Blocks remain draggable,
and clicking a block opens the original code inspector.
