import Link from "next/link";
import { ScadenzaBadge } from "@/components/scadenza-badge";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formattaData } from "@/lib/date-utils";
import { TIPO_MEZZO_LABELS } from "@/lib/labels";
import { fetchScadenzeAggregate } from "@/lib/scadenze-aggregate";
import type { Mezzo } from "@/lib/types";

type PresenzaRiga = {
  personale_id: string;
  tipo: "entrata" | "uscita";
  timbrato_il: string;
  persona: { nome_completo: string } | null;
};

export default async function DashboardPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const inizioGiorno = new Date();
  inizioGiorno.setHours(0, 0, 0, 0);

  const [{ data: mezzi }, { count: totaleAttrezzature }, { count: totalePersonale }, { data: presenzeOggi }, righeScadenze] =
    await Promise.all([
      supabase.from("mezzi").select("tipo").returns<Pick<Mezzo, "tipo">[]>(),
      supabase.from("attrezzature").select("id", { count: "exact", head: true }),
      supabase.from("personale").select("id", { count: "exact", head: true }),
      supabase
        .from("presenze")
        .select("personale_id, tipo, timbrato_il, persona:personale(nome_completo)")
        .gte("timbrato_il", inizioGiorno.toISOString())
        .order("timbrato_il", { ascending: true })
        .returns<PresenzaRiga[]>(),
      fetchScadenzeAggregate(supabase),
    ]);

  const ultimoEventoPerPersona = new Map<string, PresenzaRiga>();
  for (const p of presenzeOggi ?? []) {
    ultimoEventoPerPersona.set(p.personale_id, p);
  }
  const presentiOggi = Array.from(ultimoEventoPerPersona.values())
    .filter((p) => p.tipo === "entrata")
    .sort((a, b) => a.timbrato_il.localeCompare(b.timbrato_il));

  const conteggioPerTipo = new Map<string, number>();
  for (const m of mezzi ?? []) {
    conteggioPerTipo.set(m.tipo, (conteggioPerTipo.get(m.tipo) ?? 0) + 1);
  }

  const scadenzeUrgenti = righeScadenze
    .filter((r) => r.stato === "scaduta" || r.stato === "urgente")
    .sort((a, b) => a.data_scadenza.localeCompare(b.data_scadenza))
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Benvenuto, {profile.nome_completo}</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          href="/mezzi"
          className="rounded-xl border border-zinc-200 bg-white p-5 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
        >
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
        </Link>

        <Link
          href="/attrezzature"
          className="rounded-xl border border-zinc-200 bg-white p-5 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
        >
          <p className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">Attrezzature</p>
          <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{totaleAttrezzature ?? 0}</p>
        </Link>

        <Link
          href="/personale"
          className="rounded-xl border border-zinc-200 bg-white p-5 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
        >
          <p className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">Personale presente oggi</p>
          <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            {presentiOggi.length} <span className="text-base font-normal text-zinc-400 dark:text-zinc-600">/ {totalePersonale ?? 0}</span>
          </p>
        </Link>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="mb-4 text-sm font-semibold uppercase text-zinc-500 dark:text-zinc-400">Presenti oggi</h2>
        <div className="space-y-2">
          {presentiOggi.map((p) => (
            <div
              key={p.personale_id}
              className="flex items-center justify-between gap-4 rounded-md border border-zinc-100 px-3 py-2 dark:border-zinc-900"
            >
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                {p.persona?.nome_completo ?? "—"}
              </span>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                dalle {new Date(p.timbrato_il).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          ))}
          {presentiOggi.length === 0 && (
            <p className="text-sm text-zinc-400 dark:text-zinc-600">Nessuna timbratura di entrata oggi.</p>
          )}
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
                <span className="text-sm text-zinc-500 dark:text-zinc-400">{r.tipoLabel}</span>
              </div>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">{formattaData(r.data_scadenza)}</span>
            </Link>
          ))}
          {scadenzeUrgenti.length === 0 && (
            <p className="text-sm text-zinc-400 dark:text-zinc-600">Nessuna scadenza imminente. Tutto in regola.</p>
          )}
        </div>
      </div>
    </div>
  );
}
