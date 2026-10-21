import Link from "next/link";
import MobileNav from "./MobileNav";
import NavLink from "./shared/NavLink";
import { NAV_ITEMS_DESKTOP } from "./shared/nav-links";

const GITHUB = "https://github.com/gutzerk/code_chroma";
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-[color:var(--border-faint)] bg-[rgba(11,14,17,0.85)] backdrop-blur">
      <nav className="mx-auto flex max-w-[110rem] items-center justify-between px-5 py-3 sm:px-10 lg:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${BASE_PATH}/codechroma.svg`} alt="CodeChroma" className="h-6 w-6" />
            CodeChroma
          </Link>

          {NAV_ITEMS_DESKTOP.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              className="hidden items-center gap-1.5 border-b-2 border-transparent py-1 text-sm text-[color:var(--text-2)] transition-colors hover:text-[color:var(--text-1)] sm:inline-flex"
              activeClassName="!border-[color:var(--added)] !text-[color:var(--text-1)]"
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <a
            href={GITHUB}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1.5 text-sm text-[color:var(--text-2)] transition-colors hover:text-[color:var(--text-1)] sm:inline-flex"
          >
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-[#f5c518]" aria-hidden="true">
              <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
            </svg>
            GitHub
          </a>
          <Link
            href="/install"
            className="inline-flex items-center rounded-lg bg-[color:var(--accent)] px-3 py-2 text-sm sm:px-4 font-semibold text-[#06130c] transition-colors hover:bg-[#8de0b0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b1f0c8] sm:inline-flex"
          >
            Install free
          </Link>

          <MobileNav />
        </div>
      </nav>
    </header>
  );
}
