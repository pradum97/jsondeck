import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-800 py-4 text-center text-xs text-slate-400">
      <p>
        JSONDeck © {new Date().getFullYear()} | <Link href="/docs" className="hover:text-slate-300">Docs</Link> |{" "}
        <Link href="/privacy" className="hover:text-slate-300">Privacy</Link> |{" "}
        <Link href="/terms" className="hover:text-slate-300">Terms</Link> |{" "}
        <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-slate-300">GitHub</a>
      </p>
    </footer>
  );
}
