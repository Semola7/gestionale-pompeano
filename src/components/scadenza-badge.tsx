import type { StatoScadenza } from "@/lib/date-utils";

const STILI: Record<StatoScadenza, string> = {
  scaduta: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  urgente: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  ok: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
};

const LABEL: Record<StatoScadenza, string> = {
  scaduta: "Scaduta",
  urgente: "In scadenza",
  ok: "Regolare",
};

export function ScadenzaBadge({ stato }: { stato: StatoScadenza }) {
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STILI[stato]}`}>
      {LABEL[stato]}
    </span>
  );
}
