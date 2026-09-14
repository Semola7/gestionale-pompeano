"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { entroSede } from "@/lib/geo";
import type { TipoPresenza } from "@/lib/types";

export async function registraPresenza(tipo: TipoPresenza, lat: number, lng: number) {
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

  if (!entroSede(lat, lng)) {
    throw new Error("Non risulti nei pressi dello stabilimento: la timbratura è consentita solo sul posto di lavoro.");
  }

  const { error } = await supabase.from("presenze").insert({
    personale_id: persona.id,
    tipo,
  });

  if (error) throw new Error(`Errore nella registrazione: ${error.message}`);

  revalidatePath("/timbra");
}
