"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { TipoPresenza } from "@/lib/types";

export async function registraPresenza(personaleId: string, tipo: TipoPresenza) {
  const supabase = await createClient();

  const { error } = await supabase.from("presenze").insert({
    personale_id: personaleId,
    tipo,
  });

  if (error) throw new Error(`Errore nella registrazione: ${error.message}`);

  revalidatePath("/timbra");
}
