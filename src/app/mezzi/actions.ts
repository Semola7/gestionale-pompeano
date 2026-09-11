"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import type { TipoMezzo, TipoScadenza } from "@/lib/types";

export async function creaMezzo(formData: FormData) {
  await requireRole("admin");
  const supabase = await createClient();

  const nome = String(formData.get("nome") ?? "").trim();
  const tipo = String(formData.get("tipo") ?? "") as TipoMezzo;
  if (!nome) throw new Error("Il nome del mezzo è obbligatorio.");

  const { data, error } = await supabase
    .from("mezzi")
    .insert({
      nome,
      tipo,
      targa: String(formData.get("targa") ?? "").trim() || null,
      marca: String(formData.get("marca") ?? "").trim() || null,
      modello: String(formData.get("modello") ?? "").trim() || null,
      anno_immatricolazione: formData.get("anno_immatricolazione")
        ? Number(formData.get("anno_immatricolazione"))
        : null,
      note: String(formData.get("note") ?? "").trim() || null,
    })
    .select("id")
    .single();

  if (error || !data) throw new Error(`Errore nel salvataggio del mezzo: ${error?.message}`);

  revalidatePath("/mezzi");
  redirect(`/mezzi/${data.id}`);
}

export async function eliminaMezzo(id: string) {
  await requireRole("admin");
  const supabase = await createClient();
  await supabase.from("mezzi").delete().eq("id", id);
  revalidatePath("/mezzi");
  redirect("/mezzi");
}

export async function aggiungiScadenzaMezzo(formData: FormData) {
  await requireRole("admin");
  const supabase = await createClient();

  const mezzoId = String(formData.get("mezzo_id") ?? "");
  const tipo = String(formData.get("tipo") ?? "") as TipoScadenza;
  const dataScadenza = String(formData.get("data_scadenza") ?? "");
  if (!mezzoId || !tipo || !dataScadenza) throw new Error("Tipo e data scadenza sono obbligatori.");

  const { error } = await supabase.from("scadenze_mezzi").insert({
    mezzo_id: mezzoId,
    tipo,
    data_scadenza: dataScadenza,
    descrizione: String(formData.get("descrizione") ?? "").trim() || null,
  });

  if (error) throw new Error(`Errore nel salvataggio della scadenza: ${error.message}`);
  revalidatePath(`/mezzi/${mezzoId}`);
}

export async function completaScadenzaMezzo(id: string, mezzoId: string) {
  await requireRole("admin");
  const supabase = await createClient();
  await supabase
    .from("scadenze_mezzi")
    .update({ completata_il: new Date().toISOString().slice(0, 10) })
    .eq("id", id);
  revalidatePath(`/mezzi/${mezzoId}`);
}

export async function eliminaScadenzaMezzo(id: string, mezzoId: string) {
  await requireRole("admin");
  const supabase = await createClient();
  await supabase.from("scadenze_mezzi").delete().eq("id", id);
  revalidatePath(`/mezzi/${mezzoId}`);
}

export async function uploadDocumentoMezzo(formData: FormData) {
  const profile = await requireRole("admin");
  const supabase = await createClient();

  const mezzoId = String(formData.get("mezzo_id") ?? "");
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) throw new Error("Seleziona un file da caricare.");
  if (!mezzoId) throw new Error("Mezzo mancante.");

  const estensione = file.name.split(".").pop() || "bin";
  const path = `mezzi/${mezzoId}/${Date.now()}.${estensione}`;

  const { error: uploadError } = await supabase.storage
    .from("documenti-mezzi")
    .upload(path, file, { contentType: file.type || undefined });
  if (uploadError) throw new Error(`Errore nel caricamento del file: ${uploadError.message}`);

  const { error: insertError } = await supabase.from("documenti_mezzi").insert({
    mezzo_id: mezzoId,
    nome_file: file.name,
    storage_path: path,
    dimensione_byte: file.size,
    caricato_da: profile.id,
  });

  if (insertError) {
    await supabase.storage.from("documenti-mezzi").remove([path]);
    throw new Error(`Errore nel salvataggio del documento: ${insertError.message}`);
  }

  revalidatePath(`/mezzi/${mezzoId}`);
}

export async function eliminaDocumentoMezzo(id: string, storagePath: string, mezzoId: string) {
  await requireRole("admin");
  const supabase = await createClient();
  await supabase.storage.from("documenti-mezzi").remove([storagePath]);
  await supabase.from("documenti_mezzi").delete().eq("id", id);
  revalidatePath(`/mezzi/${mezzoId}`);
}
