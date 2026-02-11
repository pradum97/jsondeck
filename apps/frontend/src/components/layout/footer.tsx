import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-800 bg-background/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 text-xs text-slate-400">
        <p>JSONDeck © {new Date().getFullYear()}</p>
        <nav className="flex items-center gap-4">
          <Link href="/docs" className="hover:text-slate-300">Docs</Link>
          <Link href="/privacy" className="hover:text-slate-300">Privacy</Link>
          <Link href="/terms" className="hover:text-slate-300">Terms</Link>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-slate-300">GitHub</a>
        </nav>
      </div>
    </footer>
  );
}
