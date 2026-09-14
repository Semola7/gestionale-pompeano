"use client";

import { useState, useTransition } from "react";
import { Field, inputClass } from "@/components/field";
import { creaAccountDipendente, reimpostaPasswordDipendente, rimuoviAccountDipendente } from "../actions";

export function DipendenteAccount({
  personaleId,
  haAccount,
  emailAttuale,
}: {
  personaleId: string;
  haAccount: boolean;
  emailAttuale: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [errore, setErrore] = useState<string | null>(null);
  const [messaggio, setMessaggio] = useState<string | null>(null);
  const [mostraReset, setMostraReset] = useState(false);

  function handleCrea(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrore(null);
    setMessaggio(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await creaAccountDipendente(personaleId, formData);
        setMessaggio("Account creato.");
      } catch (err) {
        setErrore(err instanceof Error ? err.message : "Errore imprevisto.");
      }
    });
  }

  function handleReset(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrore(null);
    setMessaggio(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await reimpostaPasswordDipendente(personaleId, formData);
        setMessaggio("Password aggiornata.");
        setMostraReset(false);
      } catch (err) {
        setErrore(err instanceof Error ? err.message : "Errore imprevisto.");
      }
    });
  }

  function handleRimuovi() {
    if (!confirm("Rimuovere l'accesso di questo dipendente? Non potrà più timbrare finché non gli crei un nuovo account.")) {
      return;
    }
    setErrore(null);
    setMessaggio(null);
    startTransition(async () => {
      try {
        await rimuoviAccountDipendente(personaleId);
        setMessaggio("Accesso rimosso.");
      } catch (err) {
        setErrore(err instanceof Error ? err.message : "Errore imprevisto.");
      }
    });
  }

  if (haAccount) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="mb-4 text-sm font-semibold uppercase text-zinc-500 dark:text-zinc-400">Accesso timbratura</h2>
        <p className="mb-4 text-sm text-emerald-600 dark:text-emerald-400">
          Account attivo{emailAttuale ? ` (${emailAttuale})` : ""}.
        </p>

        {mostraReset ? (
          <form onSubmit={handleReset} className="flex flex-wrap items-end gap-3">
            <Field label="Nuova password">
              <input type="password" name="password" required minLength={6} className={inputClass} />
            </Field>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {isPending ? "Salvataggio…" : "Salva password"}
            </button>
            <button
              type="button"
              onClick={() => setMostraReset(false)}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              Annulla
            </button>
          </form>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => setMostraReset(true)}
              className="text-sm text-zinc-600 hover:underline dark:text-zinc-300"
            >
              Reimposta password
            </button>
            <button onClick={handleRimuovi} disabled={isPending} className="text-sm text-red-600 hover:underline dark:text-red-400">
              Rimuovi accesso
            </button>
          </div>
        )}

        {errore && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{errore}</p>}
        {messaggio && !errore && <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-400">{messaggio}</p>}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <h2 className="mb-4 text-sm font-semibold uppercase text-zinc-500 dark:text-zinc-400">Accesso timbratura</h2>
      <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
        Nessun account: questo dipendente non può ancora accedere per timbrare.
      </p>
      <form onSubmit={handleCrea} className="flex flex-wrap items-end gap-3">
        <Field label="Email">
          <input type="email" name="email" required defaultValue={emailAttuale ?? ""} className={inputClass} />
        </Field>
        <Field label="Password">
          <input type="password" name="password" required minLength={6} className={inputClass} />
        </Field>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {isPending ? "Creazione…" : "Crea account"}
        </button>
      </form>
      {errore && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{errore}</p>}
      {messaggio && !errore && <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-400">{messaggio}</p>}
    </div>
  );
}
