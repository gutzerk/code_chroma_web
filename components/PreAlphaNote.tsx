/** Thin banner shown under the nav on the home and install pages, signalling
    that the product is a pre-release. Shared so the notice stays consistent. */
export default function PreAlphaNote() {
  return (
    <div className="border-b border-[color:var(--border-faint)] bg-[rgba(120,90,20,0.15)] px-5 py-2 text-center text-xs text-[color:var(--text-2)]">
      <span className="font-semibold text-[#f0c94a]">Pre-alpha</span>
      <span className="mx-2">·</span>
      CodeChroma is not yet production-ready — expect rough edges and incomplete features.
    </div>
  );
}
