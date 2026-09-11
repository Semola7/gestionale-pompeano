"use client";

import { useState } from "react";
import Link from "next/link";
import { LogoutButton } from "./logout-button";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/personale", label: "Personale" },
  { href: "/mezzi", label: "Mezzi" },
  { href: "/attrezzature", label: "Attrezzature" },
  { href: "/scadenze", label: "Scadenze" },
];

export function MobileNav({
  isAdmin,
  nomeCompleto,
  ruolo,
}: {
  isAdmin: boolean;
  nomeCompleto: string;
  ruolo: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "Chiudi menu" : "Apri menu"}
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-md border border-zinc-300 text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
      >
        {open ? (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full z-20 border-b border-zinc-200 bg-white px-4 py-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <nav className="flex flex-col gap-1 text-sm font-medium text-zinc-600 dark:text-zinc-300">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
              >
                Amministrazione
              </Link>
            )}
          </nav>
          <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-900">
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              {nomeCompleto} · <span className="capitalize">{ruolo}</span>
            </span>
            <LogoutButton />
          </div>
        </div>
      )}
    </div>
  );
}
