import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function TimbraturaPage() {
  const supabase = await createClient();

  const { data: personale } = await supabase
    .from("personale_pubblico")
    .select("id, nome_completo")
    .order("nome_completo");

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
      <h1 className="mb-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">Timbratura</h1>
      <p className="mb-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
        Seleziona il tuo nome per registrare entrata o uscita.
      </p>

      <div className="w-full max-w-sm space-y-2">
        {(personale ?? []).map((p) => (
          <Link
            key={p.id}
            href={`/timbra/${p.id}`}
            className="block rounded-xl border border-zinc-200 bg-white px-4 py-4 text-center text-base font-medium text-zinc-900 shadow-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
          >
            {p.nome_completo}
          </Link>
        ))}
        {(personale ?? []).length === 0 && (
          <p className="text-center text-sm text-zinc-400 dark:text-zinc-600">Nessun dipendente registrato.</p>
        )}
      </div>
    </div>
  );
}
