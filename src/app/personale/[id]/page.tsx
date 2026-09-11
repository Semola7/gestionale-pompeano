import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SCADENZE_PERSONALE_TIPI, TIPO_SCADENZA_LABELS } from "@/lib/labels";
import type { Personale, ScadenzaPersonale } from "@/lib/types";
import { aggiungiScadenzaPersonale, eliminaPersonale } from "../actions";
import { ScadenzaRow } from "./scadenza-row";

export default async function PersonaleDetailPage(ctx: PageProps<"/personale/[id]">) {
  const { id } = await ctx.params;
  const profile = await getCurrentProfile();
  const supabase = await createClient();
  const isAdmin = profile.ruolo === "admin";

  const { data: persona } = await supabase.from("personale").select("*").eq("id", id).single<Personale>();
  if (!persona) notFound();

  const { data: scadenze } = await supabase
    .from("scadenze_personale")
    .select("*")
    .eq("personale_id", id)
    .order("data_scadenza")
    .returns<ScadenzaPersonale[]>();

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader />
      <main className="flex-1 space-y-6 bg-zinc-50 px-6 py-8 dark:bg-black">
        <div>
          <Link href="/personale" className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50">
            ← Personale
          </Link>
        </div>

        <div className="flex items-start justify-between rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <div>
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">{persona.nome_completo}</h1>
            {persona.mansione && <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{persona.mansione}</p>}
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {[persona.telefono, persona.email].filter(Boolean).join(" · ") || "Nessun contatto registrato"}
            </p>
            {persona.note && <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{persona.note}</p>}
          </div>
          {isAdmin && (
            <form action={eliminaPersonale.bind(null, persona.id)}>
              <button type="submit" className="text-sm text-red-600 hover:underline dark:text-red-400">
                Elimina nominativo
              </button>
            </form>
          )}
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-4 text-sm font-semibold uppercase text-zinc-500 dark:text-zinc-400">Scadenze</h2>

          <div className="mb-4 space-y-2">
            {(scadenze ?? []).map((s) =>
              isAdmin ? (
                <ScadenzaRow key={s.id} scadenza={s} personaleId={persona.id} />
              ) : (
                <div
                  key={s.id}
                  className="flex items-center gap-3 rounded-md border border-zinc-100 px-3 py-2 dark:border-zinc-900"
                >
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{TIPO_SCADENZA_LABELS[s.tipo]}</span>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">{s.data_scadenza}</span>
                </div>
              )
            )}
            {(scadenze ?? []).length === 0 && (
              <p className="text-sm text-zinc-400 dark:text-zinc-600">Nessuna scadenza registrata.</p>
            )}
          </div>

          {isAdmin && (
            <form
              action={aggiungiScadenzaPersonale}
              className="flex flex-wrap items-end gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-900"
            >
              <input type="hidden" name="personale_id" value={persona.id} />
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">Tipo</label>
                <select name="tipo" required className="rounded-md border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900">
                  {SCADENZE_PERSONALE_TIPI.map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {TIPO_SCADENZA_LABELS[tipo]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">Data scadenza</label>
                <input
                  type="date"
                  name="data_scadenza"
                  required
                  className="rounded-md border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                />
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">Descrizione (opzionale)</label>
                <input
                  name="descrizione"
                  className="w-full rounded-md border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                />
              </div>
              <button
                type="submit"
                className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Aggiungi
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
