import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { ScadenzaBadge } from "@/components/scadenza-badge";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { statoScadenza } from "@/lib/date-utils";
import type { Personale, ScadenzaPersonale } from "@/lib/types";

export default async function PersonalePage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const { data: personale } = await supabase
    .from("personale")
    .select("*")
    .order("nome_completo")
    .returns<Personale[]>();

  const { data: scadenze } = await supabase
    .from("scadenze_personale")
    .select("*")
    .is("completata_il", null)
    .returns<ScadenzaPersonale[]>();

  const prossimaPerPersona = new Map<string, ScadenzaPersonale>();
  for (const s of scadenze ?? []) {
    const attuale = prossimaPerPersona.get(s.personale_id);
    if (!attuale || s.data_scadenza < attuale.data_scadenza) {
      prossimaPerPersona.set(s.personale_id, s);
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader />
      <main className="flex-1 bg-zinc-50 px-6 py-8 dark:bg-black">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Personale</h1>
          {profile.ruolo === "admin" && (
            <Link
              href="/personale/nuovo"
              className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              + Nuovo nominativo
            </Link>
          )}
        </div>

        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-left text-xs uppercase text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-3">Nominativo</th>
                <th className="px-4 py-3">Telefono</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Prossima scadenza</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
              {(personale ?? []).map((p) => {
                const prossima = prossimaPerPersona.get(p.id);
                return (
                  <tr key={p.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900">
                    <td className="px-4 py-3">
                      <Link href={`/personale/${p.id}`} className="font-medium text-zinc-900 hover:underline dark:text-zinc-50">
                        {p.nome_completo}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">{p.telefono ?? "—"}</td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">{p.email ?? "—"}</td>
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
              {(personale ?? []).length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-zinc-400 dark:text-zinc-600">
                    Nessun nominativo registrato.
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
