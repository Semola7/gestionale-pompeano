"use client";

import { useRef, useState, useTransition } from "react";
import { creaMezzo } from "./actions";
import { MezzoFormFields } from "./mezzo-form-fields";

export function NuovoMezzoModal() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errore, setErrore] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function chiudi() {
    setOpen(false);
    setErrore(null);
    formRef.current?.reset();
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrore(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await creaMezzo(formData);
        chiudi();
      } catch (err) {
        setErrore(err instanceof Error ? err.message : "Errore imprevisto.");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md bg-amber-600 px-3 py-2 text-sm font-medium text-white hover:bg-amber-700"
      >
        + Nuovo mezzo
      </button>

      {open && (
        <div
          className="fixed inset-0 z-30 flex items-start justify-center overflow-y-auto bg-black/40 p-4 py-10"
          onClick={chiudi}
        >
          <div
            className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-950"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Registra nuovo veicolo / mezzo</h2>
              <button
                type="button"
                onClick={chiudi}
                aria-label="Chiudi"
                className="text-xl leading-none text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
              >
                ×
              </button>
            </div>

            <form ref={formRef} onSubmit={handleSubmit}>
              <MezzoFormFields />

              {errore && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{errore}</p>}

              <div className="mt-6 flex justify-end gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-900">
                <button
                  type="button"
                  onClick={chiudi}
                  className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
                >
                  {isPending ? "Salvataggio…" : "Salva mezzo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
