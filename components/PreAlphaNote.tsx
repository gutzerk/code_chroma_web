/** Thin banner shown under the nav on every page, signalling that the product is
    an early pre-release and inviting feedback. Shared so the notice stays consistent. */
export default function PreAlphaNote() {
  return (
    <div className="border-b border-[color:var(--border-faint)] bg-[rgba(120,90,20,0.15)] px-5 py-2 text-center text-xs text-[color:var(--text-2)]">
      <span className="font-semibold text-[#f0c94a]">Early access</span>
      <span className="mx-2">·</span>
      CodeChroma is pre-alpha, so expect rough edges.{" "}
      <a
        href="https://github.com/gutzerk/code_chroma/issues"
        target="_blank"
        rel="noopener noreferrer"
        className="text-[color:var(--text-1)] underline decoration-[color:var(--text-3)] underline-offset-2 hover:decoration-[color:var(--text-1)]"
      >
        Tell us what breaks
      </a>
      .
    </div>
  );
}
