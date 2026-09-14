"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import type { StatoRichiestaFerie } from "@/lib/types";

async function decidiRichiesta(id: string, stato: StatoRichiestaFerie) {
  const profile = await requireRole("admin");
  const supabase = await createClient();

  const { error } = await supabase
    .from("richieste_ferie")
    .update({ stato, gestita_da: profile.id, gestita_il: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(`Errore nell'aggiornamento della richiesta: ${error.message}`);
  revalidatePath("/ferie");
}

export async function approvaFerie(id: string) {
  await decidiRichiesta(id, "approvata");
}

export async function rifiutaFerie(id: string) {
  await decidiRichiesta(id, "rifiutata");
}
