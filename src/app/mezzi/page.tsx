import { AppHeader } from "@/components/app-header";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Mezzo } from "@/lib/types";
import { MezziTable } from "./mezzi-table";
import { NuovoMezzoModal } from "./nuovo-mezzo-modal";

export default async function MezziPage() {
  const profile = await getCurrentProfile();
  const isAdmin = profile.ruolo === "admin";
  const supabase = await createClient();

  const { data: mezzi } = await supabase.from("mezzi").select("*").order("nome").returns<Mezzo[]>();

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader />
      <main className="flex-1 bg-zinc-50 px-6 py-8 dark:bg-black">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Gestione mezzi & flotta aziendale</h1>
          {isAdmin && <NuovoMezzoModal />}
        </div>

        <MezziTable mezzi={mezzi ?? []} isAdmin={isAdmin} />
      </main>
    </div>
  );
}
