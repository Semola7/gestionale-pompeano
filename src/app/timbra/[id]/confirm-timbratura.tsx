"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { registraPresenza } from "../actions";
import type { TipoPresenza } from "@/lib/types";

export function ConfirmTimbratura({ personaleId, nome }: { personaleId: string; nome: string }) {
  const [isPending, startTransition] = useTransition();
  const [esito, setEsito] = useState<TipoPresenza | null>(null);
  const [errore, setErrore] = useState<string | null>(null);

  function segna(tipo: TipoPresenza) {
    setErrore(null);
    startTransition(async () => {
      try {
        await registraPresenza(personaleId, tipo);
        setEsito(tipo);
      } catch (e) {
        setErrore(e instanceof Error ? e.message : "Errore imprevisto.");
      }
    });
  }

  if (esito) {
    return (
      <div className="text-center">
        <p className="mb-2 text-lg font-semibold text-emerald-600 dark:text-emerald-400">
          {esito === "entrata" ? "Entrata registrata" : "Uscita registrata"}
        </p>
        <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">{nome}</p>
        <Link
          href="/timbra"
          className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          ← Torna all&apos;elenco
        </Link>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <button
        onClick={() => segna("entrata")}
        disabled={isPending}
        className="rounded-xl bg-emerald-600 px-4 py-4 text-lg font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
      >
        Segna entrata
      </button>
      <button
        onClick={() => segna("uscita")}
        disabled={isPending}
        className="rounded-xl bg-amber-600 px-4 py-4 text-lg font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
      >
        Segna uscita
      </button>
      {errore && <p className="text-center text-sm text-red-600 dark:text-red-400">{errore}</p>}
      <Link
        href="/timbra"
        className="mt-2 text-center text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
      >
        ← Non sono io
      </Link>
    </div>
  );
}
