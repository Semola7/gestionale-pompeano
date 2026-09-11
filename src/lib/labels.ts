import type { Mezzo, RegimePossesso, TipoAttrezzatura, TipoMezzo, TipoScadenza } from "@/lib/types";

export const TIPO_MEZZO_LABELS: Record<TipoMezzo, string> = {
  autocarro: "Autocarro",
  auto: "Auto",
  gru: "Gru",
  autogru: "Autogru",
  piattaforma_aerea: "Piattaforma aerea",
  camion: "Camion",
  camion_gruato: "Camion gruato",
  rimorchio: "Rimorchio",
};

export const REGIME_POSSESSO_LABELS: Record<RegimePossesso, string> = {
  proprieta: "Proprietà",
  noleggio: "Noleggio",
  leasing: "Leasing",
};

// Le scadenze dei mezzi sono colonne dirette su `mezzi` (una sola data per
// tipo, aggiornata quando viene rinnovata), non righe di uno storico.
export const MEZZO_SCADENZA_FIELDS: { key: keyof Mezzo; label: string }[] = [
  { key: "scadenza_assicurazione", label: "Assicurazione" },
  { key: "scadenza_revisione_mctc", label: "Revisione MCTC" },
  { key: "scadenza_bollo", label: "Bollo" },
  { key: "scadenza_visita_inail", label: "Visita INAIL/ASL" },
  { key: "scadenza_collaudo", label: "Collaudo" },
  { key: "scadenza_manutenzione_programmata", label: "Manutenzione programmata" },
  { key: "scadenza_contratto_noleggio", label: "Contratto noleggio/leasing" },
];

export const TIPO_ATTREZZATURA_LABELS: Record<TipoAttrezzatura, string> = {
  catena: "Catena",
  fune: "Fune",
  gancio: "Gancio",
  altro: "Altro",
};

export const TIPO_SCADENZA_LABELS: Record<TipoScadenza, string> = {
  revisione: "Revisione",
  verifica_periodica_inail: "Verifica periodica INAIL",
  collaudo: "Collaudo",
  assicurazione: "Assicurazione",
  manutenzione_programmata: "Manutenzione programmata",
  verifica_periodica: "Verifica periodica",
  patente: "Patente",
  patentino_gru: "Patentino gru",
  patentino_carrelli: "Patentino carrelli",
  patentino_ple: "Patentino PLE",
  visita_medica: "Visita medica",
  corso_sicurezza: "Corso sicurezza/formazione",
  dpi: "DPI",
  altro: "Altro",
};

export const SCADENZE_ATTREZZATURE_TIPI: TipoScadenza[] = ["verifica_periodica", "altro"];

export const SCADENZE_PERSONALE_TIPI: TipoScadenza[] = [
  "patente",
  "patentino_gru",
  "patentino_carrelli",
  "patentino_ple",
  "visita_medica",
  "corso_sicurezza",
  "dpi",
  "altro",
];
