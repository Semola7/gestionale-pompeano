"use client";

import { useState, useTransition } from "react";
import { ScadenzaBadge } from "@/components/scadenza-badge";
import { formattaData, statoScadenza } from "@/lib/date-utils";
import { SCADENZE_ATTREZZATURE_TIPI, TIPO_SCADENZA_LABELS } from "@/lib/labels";
import { aggiornaScadenzaAttrezzatura, eliminaScadenzaAttrezzatura } from "../actions";
import type { ScadenzaAttrezzatura } from "@/lib/types";

export function ScadenzaRow({ scadenza, attrezzaturaId }: { scadenza: ScadenzaAttrezzatura; attrezzaturaId: string }) {
  const [inModifica, setInModifica] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errore, setErrore] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrore(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await aggiornaScadenzaAttrezzatura(scadenza.id, attrezzaturaId, formData);
        setInModifica(false);
      } catch (err) {
        setErrore(err instanceof Error ? err.message : "Errore imprevisto.");
      }
    });
  }

  if (inModifica) {
    return (
      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3 rounded-md border border-zinc-200 px-3 py-2 dark:border-zinc-800">
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">Tipo</label>
          <select
            name="tipo"
            required
            defaultValue={scadenza.tipo}
            className="rounded-md border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            {SCADENZE_ATTREZZATURE_TIPI.map((tipo) => (
              <option key={tipo} value={tipo}>
                {TIPO_SCADENZA_LABELS[tipo]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">Data scadenza</label>
          <input
            type="date"
            name="data_scadenza"
            required
            defaultValue={scadenza.data_scadenza}
            className="rounded-md border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">Descrizione</label>
          <input
            name="descrizione"
            defaultValue={scadenza.descrizione ?? ""}
            className="w-full rounded-md border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
        {errore && <p className="w-full text-sm text-red-600 dark:text-red-400">{errore}</p>}
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {isPending ? "Salvataggio…" : "Salva"}
        </button>
        <button
          type="button"
          onClick={() => setInModifica(false)}
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
        >
          Annulla
        </button>
      </form>
    );
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-zinc-100 px-3 py-2 dark:border-zinc-900">
      <div className="flex items-center gap-3">
        <ScadenzaBadge stato={statoScadenza(scadenza.data_scadenza)} />
        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{TIPO_SCADENZA_LABELS[scadenza.tipo]}</span>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">{formattaData(scadenza.data_scadenza)}</span>
        {scadenza.descrizione && <span className="text-sm text-zinc-400 dark:text-zinc-600">{scadenza.descrizione}</span>}
      </div>
      <div className="flex items-center gap-3 text-sm">
        <button onClick={() => setInModifica(true)} className="text-zinc-600 hover:underline dark:text-zinc-300">
          Modifica
        </button>
        <form action={eliminaScadenzaAttrezzatura.bind(null, scadenza.id, attrezzaturaId)}>
          <button type="submit" className="text-red-600 hover:underline dark:text-red-400">
            Elimina
          </button>
        </form>
      </div>
    </div>
  );
}
