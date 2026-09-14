import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formattaData } from "@/lib/date-utils";
import { StatoFerieBadge } from "@/components/stato-ferie-badge";
import type { RichiestaFerie } from "@/lib/types";
import { approvaFerie, rifiutaFerie } from "./actions";

type RichiestaConNome = RichiestaFerie & { persona: { id: string; nome_completo: string } | null };

const FILTRI: { valore: string; label: string }[] = [
  { valore: "in_attesa", label: "In attesa" },
  { valore: "tutte", label: "Tutte" },
];

export default async function FeriePage(ctx: PageProps<"/personale/ferie">) {
  const profile = await getCurrentProfile();
  const isAdmin = profile.ruolo === "admin";

  const searchParams = await ctx.searchParams;
  const filtro = typeof searchParams.stato === "string" ? searchParams.stato : "in_attesa";

  const supabase = await createClient();
  let query = supabase
    .from("richieste_ferie")
    .select("*, persona:personale(id, nome_completo)")
    .order("creato_il", { ascending: false });
  if (filtro === "in_attesa") query = query.eq("stato", "in_attesa");

  const { data: richieste } = await query.returns<RichiestaConNome[]>();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/personale" className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50">
          ← Personale
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Ferie</h1>
        <div className="flex gap-2">
          {FILTRI.map((f) => (
            <Link
              key={f.valore}
              href={`/personale/ferie?stato=${f.valore}`}
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

      <div className="space-y-2">
        {(richieste ?? []).map((r) => (
          <div
            key={r.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {r.persona?.nome_completo ?? "—"}
                </span>
                <StatoFerieBadge stato={r.stato} />
              </div>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {formattaData(r.data_inizio)} → {formattaData(r.data_fine)}
                {r.note ? ` · ${r.note}` : ""}
              </p>
            </div>
            {isAdmin && r.stato === "in_attesa" && (
              <div className="flex gap-3 text-sm">
                <form action={approvaFerie.bind(null, r.id)}>
                  <button type="submit" className="text-emerald-600 hover:underline dark:text-emerald-400">
                    Approva
                  </button>
                </form>
                <form action={rifiutaFerie.bind(null, r.id)}>
                  <button type="submit" className="text-red-600 hover:underline dark:text-red-400">
                    Rifiuta
                  </button>
                </form>
              </div>
            )}
          </div>
        ))}
        {(richieste ?? []).length === 0 && (
          <p className="text-sm text-zinc-400 dark:text-zinc-600">Nessuna richiesta in questa vista.</p>
        )}
      </div>
    </div>
  );
}
