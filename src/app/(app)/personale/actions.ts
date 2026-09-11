"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import type { TipoScadenza } from "@/lib/types";

export async function creaPersonale(formData: FormData) {
  await requireRole("admin");
  const supabase = await createClient();

  const nomeCompleto = String(formData.get("nome_completo") ?? "").trim();
  if (!nomeCompleto) throw new Error("Il nominativo è obbligatorio.");

  const { data, error } = await supabase
    .from("personale")
    .insert({
      nome_completo: nomeCompleto,
      mansione: String(formData.get("mansione") ?? "").trim() || null,
      telefono: String(formData.get("telefono") ?? "").trim() || null,
      email: String(formData.get("email") ?? "").trim() || null,
      note: String(formData.get("note") ?? "").trim() || null,
    })
    .select("id")
    .single();

  if (error || !data) throw new Error(`Errore nel salvataggio del nominativo: ${error?.message}`);

  revalidatePath("/personale");
  redirect(`/personale/${data.id}`);
}

export async function eliminaPersonale(id: string) {
  await requireRole("admin");
  const supabase = await createClient();
  await supabase.from("personale").delete().eq("id", id);
  revalidatePath("/personale");
  redirect("/personale");
}

export async function aggiungiScadenzaPersonale(formData: FormData) {
  await requireRole("admin");
  const supabase = await createClient();

  const personaleId = String(formData.get("personale_id") ?? "");
  const tipo = String(formData.get("tipo") ?? "") as TipoScadenza;
  const dataScadenza = String(formData.get("data_scadenza") ?? "");
  if (!personaleId || !tipo || !dataScadenza) throw new Error("Tipo e data scadenza sono obbligatori.");

  const { error } = await supabase.from("scadenze_personale").insert({
    personale_id: personaleId,
    tipo,
    data_scadenza: dataScadenza,
    descrizione: String(formData.get("descrizione") ?? "").trim() || null,
  });

  if (error) throw new Error(`Errore nel salvataggio della scadenza: ${error.message}`);
  revalidatePath(`/personale/${personaleId}`);
}

export async function aggiornaScadenzaPersonale(id: string, personaleId: string, formData: FormData) {
  await requireRole("admin");
  const supabase = await createClient();

  const tipo = String(formData.get("tipo") ?? "") as TipoScadenza;
  const dataScadenza = String(formData.get("data_scadenza") ?? "");
  if (!tipo || !dataScadenza) throw new Error("Tipo e data scadenza sono obbligatori.");

  const { error } = await supabase
    .from("scadenze_personale")
    .update({
      tipo,
      data_scadenza: dataScadenza,
      descrizione: String(formData.get("descrizione") ?? "").trim() || null,
    })
    .eq("id", id);

  if (error) throw new Error(`Errore nell'aggiornamento della scadenza: ${error.message}`);
  revalidatePath(`/personale/${personaleId}`);
  revalidatePath("/scadenze");
}

export async function eliminaScadenzaPersonale(id: string, personaleId: string) {
  await requireRole("admin");
  const supabase = await createClient();
  await supabase.from("scadenze_personale").delete().eq("id", id);
  revalidatePath(`/personale/${personaleId}`);
}
