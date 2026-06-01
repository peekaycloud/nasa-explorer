"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { MODULES } from "@/lib/nasa";
import { Button } from "@/components/ui/button";
import { SpaceIcon } from "@/components/ui/space-icon";

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <SpaceIcon name="rocket" size={22} tone="accent" label="NASA Explorer" />
          <div>
            <p className="text-sm font-semibold tracking-wide text-white">
              NASA Explorer
            </p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
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
                "flex items-center gap-1.5 rounded-md px-3 py-2 text-sm transition-colors",
                pathname === module.href
                  ? "bg-white/10 text-[var(--matrix-green)]"
                  : "text-neutral-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <SpaceIcon
                name={module.icon}
                size={16}
                tone={pathname === module.href ? "accent" : "muted"}
              />
              {module.title.split(" ")[0]}
            </Link>
          ))}
        </nav>

        <Button
          variant="ghost"
          size="icon"
          className="text-white lg:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {open && (
        <nav className="border-t border-white/10 bg-black px-4 py-3 lg:hidden">
          <div className="grid gap-1">
            {MODULES.map((module) => (
              <Link
                key={module.href}
                href={module.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2.5 text-sm",
                  pathname === module.href
                    ? "bg-white/10 text-[var(--matrix-green)]"
                    : "text-neutral-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <SpaceIcon
                  name={module.icon}
                  size={20}
                  tone={pathname === module.href ? "accent" : "muted"}
                />
                {module.title}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
