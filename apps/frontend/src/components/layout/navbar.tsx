"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { AuthModal } from "@/components/layout/auth-modal";

type UserRole = "guest" | "user";
type AuthMode = "login" | "signup" | "forgot";

const navLinks: Array<{ href: Route; label: string; roles: UserRole[] }> = [
  { href: "/home", label: "Home", roles: ["guest", "user"] },
  { href: "/editor", label: "Editor", roles: ["guest", "user"] },
  { href: "/viewer", label: "Viewer", roles: ["guest", "user"] },
  { href: "/transform", label: "Transform", roles: ["guest", "user"] },
  { href: "/tools", label: "Tools", roles: ["guest", "user"] },
  { href: "/api-tester", label: "API Tester", roles: ["guest", "user"] },
];

export function Navbar() {
  const { resolvedTheme, setTheme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [role, setRole] = useState<UserRole>("guest");
  const [openDrawer, setOpenDrawer] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode | null>(null);

  useEffect(() => {
    setMounted(true);
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

  const handleAuthSuccess = () => {
    localStorage.setItem("jsondeck.role", "user");
    setRole("user");
  };

  const isDark = mounted && resolvedTheme === "dark";

  const linkClasses = (active: boolean) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition ${active ? "bg-accent/15 text-foreground" : "text-muted-foreground hover:bg-accent/10 hover:text-foreground"}`;

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur" style={{ height: "var(--navbar-height)" }}>
        <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/home" className="flex items-center gap-2 text-base font-semibold text-foreground sm:text-lg">
            <span className="h-2.5 w-2.5 rounded-full bg-[#2563eb]" /> JSONDeck
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
                <button type="button" onClick={() => setAuthMode("login")} className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-accent/10">Login</button>
                <button type="button" onClick={() => setAuthMode("signup")} className="rounded-lg bg-[#2563eb] px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700">Sign up</button>
              </>
            ) : (
              <button type="button" onClick={handleLogout} className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-accent/10">Logout</button>
            )}
            <button type="button" onClick={() => setTheme(isDark ? "light" : "dark")} className="rounded-lg border border-border px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-foreground hover:bg-accent/10">
              {isDark ? "Light" : "Dark"}
            </button>
          </div>

          <button type="button" onClick={() => setOpenDrawer((prev) => !prev)} className="rounded-lg border border-border p-2 text-foreground lg:hidden" aria-label="Toggle menu">☰</button>
        </div>
      </nav>

      <AnimatePresence>
        {openDrawer ? (
          <motion.div className="fixed inset-0 z-[70] lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button type="button" className="absolute inset-0 bg-slate-950/45" onClick={() => setOpenDrawer(false)} aria-label="Close menu" />
            <motion.aside className="absolute right-0 top-0 h-full w-[min(86vw,340px)] border-l border-border bg-card p-4" initial={{ x: 360 }} animate={{ x: 0 }} exit={{ x: 360 }} transition={{ type: "spring", stiffness: 330, damping: 28 }}>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-base font-semibold text-foreground">Menu</p>
                <button type="button" className="rounded-lg border border-border px-2 py-1 text-sm text-foreground" onClick={() => setOpenDrawer(false)}>✕</button>
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
                {!isLoggedIn ? (
                  <>
                    <button type="button" onClick={() => { setOpenDrawer(false); setAuthMode("login"); }} className="rounded-lg border border-border px-3 py-2 text-left text-sm font-medium text-foreground">Login</button>
                    <button type="button" onClick={() => { setOpenDrawer(false); setAuthMode("signup"); }} className="rounded-lg bg-[#2563eb] px-3 py-2 text-left text-sm font-semibold text-white">Sign up</button>
                  </>
                ) : (
                  <button type="button" onClick={handleLogout} className="rounded-lg border border-border px-3 py-2 text-left text-sm text-foreground">Logout</button>
                )}
                <button type="button" onClick={() => setTheme(isDark ? "light" : "dark")} className="rounded-lg border border-border px-3 py-2 text-left text-sm text-foreground">Switch to {isDark ? "light" : "dark"}</button>
              </div>
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AuthModal
        mode={authMode}
        open={Boolean(authMode)}
        onClose={() => setAuthMode(null)}
        onSwitchMode={setAuthMode}
        onAuthSuccess={handleAuthSuccess}
      />
    </>
  );
}
