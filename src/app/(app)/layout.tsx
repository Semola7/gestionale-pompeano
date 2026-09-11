import Image from "next/image";
import { AppSidebar } from "@/components/app-sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { getCurrentProfile } from "@/lib/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  const isAdmin = profile.ruolo === "admin";

  return (
    <div className="flex min-h-screen flex-1">
      <AppSidebar isAdmin={isAdmin} nomeCompleto={profile.nome_completo} ruolo={profile.ruolo} />
      <div className="flex flex-1 flex-col">
        <div className="relative flex items-center gap-3 border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950 md:hidden">
          <MobileNav isAdmin={isAdmin} nomeCompleto={profile.nome_completo} ruolo={profile.ruolo} />
          <Image src="/lg_pmp.png" alt="Pompeano Antonio & Figli" width={480} height={200} className="h-7 w-auto" priority />
        </div>
        <main className="flex-1 bg-zinc-50 px-6 py-8 dark:bg-black">{children}</main>
      </div>
    </div>
  );
}
