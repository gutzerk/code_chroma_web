import Link from "next/link";
import MobileNav from "./MobileNav";
import { NAV_ITEMS_DESKTOP } from "./shared/nav-links";

const GITHUB = "https://github.com/UshakovDV/code-chroma";
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-[color:var(--border-faint)] bg-[rgba(16,22,18,0.85)] backdrop-blur">
      <nav className="mx-auto flex max-w-[110rem] items-center justify-between px-5 py-3 sm:px-10 lg:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${BASE_PATH}/codechroma.svg`} alt="CodeChroma" className="h-6 w-6" />
            CodeChroma
          </Link>

          {NAV_ITEMS_DESKTOP.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hidden items-center gap-1.5 text-sm text-[color:var(--text-2)] transition-colors hover:text-[color:var(--text-1)] sm:inline-flex"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <a
            href={GITHUB}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 rounded-full border border-[#1a3b8f] bg-[rgba(26,59,143,0.45)] px-6 py-2 text-sm font-medium text-white shadow-[0_0_28px_rgba(26,59,143,0.6)] transition-colors hover:bg-[rgba(26,59,143,0.6)]"
          >
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-[#f5c518]" aria-hidden="true">
              <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
            </svg>
            <span className="hidden sm:inline">Star us on GitHub</span>
          </a>

          <MobileNav />
        </div>
      </nav>
    </header>
  );
}
