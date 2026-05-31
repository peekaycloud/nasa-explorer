"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Rocket, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { MODULES } from "@/lib/nasa";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#050816]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/20 ring-1 ring-indigo-400/30">
            <Rocket className="h-5 w-5 text-indigo-300" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wide text-white">
              NASA Explorer
            </p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-indigo-300/70">
              Open Data Dashboard
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {MODULES.filter((m) => m.href !== "/").map((module) => (
            <Link
              key={module.href}
              href={module.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm transition-colors",
                pathname === module.href
                  ? "bg-indigo-500/20 text-indigo-200"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              )}
            >
              {module.icon} {module.title.split(" ")[0]}
            </Link>
          ))}
        </nav>

        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden text-white"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {open && (
        <nav className="border-t border-white/10 bg-[#050816] px-4 py-3 lg:hidden">
          <div className="grid gap-1">
            {MODULES.map((module) => (
              <Link
                key={module.href}
                href={module.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-md px-3 py-2.5 text-sm",
                  pathname === module.href
                    ? "bg-indigo-500/20 text-indigo-200"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                )}
              >
                {module.icon} {module.title}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
