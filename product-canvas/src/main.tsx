import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { AppErrorBoundary } from "./AppErrorBoundary";
import { installRejectionReporter } from "./util/reportError";
import { clearSavedCameraView } from "./canvas/canvasCameraStore";
import "./styles.css";

installRejectionReporter();
if (new URLSearchParams(window.location.search).get("resetCamera") === "on") {
  clearSavedCameraView();
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </React.StrictMode>,
);
