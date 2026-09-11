import { MEZZO_SCADENZA_FIELDS, TIPO_SCADENZA_LABELS } from "@/lib/labels";
import { statoScadenza, type StatoScadenza } from "@/lib/date-utils";
import type { createClient } from "@/lib/supabase/server";
import type { Mezzo } from "@/lib/types";

export type RigaScadenza = {
  id: string;
  entita: "Mezzo" | "Attrezzatura" | "Personale";
  entitaNome: string;
  entitaHref: string;
  tipoLabel: string;
  data_scadenza: string;
  stato: StatoScadenza;
};

type ScadenzaAttrezzaturaRiga = {
  id: string;
  tipo: string;
  data_scadenza: string;
  attrezzatura: { id: string; nome: string } | null;
};

type ScadenzaPersonaleRiga = {
  id: string;
  tipo: string;
  data_scadenza: string;
  persona: { id: string; nome_completo: string } | null;
};

type PersonaleContrattoRiga = {
  id: string;
  nome_completo: string;
  tipo_contratto: string;
  scadenza_contratto: string | null;
};

export async function fetchScadenzeAggregate(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<RigaScadenza[]> {
  const [{ data: mezzi }, { data: scadenzeAttrezzature }, { data: scadenzePersonale }, { data: personale }] =
    await Promise.all([
      supabase.from("mezzi").select("*").returns<Mezzo[]>(),
      supabase
        .from("scadenze_attrezzature")
        .select("id, tipo, data_scadenza, attrezzatura:attrezzature(id, nome)")
        .returns<ScadenzaAttrezzaturaRiga[]>(),
      supabase
        .from("scadenze_personale")
        .select("id, tipo, data_scadenza, persona:personale(id, nome_completo)")
        .returns<ScadenzaPersonaleRiga[]>(),
      supabase
        .from("personale")
        .select("id, nome_completo, tipo_contratto, scadenza_contratto")
        .eq("tipo_contratto", "determinato")
        .not("scadenza_contratto", "is", null)
        .returns<PersonaleContrattoRiga[]>(),
    ]);

  const righeMezzi: RigaScadenza[] = (mezzi ?? []).flatMap((m) =>
    MEZZO_SCADENZA_FIELDS.filter((f) => m[f.key]).map((f) => ({
      id: `${m.id}-${f.key}`,
      entita: "Mezzo" as const,
      entitaNome: m.nome,
      entitaHref: `/mezzi/${m.id}`,
      tipoLabel: f.label,
      data_scadenza: m[f.key] as string,
      stato: statoScadenza(m[f.key] as string),
    }))
  );

  const righeAttrezzature: RigaScadenza[] = (scadenzeAttrezzature ?? []).map((s) => ({
    id: s.id,
    entita: "Attrezzatura" as const,
    entitaNome: s.attrezzatura?.nome ?? "—",
    entitaHref: `/attrezzature/${s.attrezzatura?.id}`,
    tipoLabel: TIPO_SCADENZA_LABELS[s.tipo as keyof typeof TIPO_SCADENZA_LABELS] ?? s.tipo,
    data_scadenza: s.data_scadenza,
    stato: statoScadenza(s.data_scadenza),
  }));

  const righePersonale: RigaScadenza[] = (scadenzePersonale ?? []).map((s) => ({
    id: s.id,
    entita: "Personale" as const,
    entitaNome: s.persona?.nome_completo ?? "—",
    entitaHref: `/personale/${s.persona?.id}`,
    tipoLabel: TIPO_SCADENZA_LABELS[s.tipo as keyof typeof TIPO_SCADENZA_LABELS] ?? s.tipo,
    data_scadenza: s.data_scadenza,
    stato: statoScadenza(s.data_scadenza),
  }));

  const righeContrattiPersonale: RigaScadenza[] = (personale ?? []).map((p) => ({
    id: `${p.id}-scadenza_contratto`,
    entita: "Personale" as const,
    entitaNome: p.nome_completo,
    entitaHref: `/personale/${p.id}`,
    tipoLabel: "Scadenza contratto",
    data_scadenza: p.scadenza_contratto as string,
    stato: statoScadenza(p.scadenza_contratto as string),
  }));

  return [...righeMezzi, ...righeAttrezzature, ...righePersonale, ...righeContrattiPersonale];
}
