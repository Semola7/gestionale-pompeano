// Soglia di "urgenza" allineata al preavviso via email richiesto (20 giorni).
const GIORNI_PREAVVISO = 20;

export type StatoScadenza = "scaduta" | "urgente" | "ok" | "completata";

export function statoScadenza(dataScadenza: string, completataIl: string | null): StatoScadenza {
  if (completataIl) return "completata";

  const oggi = new Date();
  oggi.setHours(0, 0, 0, 0);
  const scadenza = new Date(dataScadenza);
  const giorni = Math.floor((scadenza.getTime() - oggi.getTime()) / (1000 * 60 * 60 * 24));

  if (giorni < 0) return "scaduta";
  if (giorni <= GIORNI_PREAVVISO) return "urgente";
  return "ok";
}

export function formattaData(data: string): string {
  return new Date(data).toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric" });
}
