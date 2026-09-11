import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";

export async function GET(_request: Request, ctx: RouteContext<"/mezzi/download/[id]">) {
  await getCurrentProfile();

  const { id } = await ctx.params;
  const supabase = await createClient();

  const { data: documento } = await supabase
    .from("documenti_mezzi")
    .select("nome_file, storage_path")
    .eq("id", id)
    .single();

  if (!documento) {
    return new Response("Documento non trovato", { status: 404 });
  }

  const { data: blob, error } = await supabase.storage
    .from("documenti-mezzi")
    .download(documento.storage_path);

  if (error || !blob) {
    return new Response("Errore nel download del file", { status: 500 });
  }

  const buffer = Buffer.from(await blob.arrayBuffer());
  const nomeFilePulito = documento.nome_file.replace(/"/g, "");

  return new Response(buffer, {
    headers: {
      "Content-Type": blob.type || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${nomeFilePulito}"; filename*=UTF-8''${encodeURIComponent(documento.nome_file)}`,
    },
  });
}
