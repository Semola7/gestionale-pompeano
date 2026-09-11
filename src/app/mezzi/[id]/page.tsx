import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { ScadenzaBadge } from "@/components/scadenza-badge";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formattaData, statoScadenza } from "@/lib/date-utils";
import { MEZZO_SCADENZA_FIELDS, REGIME_POSSESSO_LABELS, TIPO_MEZZO_LABELS } from "@/lib/labels";
import type { DocumentoMezzo, Mezzo } from "@/lib/types";
import { FileDropzone } from "../file-dropzone";
import { eliminaDocumentoMezzo, eliminaMezzo } from "../actions";
import { MezzoEditForm } from "./mezzo-edit-form";

export default async function MezzoDetailPage(ctx: PageProps<"/mezzi/[id]">) {
  const { id } = await ctx.params;
  const profile = await getCurrentProfile();
  const supabase = await createClient();
  const isAdmin = profile.ruolo === "admin";

  const { data: mezzo } = await supabase.from("mezzi").select("*").eq("id", id).single<Mezzo>();
  if (!mezzo) notFound();

  const { data: documenti } = await supabase
    .from("documenti_mezzi")
    .select("*")
    .eq("mezzo_id", id)
    .order("creato_il", { ascending: false })
    .returns<DocumentoMezzo[]>();

  const scadenzeValorizzate = MEZZO_SCADENZA_FIELDS.filter((f) => mezzo[f.key]);

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader />
      <main className="flex-1 space-y-6 bg-zinc-50 px-6 py-8 dark:bg-black">
        <div>
          <Link href="/mezzi" className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50">
            ← Mezzi
          </Link>
        </div>

        {isAdmin ? (
          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="mb-4 flex items-center justify-between">
              <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">{mezzo.nome}</h1>
              <form action={eliminaMezzo.bind(null, mezzo.id)}>
                <button type="submit" className="text-sm text-red-600 hover:underline dark:text-red-400">
                  Elimina mezzo
                </button>
              </form>
            </div>
            <MezzoEditForm mezzo={mezzo} />
          </div>
        ) : (
          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">{mezzo.nome}</h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {TIPO_MEZZO_LABELS[mezzo.tipo]}
              {mezzo.targa ? ` · Targa ${mezzo.targa}` : ""}
              {mezzo.marca || mezzo.modello ? ` · ${[mezzo.marca, mezzo.modello].filter(Boolean).join(" ")}` : ""}
            </p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {REGIME_POSSESSO_LABELS[mezzo.regime_possesso]}
              {mezzo.assegnato_a ? ` · Assegnato a ${mezzo.assegnato_a}` : ""}
            </p>
            {mezzo.note && <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{mezzo.note}</p>}

            <div className="mt-4 space-y-2 border-t border-zinc-100 pt-4 dark:border-zinc-900">
              {scadenzeValorizzate.map((f) => (
                <div key={f.key} className="flex items-center justify-between text-sm">
                  <span className="text-zinc-600 dark:text-zinc-300">{f.label}</span>
                  <div className="flex items-center gap-2">
                    <ScadenzaBadge stato={statoScadenza(mezzo[f.key] as string)} />
                    <span className="text-zinc-500 dark:text-zinc-400">{formattaData(mezzo[f.key] as string)}</span>
                  </div>
                </div>
              ))}
              {scadenzeValorizzate.length === 0 && (
                <p className="text-sm text-zinc-400 dark:text-zinc-600">Nessuna scadenza registrata.</p>
              )}
            </div>
          </div>
        )}

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
