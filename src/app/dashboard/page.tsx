import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { ScadenzaBadge } from "@/components/scadenza-badge";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formattaData, statoScadenza } from "@/lib/date-utils";
import { TIPO_MEZZO_LABELS, TIPO_SCADENZA_LABELS } from "@/lib/labels";
import type { StatoScadenza } from "@/lib/date-utils";
import type { Mezzo } from "@/lib/types";

type RigaScadenza = {
  id: string;
  entita: "Mezzo" | "Attrezzatura" | "Personale";
  entitaNome: string;
  entitaHref: string;
  tipo: string;
  data_scadenza: string;
  stato: StatoScadenza;
};

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

export default async function DashboardPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const [
    { data: mezzi },
    { count: totaleAttrezzature },
    { count: totalePersonale },
    { data: scadenzeMezzi },
    { data: scadenzeAttrezzature },
    { data: scadenzePersonale },
  ] = await Promise.all([
    supabase.from("mezzi").select("tipo").returns<Pick<Mezzo, "tipo">[]>(),
    supabase.from("attrezzature").select("id", { count: "exact", head: true }),
    supabase.from("personale").select("id", { count: "exact", head: true }),
    supabase
      .from("scadenze_mezzi")
      .select("id, tipo, data_scadenza, completata_il, mezzo:mezzi(id, nome)")
      .is("completata_il", null)
      .returns<ScadenzaMezzoRiga[]>(),
    supabase
      .from("scadenze_attrezzature")
      .select("id, tipo, data_scadenza, completata_il, attrezzatura:attrezzature(id, nome)")
      .is("completata_il", null)
      .returns<ScadenzaAttrezzaturaRiga[]>(),
    supabase
      .from("scadenze_personale")
      .select("id, tipo, data_scadenza, completata_il, persona:personale(id, nome_completo)")
      .is("completata_il", null)
      .returns<ScadenzaPersonaleRiga[]>(),
  ]);

  const conteggioPerTipo = new Map<string, number>();
  for (const m of mezzi ?? []) {
    conteggioPerTipo.set(m.tipo, (conteggioPerTipo.get(m.tipo) ?? 0) + 1);
  }

  const righe: RigaScadenza[] = [
    ...(scadenzeMezzi ?? []).map((s) => ({
      id: s.id,
      entita: "Mezzo" as const,
      entitaNome: s.mezzo?.nome ?? "—",
      entitaHref: `/mezzi/${s.mezzo?.id}`,
      tipo: s.tipo,
      data_scadenza: s.data_scadenza,
      stato: statoScadenza(s.data_scadenza, s.completata_il),
    })),
    ...(scadenzeAttrezzature ?? []).map((s) => ({
      id: s.id,
      entita: "Attrezzatura" as const,
      entitaNome: s.attrezzatura?.nome ?? "—",
      entitaHref: `/attrezzature/${s.attrezzatura?.id}`,
      tipo: s.tipo,
      data_scadenza: s.data_scadenza,
      stato: statoScadenza(s.data_scadenza, s.completata_il),
    })),
    ...(scadenzePersonale ?? []).map((s) => ({
      id: s.id,
      entita: "Personale" as const,
      entitaNome: s.persona?.nome_completo ?? "—",
      entitaHref: `/personale/${s.persona?.id}`,
      tipo: s.tipo,
      data_scadenza: s.data_scadenza,
      stato: statoScadenza(s.data_scadenza, s.completata_il),
    })),
  ];

  const scadenzeUrgenti = righe
    .filter((r) => r.stato === "scaduta" || r.stato === "urgente")
    .sort((a, b) => a.data_scadenza.localeCompare(b.data_scadenza))
    .slice(0, 10);

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader />
      <main className="flex-1 space-y-6 bg-zinc-50 px-6 py-8 dark:bg-black">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Benvenuto, {profile.nome_completo}</h1>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">Mezzi</p>
            <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{mezzi?.length ?? 0}</p>
            <ul className="mt-3 space-y-1 text-sm text-zinc-600 dark:text-zinc-300">
              {Array.from(conteggioPerTipo.entries()).map(([tipo, n]) => (
                <li key={tipo} className="flex justify-between">
                  <span>{TIPO_MEZZO_LABELS[tipo as keyof typeof TIPO_MEZZO_LABELS]}</span>
                  <span>{n}</span>
                </li>
              ))}
              {conteggioPerTipo.size === 0 && <li className="text-zinc-400 dark:text-zinc-600">Nessun mezzo</li>}
            </ul>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">Attrezzature</p>
            <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{totaleAttrezzature ?? 0}</p>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">Personale</p>
            <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{totalePersonale ?? 0}</p>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase text-zinc-500 dark:text-zinc-400">Scadenze prossime</h2>
            <Link href="/scadenze" className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50">
              Vedi tutte →
            </Link>
          </div>

          <div className="space-y-2">
            {scadenzeUrgenti.map((r) => (
              <Link
                key={`${r.entita}-${r.id}`}
                href={r.entitaHref}
                className="flex items-center justify-between gap-4 rounded-md border border-zinc-100 px-3 py-2 hover:bg-zinc-50 dark:border-zinc-900 dark:hover:bg-zinc-900"
              >
                <div className="flex items-center gap-3">
                  <ScadenzaBadge stato={r.stato} />
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{r.entitaNome}</span>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    {TIPO_SCADENZA_LABELS[r.tipo as keyof typeof TIPO_SCADENZA_LABELS]}
                  </span>
                </div>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">{formattaData(r.data_scadenza)}</span>
              </Link>
            ))}
            {scadenzeUrgenti.length === 0 && (
              <p className="text-sm text-zinc-400 dark:text-zinc-600">Nessuna scadenza imminente. Tutto in regola.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
