import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card py-3">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-center gap-3 px-4 text-xs text-muted-foreground sm:justify-between sm:px-6">
        <p>JSONDeck © 2026</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/docs" className="hover:text-foreground">Docs</Link>
          <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
          <Link href="/terms" className="hover:text-foreground">Terms</Link>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-foreground">GitHub</a>
        </div>
      </div>
    </footer>
  );
}
