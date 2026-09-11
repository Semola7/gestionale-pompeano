import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { ScadenzaBadge } from "@/components/scadenza-badge";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { statoScadenza } from "@/lib/date-utils";
import { TIPO_MEZZO_LABELS } from "@/lib/labels";
import type { Mezzo, ScadenzaMezzo } from "@/lib/types";

export default async function MezziPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const { data: mezzi } = await supabase
    .from("mezzi")
    .select("*")
    .order("nome")
    .returns<Mezzo[]>();

  const { data: scadenze } = await supabase
    .from("scadenze_mezzi")
    .select("*")
    .is("completata_il", null)
    .returns<ScadenzaMezzo[]>();

  const prossimaScadenzaPerMezzo = new Map<string, ScadenzaMezzo>();
  for (const s of scadenze ?? []) {
    const attuale = prossimaScadenzaPerMezzo.get(s.mezzo_id);
    if (!attuale || s.data_scadenza < attuale.data_scadenza) {
      prossimaScadenzaPerMezzo.set(s.mezzo_id, s);
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader />
      <main className="flex-1 bg-zinc-50 px-6 py-8 dark:bg-black">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Mezzi</h1>
          {profile.ruolo === "admin" && (
            <Link
              href="/mezzi/nuovo"
              className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              + Nuovo mezzo
            </Link>
          )}
        </div>

        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-left text-xs uppercase text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Targa</th>
                <th className="px-4 py-3">Prossima scadenza</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
              {(mezzi ?? []).map((mezzo) => {
                const prossima = prossimaScadenzaPerMezzo.get(mezzo.id);
                return (
                  <tr key={mezzo.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900">
                    <td className="px-4 py-3">
                      <Link href={`/mezzi/${mezzo.id}`} className="font-medium text-zinc-900 hover:underline dark:text-zinc-50">
                        {mezzo.nome}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">{TIPO_MEZZO_LABELS[mezzo.tipo]}</td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">{mezzo.targa ?? "—"}</td>
                    <td className="px-4 py-3">
                      {prossima ? (
                        <ScadenzaBadge stato={statoScadenza(prossima.data_scadenza, prossima.completata_il)} />
                      ) : (
                        <span className="text-zinc-400 dark:text-zinc-600">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {(mezzi ?? []).length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-zinc-400 dark:text-zinc-600">
                    Nessun mezzo registrato.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      </main>
    </div>
  );
}
