"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function richiediFerie(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sessione scaduta. Effettua di nuovo l'accesso.");

  const { data: persona } = await supabase
    .from("personale")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();
  if (!persona) throw new Error("Il tuo account non è collegato a nessun nominativo. Contatta l'amministratore.");

  const dataInizio = String(formData.get("data_inizio") ?? "");
  const dataFine = String(formData.get("data_fine") ?? "");
  if (!dataInizio || !dataFine) throw new Error("Le date di inizio e fine sono obbligatorie.");
  if (dataFine < dataInizio) throw new Error("La data di fine non può precedere quella di inizio.");

  const { error } = await supabase.from("richieste_ferie").insert({
    personale_id: persona.id,
    data_inizio: dataInizio,
    data_fine: dataFine,
    note: String(formData.get("note") ?? "").trim() || null,
  });

  if (error) throw new Error(`Errore nell'invio della richiesta: ${error.message}`);

  revalidatePath("/timbra/ferie");
}
