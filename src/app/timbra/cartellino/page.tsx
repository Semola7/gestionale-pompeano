import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { DipendenteNav } from "../dipendente-nav";
import type { Presenza } from "@/lib/types";

type GiornoCartellino = {
  data: string;
  eventi: Presenza[];
  oreLavorate: number;
};

function raggruppaPerGiorno(presenze: Presenza[]): GiornoCartellino[] {
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

export default async function CartellinoPage() {
  const supabase = await createClient();

  const { data: persona } = await supabase
    .from("personale")
    .select("id, nome_completo")
    .eq("auth_user_id", (await supabase.auth.getUser()).data.user?.id ?? "")
    .single();

  const { data: presenze } = persona
    ? await supabase
        .from("presenze")
        .select("*")
        .eq("personale_id", persona.id)
        .order("timbrato_il", { ascending: false })
        .limit(200)
        .returns<Presenza[]>()
    : { data: null };

  const giorni = raggruppaPerGiorno(presenze ?? []);

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 px-4 py-10 dark:bg-black">
      <Image
        src="/lg_pmp.png"
        alt="Pompeano Antonio & Figli"
        width={480}
        height={200}
        priority
        className="mb-6 h-20 w-auto"
      />
      <h1 className="mb-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        {persona?.nome_completo ?? "Il mio cartellino"}
      </h1>

      <DipendenteNav attivo="cartellino" />

      <div className="w-full max-w-lg space-y-2">
        {giorni.map((g) => (
          <div key={g.data} className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                {new Date(g.data).toLocaleDateString("it-IT", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" })}
              </span>
              {g.oreLavorate > 0 && (
                <span className="text-sm text-zinc-500 dark:text-zinc-400">{g.oreLavorate.toFixed(1)} h</span>
              )}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-600 dark:text-zinc-300">
              {g.eventi.map((e) => (
                <span key={e.id}>
                  {e.tipo === "entrata" ? "Entrata" : "Uscita"}{" "}
                  {new Date(e.timbrato_il).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
                </span>
              ))}
            </div>
          </div>
        ))}
        {giorni.length === 0 && (
          <p className="text-center text-sm text-zinc-400 dark:text-zinc-600">Nessuna timbratura registrata.</p>
        )}
      </div>
    </div>
  );
}
