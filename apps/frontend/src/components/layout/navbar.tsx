"use client";

import { motion } from "framer-motion";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

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
  const [mounted, setMounted] = useState(false);
  const [role, setRole] = useState<UserRole>("guest");
  const [openMenu, setOpenMenu] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedRole = localStorage.getItem("jsondeck.role") as UserRole | null;
    if (storedRole) {
      setRole(storedRole);
    }
  }, []);

  const visibleLinks = useMemo(() => navLinks.filter((link) => link.roles.includes(role)), [role]);
  const isLoggedIn = role !== "guest";

  const handleToggle = () => {
    if (!mounted) return;
    setTheme(resolvedTheme === "light" ? "dark" : "light");
  };

  const handleLogout = () => {
    localStorage.setItem("jsondeck.role", "guest");
    setRole("guest");
    setOpenMenu(false);
  };

  const isLightTheme = mounted && resolvedTheme === "light";

  return (
    <nav
      className={`sticky top-2 z-40 mx-2 mt-2 flex flex-wrap items-center justify-between gap-3 rounded-xl border px-3 py-2 shadow-sm sm:mx-3 sm:px-4 sm:py-2.5 ${
        isLightTheme
          ? "bg-white border-b border-slate-200 text-slate-800"
          : "glass border-slate-800"
      }`}
    >
      <Link href="/home" className={`flex shrink-0 items-center gap-2 text-base font-semibold sm:text-lg ${isLightTheme ? "text-slate-800" : "text-slate-100"}`}>
        <span className="h-2 w-2 rounded-full bg-accent" />
        JSONDeck
      </Link>

      <div className={`order-3 flex w-full min-w-0 items-center gap-1 overflow-x-auto pb-1 text-sm sm:order-2 sm:w-auto sm:flex-wrap sm:justify-center sm:gap-2 sm:overflow-visible sm:pb-0 ${isLightTheme ? "text-slate-800" : "text-slate-300"}`}>
        {visibleLinks.map((link) => {
          const isActive = pathname === link.href || (link.href === "/home" && pathname === "/");

          return (
            <motion.div
              key={link.href}
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.98, y: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <Link
                href={link.href}
                className={`relative block cursor-pointer whitespace-nowrap rounded-lg border px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] transition-all duration-200 ${
                  isActive
                    ? isLightTheme
                      ? "border-blue-600 bg-white font-semibold text-blue-600"
                      : "border-blue-500/70 bg-blue-500/20 font-semibold text-slate-100 shadow-sm"
                    : isLightTheme
                      ? "border-slate-200 bg-white font-medium text-slate-700 hover:bg-white hover:text-slate-900"
                      : "border-slate-800 bg-slate-900/60 font-medium text-slate-300 hover:bg-slate-800 hover:text-slate-100"
                }`}
              >
                {link.label}
                {isActive ? (
                  <motion.span
                    layoutId="active-navbar-indicator"
                    className={`absolute inset-x-2 -bottom-1.5 h-0.5 rounded-full ${isLightTheme ? "bg-blue-500" : "bg-blue-400"}`}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                ) : null}
              </Link>
            </motion.div>
          );
        })}
      </div>

      <div className="order-2 flex items-center gap-2 sm:order-3">
        {!isLoggedIn ? (
          <div className="flex items-center gap-2 text-xs">
            <Link href="/login" className={`rounded-lg border px-3 py-1.5 ${isLightTheme ? "border-slate-200 bg-white text-slate-700 hover:bg-white hover:text-slate-900" : "border-slate-800 bg-slate-900/60 text-slate-300 hover:bg-slate-800 hover:text-slate-100"}`}>Login</Link>
            <Link href="/signup" className={`rounded-lg border px-3 py-1.5 ${isLightTheme ? "border-blue-600 bg-blue-600 text-white hover:bg-blue-700" : "border-blue-500/70 bg-blue-500/20 text-slate-100 hover:bg-blue-500/30"}`}>Sign Up</Link>
          </div>
        ) : (
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenMenu((value) => !value)}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold ${isLightTheme ? "border-slate-200 bg-white text-slate-800" : "border-slate-700 bg-slate-900 text-slate-100"}`}
            >
              JD
            </button>
            {openMenu ? (
              <div className={`absolute right-0 top-10 z-50 min-w-36 rounded-lg border p-1 text-xs shadow-sm backdrop-blur ${isLightTheme ? "border-slate-200 bg-white text-slate-600" : "border-slate-800 bg-slate-900/95 text-slate-300"}`}>
                <Link href="/settings" onClick={() => setOpenMenu(false)} className={`block rounded-md px-3 py-2 ${isLightTheme ? "hover:bg-white hover:text-slate-900" : "hover:bg-slate-800 hover:text-slate-100"}`}>Profile</Link>
                <Link href="/settings" onClick={() => setOpenMenu(false)} className={`block rounded-md px-3 py-2 ${isLightTheme ? "hover:bg-white hover:text-slate-900" : "hover:bg-slate-800 hover:text-slate-100"}`}>Billing</Link>
                <button type="button" onClick={handleLogout} className={`block w-full rounded-md px-3 py-2 text-left ${isLightTheme ? "hover:bg-white hover:text-slate-900" : "hover:bg-slate-800 hover:text-slate-100"}`}>Logout</button>
              </div>
            ) : null}
          </div>
        )}

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleToggle}
          className={`inline-flex h-8 items-center gap-2 rounded-full border px-3 text-xs ${isLightTheme ? "border-slate-200 bg-white text-slate-600" : "border-slate-800 bg-slate-900/60 text-slate-300"}`}
        >
          <span aria-hidden="true">{isLightTheme ? "🌙" : "☀"}</span>
          <span>{isLightTheme ? "Dark" : "Light"}</span>
        </Button>
      </div>
    </nav>
  );
}
