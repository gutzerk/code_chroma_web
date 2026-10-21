import Link from "next/link";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const GITHUB = "https://github.com/gutzerk/code_chroma";

const LINKS: { label: string; href: string; external?: boolean }[] = [
  { label: "Live map", href: "/canvas" },
  { label: "Documentation", href: "/documentation" },
  { label: "Install", href: "/install" },
  { label: "Privacy & tokens", href: "/documentation#privacy" },
  { label: "Send feedback", href: `${GITHUB}/issues`, external: true },
  { label: "GitHub", href: GITHUB, external: true },
];

export default function Footer() {
  const link = "transition-colors hover:text-[color:var(--text-1)]";
  return (
    <footer className="border-t border-[color:var(--border-faint)] bg-[color:var(--surface-1)]">
      <div className="mx-auto flex max-w-[110rem] flex-col justify-between gap-6 px-5 py-8 sm:px-10 md:flex-row md:items-center lg:px-6">
        <div className="flex flex-wrap items-center gap-2 text-sm text-[color:var(--text-2)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${BASE_PATH}/codechroma.svg`} alt="" className="h-5 w-5" />
          <span className="font-medium text-[color:var(--text-1)]">CodeChroma</span>
          <span>· vibe-code at full speed, stay in control of the whole picture</span>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[color:var(--text-3)]">
          {LINKS.map((l) =>
            l.external ? (
              <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className={link}>
                {l.label}
              </a>
            ) : (
              <Link key={l.label} href={l.href} className={link}>
                {l.label}
              </Link>
            ),
          )}
        </nav>
      </div>
    </footer>
  );
}
