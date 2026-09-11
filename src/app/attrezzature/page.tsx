import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { ScadenzaBadge } from "@/components/scadenza-badge";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { statoScadenza } from "@/lib/date-utils";
import { TIPO_ATTREZZATURA_LABELS } from "@/lib/labels";
import type { Attrezzatura, ScadenzaAttrezzatura } from "@/lib/types";

export default async function AttrezzaturePage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const { data: attrezzature } = await supabase
    .from("attrezzature")
    .select("*")
    .order("nome")
    .returns<Attrezzatura[]>();

  const { data: scadenze } = await supabase
    .from("scadenze_attrezzature")
    .select("*")
    .is("completata_il", null)
    .returns<ScadenzaAttrezzatura[]>();

  const prossimaPerAttrezzatura = new Map<string, ScadenzaAttrezzatura>();
  for (const s of scadenze ?? []) {
    const attuale = prossimaPerAttrezzatura.get(s.attrezzatura_id);
    if (!attuale || s.data_scadenza < attuale.data_scadenza) {
      prossimaPerAttrezzatura.set(s.attrezzatura_id, s);
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader />
      <main className="flex-1 bg-zinc-50 px-6 py-8 dark:bg-black">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Attrezzature</h1>
          {profile.ruolo === "admin" && (
            <Link
              href="/attrezzature/nuovo"
              className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              + Nuova attrezzatura
            </Link>
          )}
        </div>

        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-left text-xs uppercase text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Matricola</th>
                <th className="px-4 py-3">Prossima scadenza</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
              {(attrezzature ?? []).map((a) => {
                const prossima = prossimaPerAttrezzatura.get(a.id);
                return (
                  <tr key={a.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900">
                    <td className="px-4 py-3">
                      <Link href={`/attrezzature/${a.id}`} className="font-medium text-zinc-900 hover:underline dark:text-zinc-50">
                        {a.nome}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">{TIPO_ATTREZZATURA_LABELS[a.tipo]}</td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">{a.matricola ?? "—"}</td>
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
              {(attrezzature ?? []).length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-zinc-400 dark:text-zinc-600">
                    Nessuna attrezzatura registrata.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
