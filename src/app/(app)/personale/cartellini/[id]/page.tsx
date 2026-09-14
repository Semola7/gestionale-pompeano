import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { raggruppaPerGiorno } from "@/lib/cartellino";
import type { Personale, Presenza } from "@/lib/types";

export default async function CartellinoDipendentePage(ctx: PageProps<"/personale/cartellini/[id]">) {
  const { id } = await ctx.params;
  const supabase = await createClient();

  const { data: persona } = await supabase
    .from("personale")
    .select("id, nome_completo")
    .eq("id", id)
    .single<Pick<Personale, "id" | "nome_completo">>();
  if (!persona) notFound();

  const { data: presenze } = await supabase
    .from("presenze")
    .select("*")
    .eq("personale_id", id)
    .order("timbrato_il", { ascending: false })
    .limit(300)
    .returns<Presenza[]>();

  const giorni = raggruppaPerGiorno(presenze ?? []);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/personale/cartellini"
          className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          ← Cartellini
        </Link>
      </div>

      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">{persona.nome_completo}</h1>

      <div className="space-y-2">
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
          <p className="text-sm text-zinc-400 dark:text-zinc-600">Nessuna timbratura registrata.</p>
        )}
      </div>
    </div>
  );
}
