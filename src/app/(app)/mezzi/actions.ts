"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import type { RegimePossesso, TipoMezzo } from "@/lib/types";

function campiMezzoDaForm(formData: FormData) {
  const regimePossesso = String(formData.get("regime_possesso") ?? "proprieta") as RegimePossesso;
  return {
    nome: String(formData.get("nome") ?? "").trim(),
    tipo: String(formData.get("tipo") ?? "") as TipoMezzo,
    targa: String(formData.get("targa") ?? "").trim() || null,
    telaio: String(formData.get("telaio") ?? "").trim() || null,
    marca: String(formData.get("marca") ?? "").trim() || null,
    modello: String(formData.get("modello") ?? "").trim() || null,
    anno_immatricolazione: formData.get("anno_immatricolazione")
      ? Number(formData.get("anno_immatricolazione"))
      : null,
    regime_possesso: regimePossesso,
    societa_noleggio: regimePossesso === "proprieta" ? null : String(formData.get("societa_noleggio") ?? "").trim() || null,
    assegnato_a: String(formData.get("assegnato_a") ?? "").trim() || null,
    compagnia_assicurativa: String(formData.get("compagnia_assicurativa") ?? "").trim() || null,
    scadenza_assicurazione: String(formData.get("scadenza_assicurazione") ?? "") || null,
    scadenza_revisione_mctc: String(formData.get("scadenza_revisione_mctc") ?? "") || null,
    scadenza_bollo: String(formData.get("scadenza_bollo") ?? "") || null,
    scadenza_visita_inail: String(formData.get("scadenza_visita_inail") ?? "") || null,
    scadenza_collaudo: String(formData.get("scadenza_collaudo") ?? "") || null,
    scadenza_manutenzione_programmata: String(formData.get("scadenza_manutenzione_programmata") ?? "") || null,
    scadenza_contratto_noleggio:
      regimePossesso === "proprieta" ? null : String(formData.get("scadenza_contratto_noleggio") ?? "") || null,
    note: String(formData.get("note") ?? "").trim() || null,
  };
}

export async function creaMezzo(formData: FormData) {
  await requireRole("admin");
  const supabase = await createClient();

  const campi = campiMezzoDaForm(formData);
  if (!campi.nome) throw new Error("Il nome del mezzo è obbligatorio.");

  const { error } = await supabase.from("mezzi").insert(campi);
  if (error) throw new Error(`Errore nel salvataggio del mezzo: ${error.message}`);

  revalidatePath("/mezzi");
}

export async function aggiornaMezzo(id: string, formData: FormData) {
  await requireRole("admin");
  const supabase = await createClient();

  const campi = campiMezzoDaForm(formData);
  if (!campi.nome) throw new Error("Il nome del mezzo è obbligatorio.");

  const { error } = await supabase.from("mezzi").update(campi).eq("id", id);
  if (error) throw new Error(`Errore nell'aggiornamento del mezzo: ${error.message}`);

  revalidatePath("/mezzi");
  revalidatePath(`/mezzi/${id}`);
}

export async function eliminaMezzo(id: string) {
  await requireRole("admin");
  const supabase = await createClient();
  await supabase.from("mezzi").delete().eq("id", id);
  revalidatePath("/mezzi");
  redirect("/mezzi");
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
