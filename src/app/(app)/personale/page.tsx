import Link from "next/link";
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

  const { data: scadenze } = await supabase.from("scadenze_personale").select("*").returns<ScadenzaPersonale[]>();

  const prossimaPerPersona = new Map<string, ScadenzaPersonale>();
  for (const s of scadenze ?? []) {
    const attuale = prossimaPerPersona.get(s.personale_id);
    if (!attuale || s.data_scadenza < attuale.data_scadenza) {
      prossimaPerPersona.set(s.personale_id, s);
    }
  }

  const conteggioPerMansione = new Map<string, number>();
  for (const p of personale ?? []) {
    const chiave = p.mansione?.trim() || "Senza mansione";
    conteggioPerMansione.set(chiave, (conteggioPerMansione.get(chiave) ?? 0) + 1);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Personale</h1>
        <div className="flex gap-3">
          <Link
            href="/personale/cartellini"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            Cartellini
          </Link>
          {profile.ruolo === "admin" && (
            <Link
              href="/personale/nuovo"
              className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              + Nuovo nominativo
            </Link>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">Totale personale</p>
          <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{personale?.length ?? 0}</p>
          <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-zinc-600 dark:text-zinc-300 sm:grid-cols-3">
            {Array.from(conteggioPerMansione.entries()).map(([mansione, n]) => (
              <li key={mansione} className="flex justify-between gap-2">
                <span>{mansione}</span>
                <span>{n}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-left text-xs uppercase text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-3">Nominativo</th>
                <th className="px-4 py-3">Mansione</th>
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
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">{p.mansione ?? "—"}</td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">{p.telefono ?? "—"}</td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">{p.email ?? "—"}</td>
                    <td className="px-4 py-3">
                      {prossima ? (
                        <ScadenzaBadge stato={statoScadenza(prossima.data_scadenza)} />
                      ) : (
                        <span className="text-zinc-400 dark:text-zinc-600">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {(personale ?? []).length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-zinc-400 dark:text-zinc-600">
                    Nessun nominativo registrato.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
      </div>
    </div>
  );
}
