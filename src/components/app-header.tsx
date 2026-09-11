import Image from "next/image";
import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth";
import { LogoutButton } from "./logout-button";
import { MobileNav } from "./mobile-nav";

export async function AppHeader() {
  const profile = await getCurrentProfile();
  const isAdmin = profile.ruolo === "admin";

  return (
    <header className="relative border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950 sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image src="/lg_pmp.png" alt="Pompeano Antonio & Figli" width={480} height={200} className="h-8 w-auto" priority />
          </Link>
          <nav className="hidden items-center gap-4 text-sm font-medium text-zinc-600 dark:text-zinc-300 md:flex">
            <Link href="/dashboard" className="hover:text-zinc-900 dark:hover:text-zinc-50">
              Dashboard
            </Link>
            <Link href="/personale" className="hover:text-zinc-900 dark:hover:text-zinc-50">
              Personale
            </Link>
            <Link href="/mezzi" className="hover:text-zinc-900 dark:hover:text-zinc-50">
              Mezzi
            </Link>
            <Link href="/attrezzature" className="hover:text-zinc-900 dark:hover:text-zinc-50">
              Attrezzature
            </Link>
            <Link href="/scadenze" className="hover:text-zinc-900 dark:hover:text-zinc-50">
              Scadenze
            </Link>
            {isAdmin && (
              <Link href="/admin" className="hover:text-zinc-900 dark:hover:text-zinc-50">
                Amministrazione
              </Link>
            )}
          </nav>
        </div>
        <div className="hidden items-center gap-4 md:flex">
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            {profile.nome_completo} · <span className="capitalize">{profile.ruolo}</span>
          </span>
          <LogoutButton />
        </div>
        <MobileNav isAdmin={isAdmin} nomeCompleto={profile.nome_completo} ruolo={profile.ruolo} />
      </div>
    </header>
  );
}
