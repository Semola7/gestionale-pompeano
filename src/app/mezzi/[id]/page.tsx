import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { ScadenzaBadge } from "@/components/scadenza-badge";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formattaData, statoScadenza } from "@/lib/date-utils";
import { SCADENZE_MEZZI_TIPI, TIPO_MEZZO_LABELS, TIPO_SCADENZA_LABELS } from "@/lib/labels";
import type { DocumentoMezzo, Mezzo, ScadenzaMezzo } from "@/lib/types";
import { FileDropzone } from "../file-dropzone";
import {
  aggiungiScadenzaMezzo,
  completaScadenzaMezzo,
  eliminaDocumentoMezzo,
  eliminaMezzo,
  eliminaScadenzaMezzo,
} from "../actions";

export default async function MezzoDetailPage(ctx: PageProps<"/mezzi/[id]">) {
  const { id } = await ctx.params;
  const profile = await getCurrentProfile();
  const supabase = await createClient();
  const isAdmin = profile.ruolo === "admin";

  const { data: mezzo } = await supabase.from("mezzi").select("*").eq("id", id).single<Mezzo>();
  if (!mezzo) notFound();

  const { data: scadenze } = await supabase
    .from("scadenze_mezzi")
    .select("*")
    .eq("mezzo_id", id)
    .order("data_scadenza")
    .returns<ScadenzaMezzo[]>();

  const { data: documenti } = await supabase
    .from("documenti_mezzi")
    .select("*")
    .eq("mezzo_id", id)
    .order("creato_il", { ascending: false })
    .returns<DocumentoMezzo[]>();

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader />
      <main className="flex-1 space-y-6 bg-zinc-50 px-6 py-8 dark:bg-black">
        <div>
          <Link href="/mezzi" className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50">
            ← Mezzi
          </Link>
        </div>

        <div className="flex items-start justify-between rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <div>
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">{mezzo.nome}</h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {TIPO_MEZZO_LABELS[mezzo.tipo]}
              {mezzo.targa ? ` · Targa ${mezzo.targa}` : ""}
              {mezzo.marca || mezzo.modello ? ` · ${[mezzo.marca, mezzo.modello].filter(Boolean).join(" ")}` : ""}
              {mezzo.anno_immatricolazione ? ` · ${mezzo.anno_immatricolazione}` : ""}
            </p>
            {mezzo.note && <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{mezzo.note}</p>}
          </div>
          {isAdmin && (
            <form action={eliminaMezzo.bind(null, mezzo.id)}>
              <button type="submit" className="text-sm text-red-600 hover:underline dark:text-red-400">
                Elimina mezzo
              </button>
            </form>
          )}
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-4 text-sm font-semibold uppercase text-zinc-500 dark:text-zinc-400">Scadenze</h2>

          <div className="mb-4 space-y-2">
            {(scadenze ?? []).map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between gap-4 rounded-md border border-zinc-100 px-3 py-2 dark:border-zinc-900"
              >
                <div className="flex items-center gap-3">
                  <ScadenzaBadge stato={statoScadenza(s.data_scadenza, s.completata_il)} />
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{TIPO_SCADENZA_LABELS[s.tipo]}</span>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">{formattaData(s.data_scadenza)}</span>
                  {s.descrizione && <span className="text-sm text-zinc-400 dark:text-zinc-600">{s.descrizione}</span>}
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-3 text-sm">
                    {!s.completata_il && (
                      <form action={completaScadenzaMezzo.bind(null, s.id, mezzo.id)}>
                        <button type="submit" className="text-emerald-600 hover:underline dark:text-emerald-400">
                          Completa
                        </button>
                      </form>
                    )}
                    <form action={eliminaScadenzaMezzo.bind(null, s.id, mezzo.id)}>
                      <button type="submit" className="text-red-600 hover:underline dark:text-red-400">
                        Elimina
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ))}
            {(scadenze ?? []).length === 0 && (
              <p className="text-sm text-zinc-400 dark:text-zinc-600">Nessuna scadenza registrata.</p>
            )}
          </div>

          {isAdmin && (
            <form action={aggiungiScadenzaMezzo} className="flex flex-wrap items-end gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-900">
              <input type="hidden" name="mezzo_id" value={mezzo.id} />
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">Tipo</label>
                <select name="tipo" required className="rounded-md border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900">
                  {SCADENZE_MEZZI_TIPI.map((tipo) => (
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

        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-4 text-sm font-semibold uppercase text-zinc-500 dark:text-zinc-400">Documenti</h2>

          <div className="mb-4 space-y-2">
            {(documenti ?? []).map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between gap-4 rounded-md border border-zinc-100 px-3 py-2 dark:border-zinc-900"
              >
                <a href={`/mezzi/download/${doc.id}`} className="text-sm text-zinc-900 hover:underline dark:text-zinc-50">
                  {doc.nome_file}
                </a>
                {isAdmin && (
                  <form action={eliminaDocumentoMezzo.bind(null, doc.id, doc.storage_path, mezzo.id)}>
                    <button type="submit" className="text-sm text-red-600 hover:underline dark:text-red-400">
                      Elimina
                    </button>
                  </form>
                )}
              </div>
            ))}
            {(documenti ?? []).length === 0 && (
              <p className="text-sm text-zinc-400 dark:text-zinc-600">Nessun documento caricato.</p>
            )}
          </div>

          {isAdmin && <FileDropzone mezzoId={mezzo.id} />}
        </div>
      </main>
    </div>
  );
}
