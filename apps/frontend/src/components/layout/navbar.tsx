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

  useEffect(() => {
    setMounted(true);
    const storedRole = localStorage.getItem("jsondeck.role") as UserRole | null;
    if (storedRole) {
      setRole(storedRole);
    }
  }, []);

  const visibleLinks = useMemo(() => navLinks.filter((link) => link.roles.includes(role)), [role]);

  const handleToggle = () => {
    if (!mounted) return;
    setTheme(resolvedTheme === "light" ? "dark" : "light");
  };

  const isLightTheme = mounted && resolvedTheme === "light";

  return (
    <nav className="glass sticky top-2 z-40 mx-2 mt-2 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border px-3 py-2 shadow-sm sm:mx-3 sm:px-4 sm:py-2.5">
      <Link href="/" className="flex shrink-0 items-center gap-2 text-base font-semibold text-text sm:text-lg">
        <span className="h-2 w-2 rounded-full bg-accent" />
        JSONDeck
      </Link>

      <div className="order-3 flex w-full min-w-0 items-center gap-1 overflow-x-auto pb-1 text-sm text-secondary sm:order-2 sm:w-auto sm:flex-wrap sm:justify-center sm:gap-2 sm:overflow-visible sm:pb-0">
        {visibleLinks.map((link) => {
          const isActive = pathname === link.href || (link.href === "/home" && pathname === "/");

          return (
            <motion.div
              key={link.href}
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.98, y: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <Link
                href={link.href}
                className={`relative block cursor-pointer whitespace-nowrap rounded-lg border px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] transition-all duration-200 ${
                  isActive
                    ? "border-blue-200 bg-blue-50 font-semibold text-blue-600 shadow-sm"
                    : "border-border bg-card font-medium text-secondary hover:bg-slate-100 hover:text-slate-900 hover:shadow-md"
                }`}
              >
                {link.label}
                {isActive ? (
                  <motion.span
                    layoutId="active-navbar-indicator"
                    className="absolute inset-x-2 -bottom-1.5 h-0.5 rounded-full bg-blue-500"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                ) : null}
              </Link>
            </motion.div>
          );
        })}
      </div>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleToggle}
        className="order-2 inline-flex h-8 items-center gap-2 rounded-full px-3 text-xs sm:order-3"
      >
        <span aria-hidden="true">{isLightTheme ? "🌙" : "☀"}</span>
        <span>{isLightTheme ? "Dark" : "Light"}</span>
      </Button>
    </nav>
  );
}
