"use client";

import { useState } from "react";
import { Field, inputClass } from "@/components/field";
import { TIPO_CONTRATTO_LABELS } from "@/lib/labels";
import type { Personale, TipoContratto } from "@/lib/types";

export function PersonaleFormFields({ persona }: { persona?: Personale }) {
  const [tipoContratto, setTipoContratto] = useState<TipoContratto>(persona?.tipo_contratto ?? "indeterminato");
  const isDeterminato = tipoContratto === "determinato";

  return (
    <div className="space-y-4">
      <Field label="Nome e cognome" required>
        <input name="nome_completo" required defaultValue={persona?.nome_completo} className={inputClass} />
      </Field>

      <Field label="Mansione">
        <input
          name="mansione"
          defaultValue={persona?.mansione ?? ""}
          placeholder="es. Capo squadra, Gruista, Autista, Operaio..."
          className={inputClass}
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Data di nascita">
          <input type="date" name="data_nascita" defaultValue={persona?.data_nascita ?? ""} className={inputClass} />
        </Field>
        <Field label="Codice fiscale">
          <input
            name="codice_fiscale"
            defaultValue={persona?.codice_fiscale ?? ""}
            maxLength={16}
            className={`${inputClass} uppercase`}
          />
        </Field>
      </div>

      <Field label="Indirizzo di residenza">
        <input name="indirizzo_residenza" defaultValue={persona?.indirizzo_residenza ?? ""} className={inputClass} />
      </Field>

      <h3 className="pt-2 text-xs font-semibold uppercase text-amber-600 dark:text-amber-400">Contratto</h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Tipo di contratto">
          <select
            name="tipo_contratto"
            value={tipoContratto}
            onChange={(e) => setTipoContratto(e.target.value as TipoContratto)}
            className={inputClass}
          >
            {Object.entries(TIPO_CONTRATTO_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Data assunzione">
          <input type="date" name="data_assunzione" defaultValue={persona?.data_assunzione ?? ""} className={inputClass} />
        </Field>
      </div>

      {isDeterminato && (
        <Field label="Scadenza contratto">
          <input type="date" name="scadenza_contratto" defaultValue={persona?.scadenza_contratto ?? ""} className={inputClass} />
        </Field>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Telefono">
          <input name="telefono" defaultValue={persona?.telefono ?? ""} className={inputClass} />
        </Field>
        <Field label="Email">
          <input type="email" name="email" defaultValue={persona?.email ?? ""} className={inputClass} />
        </Field>
      </div>

      <Field label="Note">
        <textarea name="note" rows={3} defaultValue={persona?.note ?? ""} className={inputClass} />
      </Field>
    </div>
  );
}
