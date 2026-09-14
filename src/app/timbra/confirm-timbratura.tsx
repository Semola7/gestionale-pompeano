"use client";

import { useState, useTransition } from "react";
import { registraPresenza } from "./actions";
import { LogoutButton } from "@/components/logout-button";
import type { TipoPresenza } from "@/lib/types";

export function ConfirmTimbratura({ ultimoStato }: { ultimoStato: TipoPresenza | null }) {
  const [isPending, startTransition] = useTransition();
  const [errore, setErrore] = useState<string | null>(null);
  const [esito, setEsito] = useState<TipoPresenza | null>(null);

  const prossimoTipo: TipoPresenza = ultimoStato === "entrata" ? "uscita" : "entrata";

  function segna(tipo: TipoPresenza) {
    setErrore(null);

    if (!("geolocation" in navigator)) {
      setErrore("Il browser non supporta la geolocalizzazione: impossibile timbrare.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        startTransition(async () => {
          try {
            await registraPresenza(tipo, position.coords.latitude, position.coords.longitude);
            setEsito(tipo);
          } catch (err) {
            setErrore(err instanceof Error ? err.message : "Errore imprevisto.");
          }
        });
      },
      () => {
        setErrore("Devi consentire l'accesso alla posizione per poter timbrare.");
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }

  if (esito) {
    return (
      <div className="text-center">
        <p className="mb-6 text-lg font-semibold text-emerald-600 dark:text-emerald-400">
          {esito === "entrata" ? "Entrata registrata" : "Uscita registrata"}
        </p>
        <LogoutButton />
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <button
        onClick={() => segna(prossimoTipo)}
        disabled={isPending}
        className={`rounded-xl px-4 py-6 text-lg font-semibold text-white disabled:opacity-50 ${
          prossimoTipo === "entrata" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-amber-600 hover:bg-amber-700"
        }`}
      >
        {isPending ? "Verifica posizione…" : prossimoTipo === "entrata" ? "Segna entrata" : "Segna uscita"}
      </button>
      {errore && <p className="text-center text-sm text-red-600 dark:text-red-400">{errore}</p>}
      <div className="mt-2 flex justify-center">
        <LogoutButton />
      </div>
    </div>
  );
}
