import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[color:var(--border)] bg-[color:var(--surface)] py-4">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-center gap-3 px-4 text-xs text-[color:var(--muted)] sm:justify-between sm:px-6">
        <p className="text-[color:var(--muted)]">JSONDeck © {new Date().getFullYear()}</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/docs" className="hover:text-[color:var(--text)]">Docs</Link>
          <Link href="/privacy" className="hover:text-[color:var(--text)]">Privacy</Link>
          <Link href="/terms" className="hover:text-[color:var(--text)]">Terms</Link>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-[color:var(--text)]">GitHub</a>
        </div>
      </div>
    </footer>
  );
}
