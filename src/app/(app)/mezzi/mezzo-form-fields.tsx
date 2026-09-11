"use client";

import { useState } from "react";
import { Field, inputClass } from "@/components/field";
import { REGIME_POSSESSO_LABELS, TIPO_MEZZO_LABELS } from "@/lib/labels";
import type { Mezzo, RegimePossesso } from "@/lib/types";

export function MezzoFormFields({ mezzo }: { mezzo?: Mezzo }) {
  const [regime, setRegime] = useState<RegimePossesso>(mezzo?.regime_possesso ?? "proprieta");
  const isNoleggioOLeasing = regime !== "proprieta";

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold uppercase text-amber-600 dark:text-amber-400">
        Dati tecnici & identificativi
      </h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Tipo veicolo" required>
          <select name="tipo" required defaultValue={mezzo?.tipo ?? "autocarro"} className={inputClass}>
            {Object.entries(TIPO_MEZZO_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Nome / identificativo" required>
          <input
            name="nome"
            required
            defaultValue={mezzo?.nome}
            placeholder='es. "Autogru Liebherr 001"'
            className={inputClass}
          />
        </Field>
        <Field label="Targa">
          <input name="targa" defaultValue={mezzo?.targa ?? ""} className={inputClass} />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Marca">
          <input name="marca" defaultValue={mezzo?.marca ?? ""} placeholder="es. Fiat, Manitou..." className={inputClass} />
        </Field>
        <Field label="Modello">
          <input name="modello" defaultValue={mezzo?.modello ?? ""} placeholder="es. Ducato, MRT..." className={inputClass} />
        </Field>
        <Field label="N° telaio (VIN)">
          <input name="telaio" defaultValue={mezzo?.telaio ?? ""} className={inputClass} />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Anno immatricolazione">
          <input
            type="number"
            name="anno_immatricolazione"
            defaultValue={mezzo?.anno_immatricolazione ?? undefined}
            className={inputClass}
          />
        </Field>
        <Field label="Regime di possesso">
          <select
            name="regime_possesso"
            value={regime}
            onChange={(e) => setRegime(e.target.value as RegimePossesso)}
            className={inputClass}
          >
            {Object.entries(REGIME_POSSESSO_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        {isNoleggioOLeasing && (
          <Field label="Società noleggio/leasing">
            <input name="societa_noleggio" defaultValue={mezzo?.societa_noleggio ?? ""} placeholder="es. LeasePlan, Arval..." className={inputClass} />
          </Field>
        )}
      </div>

      <Field label="Personale / cantiere assegnato">
        <input
          name="assegnato_a"
          defaultValue={mezzo?.assegnato_a ?? ""}
          placeholder='es. "Capo squadra Mario Rossi" o "Cantiere Sonatrach"'
          className={inputClass}
        />
      </Field>

      <h3 className="pt-2 text-xs font-semibold uppercase text-amber-600 dark:text-amber-400">
        Scadenze legali, fiscali & assicurative
      </h3>

      {isNoleggioOLeasing && (
        <Field label="Scadenza contratto noleggio/leasing">
          <input
            type="date"
            name="scadenza_contratto_noleggio"
            defaultValue={mezzo?.scadenza_contratto_noleggio ?? ""}
            className={inputClass}
          />
        </Field>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Compagnia assicurativa">
          <input
            name="compagnia_assicurativa"
            defaultValue={mezzo?.compagnia_assicurativa ?? ""}
            placeholder="es. Generali, Unipol..."
            className={inputClass}
          />
        </Field>
        <Field label="Scadenza assicurazione">
          <input type="date" name="scadenza_assicurazione" defaultValue={mezzo?.scadenza_assicurazione ?? ""} className={inputClass} />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Scadenza revisione MCTC">
          <input type="date" name="scadenza_revisione_mctc" defaultValue={mezzo?.scadenza_revisione_mctc ?? ""} className={inputClass} />
        </Field>
        <Field label="Scadenza bollo">
          <input type="date" name="scadenza_bollo" defaultValue={mezzo?.scadenza_bollo ?? ""} className={inputClass} />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Scadenza visita INAIL/ASL (gru/piattaforme)">
          <input type="date" name="scadenza_visita_inail" defaultValue={mezzo?.scadenza_visita_inail ?? ""} className={inputClass} />
        </Field>
        <Field label="Scadenza collaudo">
          <input type="date" name="scadenza_collaudo" defaultValue={mezzo?.scadenza_collaudo ?? ""} className={inputClass} />
        </Field>
      </div>

      <Field label="Scadenza manutenzione programmata">
        <input
          type="date"
          name="scadenza_manutenzione_programmata"
          defaultValue={mezzo?.scadenza_manutenzione_programmata ?? ""}
          className={inputClass}
        />
      </Field>

      <Field label="Note / annotazioni">
        <textarea name="note" rows={3} defaultValue={mezzo?.note ?? ""} className={inputClass} />
      </Field>
    </div>
  );
}
