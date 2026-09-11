import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth";
import { LogoutButton } from "./logout-button";

export async function AppHeader() {
  const profile = await getCurrentProfile();

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 bg-white px-6 py-3 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center gap-6">
        <Link href="/dashboard" className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Gestionale Sollevamenti
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium text-zinc-600 dark:text-zinc-300">
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
          {profile.ruolo === "admin" && (
            <Link href="/admin" className="hover:text-zinc-900 dark:hover:text-zinc-50">
              Amministrazione
            </Link>
          )}
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          {profile.nome_completo} · <span className="capitalize">{profile.ruolo}</span>
        </span>
        <LogoutButton />
      </div>
    </header>
  );
}
