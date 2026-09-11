import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { ScadenzaBadge } from "@/components/scadenza-badge";
import { createClient } from "@/lib/supabase/server";
import { formattaData, statoScadenza } from "@/lib/date-utils";
import { TIPO_SCADENZA_LABELS } from "@/lib/labels";
import type { StatoScadenza } from "@/lib/date-utils";

type RigaScadenza = {
  id: string;
  entita: "Mezzo" | "Attrezzatura" | "Personale";
  entitaNome: string;
  entitaHref: string;
  tipo: string;
  data_scadenza: string;
  completata_il: string | null;
  stato: StatoScadenza;
};

const FILTRI: { valore: string; label: string }[] = [
  { valore: "attive", label: "Scadute + in scadenza" },
  { valore: "tutte", label: "Tutte" },
  { valore: "completate", label: "Completate" },
];

type ScadenzaMezzoRiga = {
  id: string;
  tipo: string;
  data_scadenza: string;
  completata_il: string | null;
  mezzo: { id: string; nome: string } | null;
};
type ScadenzaAttrezzaturaRiga = {
  id: string;
  tipo: string;
  data_scadenza: string;
  completata_il: string | null;
  attrezzatura: { id: string; nome: string } | null;
};
type ScadenzaPersonaleRiga = {
  id: string;
  tipo: string;
  data_scadenza: string;
  completata_il: string | null;
  persona: { id: string; nome_completo: string } | null;
};

export default async function ScadenzePage(ctx: PageProps<"/scadenze">) {
  const searchParams = await ctx.searchParams;
  const filtro = typeof searchParams.stato === "string" ? searchParams.stato : "attive";

  const supabase = await createClient();

  const [{ data: mezzi }, { data: attrezzature }, { data: personale }] = await Promise.all([
    supabase
      .from("scadenze_mezzi")
      .select("id, tipo, data_scadenza, completata_il, mezzo:mezzi(id, nome)")
      .returns<ScadenzaMezzoRiga[]>(),
    supabase
      .from("scadenze_attrezzature")
      .select("id, tipo, data_scadenza, completata_il, attrezzatura:attrezzature(id, nome)")
      .returns<ScadenzaAttrezzaturaRiga[]>(),
    supabase
      .from("scadenze_personale")
      .select("id, tipo, data_scadenza, completata_il, persona:personale(id, nome_completo)")
      .returns<ScadenzaPersonaleRiga[]>(),
  ]);

  const righe: RigaScadenza[] = [
    ...(mezzi ?? []).map((s) => ({
      id: s.id,
      entita: "Mezzo" as const,
      entitaNome: s.mezzo?.nome ?? "—",
      entitaHref: `/mezzi/${s.mezzo?.id}`,
      tipo: s.tipo,
      data_scadenza: s.data_scadenza,
      completata_il: s.completata_il,
      stato: statoScadenza(s.data_scadenza, s.completata_il),
    })),
    ...(attrezzature ?? []).map((s) => ({
      id: s.id,
      entita: "Attrezzatura" as const,
      entitaNome: s.attrezzatura?.nome ?? "—",
      entitaHref: `/attrezzature/${s.attrezzatura?.id}`,
      tipo: s.tipo,
      data_scadenza: s.data_scadenza,
      completata_il: s.completata_il,
      stato: statoScadenza(s.data_scadenza, s.completata_il),
    })),
    ...(personale ?? []).map((s) => ({
      id: s.id,
      entita: "Personale" as const,
      entitaNome: s.persona?.nome_completo ?? "—",
      entitaHref: `/personale/${s.persona?.id}`,
      tipo: s.tipo,
      data_scadenza: s.data_scadenza,
      completata_il: s.completata_il,
      stato: statoScadenza(s.data_scadenza, s.completata_il),
    })),
  ];

  const righeFiltrate = righe
    .filter((r) => {
      if (filtro === "completate") return r.stato === "completata";
      if (filtro === "tutte") return true;
      return r.stato === "scaduta" || r.stato === "urgente";
    })
    .sort((a, b) => a.data_scadenza.localeCompare(b.data_scadenza));

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader />
      <main className="flex-1 bg-zinc-50 px-6 py-8 dark:bg-black">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Scadenze</h1>
          <div className="flex gap-2">
            {FILTRI.map((f) => (
              <Link
                key={f.valore}
                href={`/scadenze?stato=${f.valore}`}
                className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                  filtro === f.valore
                    ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                    : "border border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
                }`}
              >
                {f.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-left text-xs uppercase text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-3">Stato</th>
                <th className="px-4 py-3">Scadenza</th>
                <th className="px-4 py-3">Ambito</th>
                <th className="px-4 py-3">Riferimento</th>
                <th className="px-4 py-3">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
              {righeFiltrate.map((r) => (
                <tr key={`${r.entita}-${r.id}`} className="hover:bg-zinc-50 dark:hover:bg-zinc-900">
                  <td className="px-4 py-3">
                    <ScadenzaBadge stato={r.stato} />
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">{TIPO_SCADENZA_LABELS[r.tipo as keyof typeof TIPO_SCADENZA_LABELS]}</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">{r.entita}</td>
                  <td className="px-4 py-3">
                    <Link href={r.entitaHref} className="font-medium text-zinc-900 hover:underline dark:text-zinc-50">
                      {r.entitaNome}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">{formattaData(r.data_scadenza)}</td>
                </tr>
              ))}
              {righeFiltrate.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-zinc-400 dark:text-zinc-600">
                    Nessuna scadenza in questa vista.
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
