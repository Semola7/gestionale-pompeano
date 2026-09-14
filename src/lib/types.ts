export type RuoloUtente = "admin" | "operatore" | "dipendente";

export interface Profile {
  id: string;
  ruolo: RuoloUtente;
  nome_completo: string;
}

export type TipoMezzo =
  | "autocarro"
  | "auto"
  | "gru"
  | "autogru"
  | "piattaforma_aerea"
  | "camion"
  | "camion_gruato"
  | "rimorchio";

export type TipoAttrezzatura = "catena" | "fune" | "gancio" | "altro";

export type TipoScadenza =
  | "revisione"
  | "verifica_periodica_inail"
  | "collaudo"
  | "assicurazione"
  | "manutenzione_programmata"
  | "verifica_periodica"
  | "patente"
  | "patentino_gru"
  | "patentino_carrelli"
  | "patentino_ple"
  | "visita_medica"
  | "corso_sicurezza"
  | "dpi"
  | "altro";

export type RegimePossesso = "proprieta" | "noleggio" | "leasing";

export interface Mezzo {
  id: string;
  tipo: TipoMezzo;
  nome: string;
  targa: string | null;
  telaio: string | null;
  marca: string | null;
  modello: string | null;
  anno_immatricolazione: number | null;
  regime_possesso: RegimePossesso;
  societa_noleggio: string | null;
  assegnato_a: string | null;
  compagnia_assicurativa: string | null;
  scadenza_assicurazione: string | null;
  scadenza_revisione_mctc: string | null;
  scadenza_bollo: string | null;
  scadenza_visita_inail: string | null;
  scadenza_collaudo: string | null;
  scadenza_manutenzione_programmata: string | null;
  scadenza_contratto_noleggio: string | null;
  note: string | null;
  attivo: boolean;
  creato_il: string;
}

export interface Attrezzatura {
  id: string;
  tipo: TipoAttrezzatura;
  nome: string;
  matricola: string | null;
  note: string | null;
  attiva: boolean;
  creato_il: string;
}

export type TipoContratto = "determinato" | "indeterminato";

export interface Personale {
  id: string;
  nome_completo: string;
  mansione: string | null;
  data_nascita: string | null;
  codice_fiscale: string | null;
  indirizzo_residenza: string | null;
  tipo_contratto: TipoContratto;
  data_assunzione: string | null;
  scadenza_contratto: string | null;
  telefono: string | null;
  email: string | null;
  note: string | null;
  attivo: boolean;
  auth_user_id: string | null;
  dispositivo_id: string | null;
  creato_il: string;
}

export interface ScadenzaAttrezzatura {
  id: string;
  attrezzatura_id: string;
  tipo: TipoScadenza;
  descrizione: string | null;
  data_scadenza: string;
  note: string | null;
  creato_il: string;
}

export interface ScadenzaPersonale {
  id: string;
  personale_id: string;
  tipo: TipoScadenza;
  descrizione: string | null;
  data_scadenza: string;
  note: string | null;
  creato_il: string;
}

export type TipoPresenza = "entrata" | "uscita";

export interface Presenza {
  id: string;
  personale_id: string;
  tipo: TipoPresenza;
  timbrato_il: string;
}

export interface DocumentoMezzo {
  id: string;
  mezzo_id: string;
  nome_file: string;
  storage_path: string;
  dimensione_byte: number | null;
  creato_il: string;
}
