import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ConfirmTimbratura } from "./confirm-timbratura";

export default async function TimbraPersonaPage(ctx: PageProps<"/timbra/[id]">) {
  const { id } = await ctx.params;
  const supabase = await createClient();

  const { data: persona } = await supabase
    .from("personale_pubblico")
    .select("id, nome_completo")
    .eq("id", id)
    .single();

  if (!persona) notFound();

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 px-4 py-10 dark:bg-black">
      <Image
        src="/lg_pmp.png"
        alt="Pompeano Antonio & Figli"
        width={480}
        height={200}
        priority
        className="mb-6 h-20 w-auto"
      />
      <h1 className="mb-6 text-xl font-semibold text-zinc-900 dark:text-zinc-50">{persona.nome_completo}</h1>
      <ConfirmTimbratura personaleId={persona.id} nome={persona.nome_completo} />
    </div>
  );
}
