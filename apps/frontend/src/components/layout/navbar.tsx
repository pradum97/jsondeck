"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/editor", label: "Editor" },
  { href: "/transform", label: "Transform" },
  { href: "/tools", label: "Tools" },
  { href: "/api-tester", label: "API Tester" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/settings", label: "Settings" },
];

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggle = () => {
    if (!mounted) return;
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <nav className="glass sticky top-6 z-40 mx-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-800/80 px-6 py-4">
      <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-slate-100">
        <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
        JSONDeck
      </Link>
      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-200">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-full px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-200 transition hover:text-emerald-200"
          >
            {link.label}
          </Link>
        ))}
      </div>
      <Button type="button" variant="ghost" size="sm" onClick={handleToggle}>
        {mounted && theme === "light" ? "Dark" : "Light"} Mode
      </Button>
    </nav>
  );
}
