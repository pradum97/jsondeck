"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

type UserRole = "guest" | "user" | "pro" | "team" | "admin" | "superadmin";

const navLinks: Array<{ href: string; label: string; roles: UserRole[] }> = [
  { href: "/", label: "Home", roles: ["guest", "user", "pro", "team", "admin", "superadmin"] },
  { href: "/editor", label: "Editor", roles: ["guest", "user", "pro", "team", "admin", "superadmin"] },
  { href: "/transform", label: "Transform", roles: ["guest", "user", "pro", "team", "admin", "superadmin"] },
  { href: "/tools", label: "Tools", roles: ["guest", "user", "pro", "team", "admin", "superadmin"] },
  { href: "/api-tester", label: "API Tester", roles: ["guest", "user", "pro", "team", "admin", "superadmin"] },
  { href: "/settings", label: "Settings", roles: ["user", "pro", "team", "admin", "superadmin"] },
];

export function Navbar() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [role, setRole] = useState<UserRole>("guest");

  useEffect(() => {
    setMounted(true);
    const storedRole = localStorage.getItem("jsondeck.role") as UserRole | null;
    if (storedRole) {
      setRole(storedRole);
    }
  }, []);

  const visibleLinks = useMemo(
    () => navLinks.filter((link) => link.roles.includes(role)),
    [role]
  );

  const handleToggle = () => {
    if (!mounted) return;
    setTheme(resolvedTheme === "light" ? "dark" : "light");
  };

  const isLightTheme = mounted && resolvedTheme === "light";

  return (
    <nav className="glass sticky top-3 z-40 mx-3 mt-3 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-800/80 px-4 py-3 sm:mx-4 sm:mt-4 sm:px-6 sm:py-4">
      <Link href="/" className="flex shrink-0 items-center gap-2 text-lg font-semibold text-slate-100">
        <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
        JSONDeck
      </Link>
      <div className="order-3 flex w-full items-center gap-2 overflow-x-auto pb-1 text-sm text-slate-200 sm:order-2 sm:w-auto sm:flex-wrap sm:overflow-visible sm:pb-0">
        {visibleLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="whitespace-nowrap rounded-full px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-200 transition hover:bg-slate-800/70 hover:text-emerald-200"
          >
            {link.label}
          </Link>
        ))}
      </div>
      <Button type="button" variant="ghost" size="sm" onClick={handleToggle} className="order-2 inline-flex items-center gap-2 sm:order-3">
        <span aria-hidden="true">{isLightTheme ? "🌙" : "☀️"}</span>
        <span>{isLightTheme ? "Dark" : "Light"} Mode</span>
      </Button>
    </nav>
  );
}
