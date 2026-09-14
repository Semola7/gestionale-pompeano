import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { formattaData } from "@/lib/date-utils";
import { StatoFerieBadge } from "@/components/stato-ferie-badge";
import { DipendenteNav } from "../dipendente-nav";
import { richiediFerie } from "./actions";
import type { RichiestaFerie } from "@/lib/types";

export default async function FeriePage() {
  const supabase = await createClient();

  const { data: persona } = await supabase
    .from("personale")
    .select("id, nome_completo")
    .eq("auth_user_id", (await supabase.auth.getUser()).data.user?.id ?? "")
    .single();

  const { data: richieste } = persona
    ? await supabase
        .from("richieste_ferie")
        .select("*")
        .eq("personale_id", persona.id)
        .order("creato_il", { ascending: false })
        .returns<RichiestaFerie[]>()
    : { data: null };

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
        {persona?.nome_completo ?? "Ferie"}
      </h1>

      <DipendenteNav attivo="ferie" />

      {persona && (
        <>
          <form
            action={richiediFerie}
            className="mb-6 w-full max-w-lg space-y-3 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <h2 className="text-sm font-semibold uppercase text-zinc-500 dark:text-zinc-400">Nuova richiesta</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">Dal</label>
                <input
                  type="date"
                  name="data_inizio"
                  required
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">Al</label>
                <input
                  type="date"
                  name="data_fine"
                  required
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">Note (opzionale)</label>
              <textarea
                name="note"
                rows={2}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>
            <button
              type="submit"
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Invia richiesta
            </button>
          </form>

          <div className="w-full max-w-lg space-y-2">
            {(richieste ?? []).map((r) => (
              <div
                key={r.id}
                className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    {formattaData(r.data_inizio)} → {formattaData(r.data_fine)}
                  </span>
                  <StatoFerieBadge stato={r.stato} />
                </div>
                {r.note && <p className="text-sm text-zinc-500 dark:text-zinc-400">{r.note}</p>}
              </div>
            ))}
            {(richieste ?? []).length === 0 && (
              <p className="text-center text-sm text-zinc-400 dark:text-zinc-600">Nessuna richiesta inviata.</p>
            )}
          </div>
        </>
      )}

      {!persona && (
        <p className="max-w-sm text-center text-sm text-red-600 dark:text-red-400">
          Il tuo account non è collegato a nessun nominativo in anagrafica. Contatta l&apos;amministratore.
        </p>
      )}
    </div>
  );
}
