export type RuoloUtente = "admin" | "operatore";

export interface Profile {
  id: string;
  ruolo: RuoloUtente;
  nome_completo: string;
}
