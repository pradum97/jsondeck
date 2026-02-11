"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useState } from "react";

type UserRole = "guest" | "user" | "pro" | "team" | "admin" | "superadmin";

const navLinks: Array<{ href: Route; label: string; roles: UserRole[] }> = [
  { href: "/home", label: "Home", roles: ["guest", "user", "pro", "team", "admin", "superadmin"] },
  { href: "/editor", label: "Editor", roles: ["guest", "user", "pro", "team", "admin", "superadmin"] },
  { href: "/transform", label: "Transform", roles: ["guest", "user", "pro", "team", "admin", "superadmin"] },
  { href: "/tools", label: "Tools", roles: ["guest", "user", "pro", "team", "admin", "superadmin"] },
  { href: "/api-tester", label: "API Tester", roles: ["guest", "user", "pro", "team", "admin", "superadmin"] },
];

export function Navbar() {
  const { resolvedTheme, setTheme } = useTheme();
  const pathname = usePathname();
  const [role, setRole] = useState<UserRole>("guest");
  const [openDrawer, setOpenDrawer] = useState(false);

  useEffect(() => {
    const storedRole = localStorage.getItem("jsondeck.role") as UserRole | null;
    if (storedRole) setRole(storedRole);
  }, []);

  const visibleLinks = useMemo(() => navLinks.filter((link) => link.roles.includes(role)), [role]);
  const isLoggedIn = role !== "guest";

  const handleLogout = () => {
    localStorage.setItem("jsondeck.role", "guest");
    setRole("guest");
    setOpenDrawer(false);
  };

  const isLightTheme = resolvedTheme !== "dark";

  const linkClasses = (active: boolean) =>
    `rounded-xl px-3 py-2 text-sm font-medium transition ${active ? "bg-[color:var(--accent-soft)] text-[color:var(--text)]" : "text-[color:var(--muted)] hover:bg-[color:var(--accent-soft)] hover:text-[color:var(--text)]"}`;

  return (
    <>
      <nav className="sticky top-0 z-40 border-b border-[color:var(--border)] bg-[color:var(--surface)]/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/home" className="flex items-center gap-2 text-base font-semibold text-[color:var(--text)] sm:text-lg">
            <span className="h-2.5 w-2.5 rounded-full bg-[color:var(--accent)]" /> JSONDeck
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {visibleLinks.map((link) => {
              const isActive = pathname === link.href || (link.href === "/home" && pathname === "/");
              return (
                <Link key={link.href} href={link.href} className={linkClasses(isActive)}>
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            {!isLoggedIn ? (
              <>
                <Link href="/login" className="rounded-xl border border-[color:var(--border)] px-3 py-2 text-sm font-medium text-[color:var(--text)] hover:bg-[color:var(--accent-soft)]">Login</Link>
                <Link href="/signup" className="rounded-xl bg-[color:var(--accent)] px-3 py-2 text-sm font-semibold text-[color:var(--surface)] hover:bg-[color:var(--accent-hover)]">Sign up</Link>
              </>
            ) : (
              <button type="button" onClick={handleLogout} className="rounded-xl border border-[color:var(--border)] px-3 py-2 text-sm font-medium text-[color:var(--text)] hover:bg-[color:var(--accent-soft)]">Logout</button>
            )}
            <button
              type="button"
              onClick={() => setTheme(isLightTheme ? "dark" : "light")}
              className="rounded-xl border border-[color:var(--border)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--text)] hover:bg-[color:var(--accent-soft)]"
            >
              {isLightTheme ? "Dark" : "Light"}
            </button>
          </div>

          <button type="button" onClick={() => setOpenDrawer((v) => !v)} className="rounded-xl border border-[color:var(--border)] p-2 text-[color:var(--text)] lg:hidden" aria-label="Toggle menu">
            ☰
          </button>
        </div>
      </nav>

      <div className={`fixed inset-0 z-50 lg:hidden ${openDrawer ? "pointer-events-auto" : "pointer-events-none"}`}>
        <button type="button" className={`absolute inset-0 bg-[color:var(--bg)]/60 ${openDrawer ? "opacity-100" : "opacity-0"}`} onClick={() => setOpenDrawer(false)} aria-label="Close menu" />
        <aside className={`absolute right-0 top-0 h-full w-[min(86vw,340px)] border-l border-[color:var(--border)] bg-[color:var(--surface)] p-4 transition-transform ${openDrawer ? "translate-x-0" : "translate-x-full"}`}>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-base font-semibold text-[color:var(--text)]">Menu</p>
            <button type="button" className="rounded-lg border border-[color:var(--border)] px-2 py-1 text-sm text-[color:var(--text)]" onClick={() => setOpenDrawer(false)}>✕</button>
          </div>
          <div className="flex flex-col gap-2">
            {visibleLinks.map((link) => {
              const isActive = pathname === link.href || (link.href === "/home" && pathname === "/");
              return (
                <Link key={link.href} href={link.href} onClick={() => setOpenDrawer(false)} className={linkClasses(isActive)}>
                  {link.label}
                </Link>
              );
            })}
          </div>
          <div className="mt-6 flex flex-col gap-2">
            <Link href="/login" onClick={() => setOpenDrawer(false)} className="rounded-xl border border-[color:var(--border)] px-3 py-2 text-sm font-medium text-[color:var(--text)]">Login</Link>
            <Link href="/signup" onClick={() => setOpenDrawer(false)} className="rounded-xl bg-[color:var(--accent)] px-3 py-2 text-sm font-semibold text-[color:var(--surface)]">Sign up</Link>
            {isLoggedIn ? <button type="button" onClick={handleLogout} className="rounded-xl border border-[color:var(--border)] px-3 py-2 text-left text-sm text-[color:var(--text)]">Logout</button> : null}
            <button type="button" onClick={() => setTheme(isLightTheme ? "dark" : "light")} className="rounded-xl border border-[color:var(--border)] px-3 py-2 text-left text-sm text-[color:var(--text)]">Switch to {isLightTheme ? "dark" : "light"}</button>
          </div>
        </aside>
      </div>
    </>
  );
}
