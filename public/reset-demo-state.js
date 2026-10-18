(() => {
  const preserveStateKey = "codechroma-preserve-demo-state-once";
  const navigation = performance.getEntriesByType("navigation")[0];
  if (navigation?.type !== "reload") return;

  try {
    if (sessionStorage.getItem(preserveStateKey) === "true") {
      sessionStorage.removeItem(preserveStateKey);
      return;
    }
  } catch {
    // Fall through to the normal reset if session storage is unavailable.
  }

  const oneTimeKeys = [
    "codechroma-homepage-layout-v1",
    "codechroma-homepage-canvas-v1",
    "codechroma-homepage-active-diagram-v1",
    "codechroma-canvas-color",
    "codechroma-canvas-hue",
  ];
  const diagramStatePrefixes = [
    "codechroma.cameraView.",
    "codechroma.expansion.",
    "codechroma.collapsedLayers.",
  ];

  try {
    oneTimeKeys.forEach((key) => localStorage.removeItem(key));
    for (let index = localStorage.length - 1; index >= 0; index -= 1) {
      const key = localStorage.key(index);
      if (key && diagramStatePrefixes.some((prefix) => key.startsWith(prefix))) {
        localStorage.removeItem(key);
      }
    }
    sessionStorage.removeItem("codechroma.diagramsStatusCache");
  } catch {
    // The demo still loads with its in-memory defaults when browser storage is unavailable.
  }
})();
