import Link from "next/link";
import styles from "./page.module.css";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function CanvasPage() {
  return (
    <main className={styles.page}>
      <header className={styles.toolbar}>
        <Link className={styles.backLink} href="/#canvas-demo" aria-label="Back to CodeChroma home">
          <span aria-hidden="true">←</span> <span>CodeChroma</span>
        </Link>
        <div className={styles.pageTitle}>Architecture Canvas</div>
        <p className={styles.hint}>Drag to pan <span>·</span> Scroll to zoom</p>
      </header>
      <iframe
        className={styles.canvas}
        src={`${BASE_PATH}/product-canvas/index.html?autoexpand=off&initialZoom=1.4&resetCamera=on&wheelzoom=on`}
        title="Interactive CodeChroma architecture canvas"
        allow="clipboard-write; fullscreen"
        allowFullScreen
      />
    </main>
  );
}
