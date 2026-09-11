"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formattaData, statoScadenza } from "@/lib/date-utils";
import { REGIME_POSSESSO_LABELS, TIPO_MEZZO_LABELS } from "@/lib/labels";
import type { Mezzo } from "@/lib/types";

function CellaData({ data }: { data: string | null }) {
  if (!data) return <span className="text-zinc-300 dark:text-zinc-700">—</span>;
  const stato = statoScadenza(data);
  const colore =
    stato === "scaduta"
      ? "text-red-600 dark:text-red-400"
      : stato === "urgente"
        ? "text-amber-600 dark:text-amber-400"
        : "text-zinc-600 dark:text-zinc-300";
  return <span className={colore}>{formattaData(data)}</span>;
}

export function MezziTable({ mezzi, isAdmin }: { mezzi: Mezzo[]; isAdmin: boolean }) {
  const [query, setQuery] = useState("");

  const totale = mezzi.length;
  const aNoleggioOLeasing = mezzi.filter((m) => m.regime_possesso !== "proprieta").length;
  const diProprieta = mezzi.filter((m) => m.regime_possesso === "proprieta").length;

  const mezziFiltrati = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return mezzi;
    return mezzi.filter((m) =>
      [m.nome, m.targa, m.marca, m.modello, m.assegnato_a]
        .filter(Boolean)
        .some((campo) => campo!.toLowerCase().includes(q))
    );
  }, [mezzi, query]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">Totale mezzi in flotta</p>
          <p className="mt-1 text-2xl font-semibold text-amber-600 dark:text-amber-400">{totale}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">A noleggio / leasing</p>
          <p className="mt-1 text-2xl font-semibold text-blue-600 dark:text-blue-400">{aNoleggioOLeasing}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">Di proprietà</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-600 dark:text-emerald-400">{diProprieta}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center justify-between gap-4 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Registro parco mezzi & flotta aziendale</h2>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cerca targa, marca, veicolo, assegnatario…"
            className="w-64 rounded-md border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-left text-xs uppercase text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
              <tr>
                <th className="whitespace-nowrap px-4 py-3">Veicolo & marca</th>
                <th className="whitespace-nowrap px-4 py-3">Targa / telaio</th>
                <th className="whitespace-nowrap px-4 py-3">Possesso</th>
                <th className="whitespace-nowrap px-4 py-3">Assegnato a</th>
                <th className="whitespace-nowrap px-4 py-3">Scad. assicurazione</th>
                <th className="whitespace-nowrap px-4 py-3">Scad. revisione MCTC</th>
                <th className="whitespace-nowrap px-4 py-3">Scad. bollo</th>
                <th className="whitespace-nowrap px-4 py-3">Scad. visita INAIL/ASL</th>
                <th className="whitespace-nowrap px-4 py-3">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
              {mezziFiltrati.map((m) => (
                <tr key={m.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900">
                  <td className="px-4 py-3">
                    <Link href={`/mezzi/${m.id}`} className="font-medium text-zinc-900 hover:underline dark:text-zinc-50">
                      {m.nome}
                    </Link>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      {TIPO_MEZZO_LABELS[m.tipo]}
                      {(m.marca || m.modello) && ` · ${[m.marca, m.modello].filter(Boolean).join(" ")}`}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-600 dark:text-zinc-300">
                    {m.targa ?? "—"}
                    {m.telaio && <div className="text-xs text-zinc-400 dark:text-zinc-600">{m.telaio}</div>}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-600 dark:text-zinc-300">
                    {REGIME_POSSESSO_LABELS[m.regime_possesso]}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">{m.assegnato_a ?? "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <CellaData data={m.scadenza_assicurazione} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <CellaData data={m.scadenza_revisione_mctc} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <CellaData data={m.scadenza_bollo} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <CellaData data={m.scadenza_visita_inail} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <Link href={`/mezzi/${m.id}`} className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50">
                      {isAdmin ? "Modifica" : "Dettagli"}
                    </Link>
                  </td>
                </tr>
              ))}
              {mezziFiltrati.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-zinc-400 dark:text-zinc-600">
                    {mezzi.length === 0
                      ? 'Nessun mezzo trovato nel parco veicoli. Clicca su "+ Nuovo mezzo" per registrarne uno.'
                      : "Nessun mezzo corrisponde alla ricerca."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
