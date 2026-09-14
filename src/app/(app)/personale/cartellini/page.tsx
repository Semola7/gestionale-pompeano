import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { raggruppaPerGiorno } from "@/lib/cartellino";
import type { Personale, Presenza } from "@/lib/types";

export default async function CartelliniPage() {
  const supabase = await createClient();

  const { data: personale } = await supabase
    .from("personale")
    .select("id, nome_completo")
    .not("auth_user_id", "is", null)
    .order("nome_completo")
    .returns<Pick<Personale, "id" | "nome_completo">[]>();

  const inizioMese = new Date();
  inizioMese.setDate(1);
  inizioMese.setHours(0, 0, 0, 0);

  const { data: presenzeMese } = await supabase
    .from("presenze")
    .select("*")
    .gte("timbrato_il", inizioMese.toISOString())
    .returns<Presenza[]>();

  const presenzePerPersona = new Map<string, Presenza[]>();
  for (const p of presenzeMese ?? []) {
    const lista = presenzePerPersona.get(p.personale_id) ?? [];
    lista.push(p);
    presenzePerPersona.set(p.personale_id, lista);
  }

  const righe = (personale ?? []).map((persona) => {
    const giorni = raggruppaPerGiorno(presenzePerPersona.get(persona.id) ?? []);
    const oreMese = giorni.reduce((tot, g) => tot + g.oreLavorate, 0);
    const ultimaTimbratura = giorni[0]?.eventi.at(-1)?.timbrato_il ?? null;
    return { persona, oreMese, giorniPresenti: giorni.length, ultimaTimbratura };
  });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        Cartellini — {new Date().toLocaleDateString("it-IT", { month: "long", year: "numeric" })}
      </h1>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-left text-xs uppercase text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-3">Nominativo</th>
                <th className="px-4 py-3">Ore questo mese</th>
                <th className="px-4 py-3">Giorni presenti</th>
                <th className="px-4 py-3">Ultima timbratura</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
              {righe.map((r) => (
                <tr key={r.persona.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900">
                  <td className="px-4 py-3">
                    <Link
                      href={`/personale/cartellini/${r.persona.id}`}
                      className="font-medium text-zinc-900 hover:underline dark:text-zinc-50"
                    >
                      {r.persona.nome_completo}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">{r.oreMese.toFixed(1)} h</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">{r.giorniPresenti}</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">
                    {r.ultimaTimbratura
                      ? new Date(r.ultimaTimbratura).toLocaleString("it-IT", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </td>
                </tr>
              ))}
              {righe.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-zinc-400 dark:text-zinc-600">
                    Nessun dipendente con accesso alla timbratura.
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
