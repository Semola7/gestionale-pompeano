import { STATO_FERIE_LABELS } from "@/lib/labels";
import type { StatoRichiestaFerie } from "@/lib/types";

const STILI: Record<StatoRichiestaFerie, string> = {
  in_attesa: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  approvata: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  rifiutata: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
};

export function StatoFerieBadge({ stato }: { stato: StatoRichiestaFerie }) {
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STILI[stato]}`}>
      {STATO_FERIE_LABELS[stato]}
    </span>
  );
}
