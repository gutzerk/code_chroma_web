const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function Footer() {
  return (
    <footer className="border-t border-[color:var(--border-faint)] bg-[rgba(19,28,22,0.55)]">
      <div className="mx-auto flex max-w-[110rem] flex-col items-center justify-between gap-4 px-5 py-8 sm:flex-row sm:px-10 lg:px-6">
        <div className="flex items-center gap-2 text-sm text-[color:var(--text-2)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${BASE_PATH}/codechroma.svg`} alt="CodeChroma" className="h-5 w-5" />
          <span className="font-medium text-[color:var(--text-1)]">CodeChroma</span>
          <span>· navigate any codebase like a map, not a maze</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-[color:var(--text-3)]">
          <a
            href="https://github.com/UshakovDV/code-chroma"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-[color:var(--text-1)]"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
