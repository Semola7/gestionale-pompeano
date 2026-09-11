import Image from "next/image";
import Link from "next/link";
import { LogoutButton } from "./logout-button";
import type { RuoloUtente } from "@/lib/types";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/personale", label: "Personale" },
  { href: "/mezzi", label: "Mezzi" },
  { href: "/attrezzature", label: "Attrezzature" },
  { href: "/scadenze", label: "Scadenze" },
];

export function AppSidebar({
  isAdmin,
  nomeCompleto,
  ruolo,
}: {
  isAdmin: boolean;
  nomeCompleto: string;
  ruolo: RuoloUtente;
}) {
  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 md:flex">
      <div className="border-b border-zinc-100 px-4 py-4 dark:border-zinc-900">
        <Link href="/dashboard" className="flex items-center">
          <Image src="/lg_pmp.png" alt="Pompeano Antonio & Figli" width={480} height={200} className="h-8 w-auto" priority />
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4 text-sm font-medium text-zinc-600 dark:text-zinc-300">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="block rounded-md px-3 py-2 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
          >
            {link.label}
          </Link>
        ))}
        {isAdmin && (
          <Link
            href="/admin"
            className="block rounded-md px-3 py-2 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
          >
            Amministrazione
          </Link>
        )}
      </nav>

      <div className="border-t border-zinc-100 px-4 py-4 dark:border-zinc-900">
        <p className="mb-3 text-sm text-zinc-500 dark:text-zinc-400">
          {nomeCompleto}
          <br />
          <span className="capitalize">{ruolo}</span>
        </p>
        <LogoutButton />
      </div>
    </aside>
  );
}
