import type { Presenza } from "@/lib/types";

export type GiornoCartellino = {
  data: string;
  eventi: Presenza[];
  oreLavorate: number;
};

export function raggruppaPerGiorno(presenze: Presenza[]): GiornoCartellino[] {
  const perGiorno = new Map<string, Presenza[]>();

  for (const p of presenze) {
    const chiave = p.timbrato_il.slice(0, 10);
    const lista = perGiorno.get(chiave) ?? [];
    lista.push(p);
    perGiorno.set(chiave, lista);
  }

  const giorni: GiornoCartellino[] = [];
  for (const [data, eventi] of perGiorno.entries()) {
    eventi.sort((a, b) => a.timbrato_il.localeCompare(b.timbrato_il));

    let oreLavorate = 0;
    let inizioTurno: string | null = null;
    for (const e of eventi) {
      if (e.tipo === "entrata") {
        inizioTurno = e.timbrato_il;
      } else if (e.tipo === "uscita" && inizioTurno) {
        oreLavorate += (new Date(e.timbrato_il).getTime() - new Date(inizioTurno).getTime()) / 3600000;
        inizioTurno = null;
      }
    }

    giorni.push({ data, eventi, oreLavorate });
  }

  return giorni.sort((a, b) => b.data.localeCompare(a.data));
}
