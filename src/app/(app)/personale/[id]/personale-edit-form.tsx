"use client";

import { useState, useTransition } from "react";
import { aggiornaPersonale } from "../actions";
import { PersonaleFormFields } from "../personale-form-fields";
import type { Personale } from "@/lib/types";

export function PersonaleEditForm({ persona }: { persona: Personale }) {
  const [isPending, startTransition] = useTransition();
  const [errore, setErrore] = useState<string | null>(null);
  const [salvato, setSalvato] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrore(null);
    setSalvato(false);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await aggiornaPersonale(persona.id, formData);
        setSalvato(true);
      } catch (err) {
        setErrore(err instanceof Error ? err.message : "Errore imprevisto.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <PersonaleFormFields persona={persona} />

      {errore && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{errore}</p>}
      {salvato && !errore && <p className="mt-4 text-sm text-emerald-600 dark:text-emerald-400">Modifiche salvate.</p>}

      <div className="mt-6 flex justify-end border-t border-zinc-100 pt-4 dark:border-zinc-900">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {isPending ? "Salvataggio…" : "Salva modifiche"}
        </button>
      </div>
    </form>
  );
}
