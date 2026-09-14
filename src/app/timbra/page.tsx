import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { ConfirmTimbratura } from "./confirm-timbratura";
import type { Presenza } from "@/lib/types";

export default async function TimbraturaPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const { data: persona } = await supabase
    .from("personale")
    .select("id, nome_completo")
    .eq("auth_user_id", (await supabase.auth.getUser()).data.user?.id ?? "")
    .single();

  let ultimoStato: Presenza["tipo"] | null = null;
  if (persona) {
    const { data: ultimaPresenza } = await supabase
      .from("presenze")
      .select("tipo")
      .eq("personale_id", persona.id)
      .order("timbrato_il", { ascending: false })
      .limit(1)
      .maybeSingle();
    ultimoStato = ultimaPresenza?.tipo ?? null;
  }

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 px-4 py-10 dark:bg-black">
      <Image
        src="/lg_pmp.png"
        alt="Pompeano Antonio & Figli"
        width={480}
        height={200}
        priority
        className="mb-6 h-20 w-auto"
      />
      <h1 className="mb-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        {persona?.nome_completo ?? profile.nome_completo}
      </h1>

      {persona ? (
        <>
          <p className="mb-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
            {ultimoStato === "entrata" ? "Risulti attualmente presente." : "Conferma la tua posizione per timbrare."}
          </p>
          <ConfirmTimbratura ultimoStato={ultimoStato} />
        </>
      ) : (
        <p className="max-w-sm text-center text-sm text-red-600 dark:text-red-400">
          Il tuo account non è collegato a nessun nominativo in anagrafica. Contatta l&apos;amministratore.
        </p>
      )}
    </div>
  );
}
