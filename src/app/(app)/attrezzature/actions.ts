"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import type { TipoAttrezzatura, TipoScadenza } from "@/lib/types";

export async function creaAttrezzatura(formData: FormData) {
  await requireRole("admin");
  const supabase = await createClient();

  const nome = String(formData.get("nome") ?? "").trim();
  const tipo = String(formData.get("tipo") ?? "") as TipoAttrezzatura;
  if (!nome) throw new Error("Il nome dell'attrezzatura è obbligatorio.");

  const { data, error } = await supabase
    .from("attrezzature")
    .insert({
      nome,
      tipo,
      matricola: String(formData.get("matricola") ?? "").trim() || null,
      note: String(formData.get("note") ?? "").trim() || null,
    })
    .select("id")
    .single();

  if (error || !data) throw new Error(`Errore nel salvataggio dell'attrezzatura: ${error?.message}`);

  revalidatePath("/attrezzature");
  redirect(`/attrezzature/${data.id}`);
}

export async function eliminaAttrezzatura(id: string) {
  await requireRole("admin");
  const supabase = await createClient();
  await supabase.from("attrezzature").delete().eq("id", id);
  revalidatePath("/attrezzature");
  redirect("/attrezzature");
}

export async function aggiungiScadenzaAttrezzatura(formData: FormData) {
  await requireRole("admin");
  const supabase = await createClient();

  const attrezzaturaId = String(formData.get("attrezzatura_id") ?? "");
  const tipo = String(formData.get("tipo") ?? "") as TipoScadenza;
  const dataScadenza = String(formData.get("data_scadenza") ?? "");
  if (!attrezzaturaId || !tipo || !dataScadenza) throw new Error("Tipo e data scadenza sono obbligatori.");

  const { error } = await supabase.from("scadenze_attrezzature").insert({
    attrezzatura_id: attrezzaturaId,
    tipo,
    data_scadenza: dataScadenza,
    descrizione: String(formData.get("descrizione") ?? "").trim() || null,
  });

  if (error) throw new Error(`Errore nel salvataggio della scadenza: ${error.message}`);
  revalidatePath(`/attrezzature/${attrezzaturaId}`);
}

export async function aggiornaScadenzaAttrezzatura(id: string, attrezzaturaId: string, formData: FormData) {
  await requireRole("admin");
  const supabase = await createClient();

  const tipo = String(formData.get("tipo") ?? "") as TipoScadenza;
  const dataScadenza = String(formData.get("data_scadenza") ?? "");
  if (!tipo || !dataScadenza) throw new Error("Tipo e data scadenza sono obbligatori.");

  const { error } = await supabase
    .from("scadenze_attrezzature")
    .update({
      tipo,
      data_scadenza: dataScadenza,
      descrizione: String(formData.get("descrizione") ?? "").trim() || null,
    })
    .eq("id", id);

  if (error) throw new Error(`Errore nell'aggiornamento della scadenza: ${error.message}`);
  revalidatePath(`/attrezzature/${attrezzaturaId}`);
  revalidatePath("/scadenze");
}

export async function eliminaScadenzaAttrezzatura(id: string, attrezzaturaId: string) {
  await requireRole("admin");
  const supabase = await createClient();
  await supabase.from("scadenze_attrezzature").delete().eq("id", id);
  revalidatePath(`/attrezzature/${attrezzaturaId}`);
}
