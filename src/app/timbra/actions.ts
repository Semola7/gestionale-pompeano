"use server";

import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { entroSede } from "@/lib/geo";
import type { TipoPresenza } from "@/lib/types";

const COOKIE_DISPOSITIVO = "dispositivo_token";
const DURATA_COOKIE_SECONDI = 60 * 60 * 24 * 730; // ~2 anni

export async function registraPresenza(tipo: TipoPresenza, lat: number, lng: number) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sessione scaduta. Effettua di nuovo l'accesso.");

  const { data: persona } = await supabase
    .from("personale")
    .select("id, dispositivo_id")
    .eq("auth_user_id", user.id)
    .single();
  if (!persona) throw new Error("Il tuo account non è collegato a nessun nominativo. Contatta l'amministratore.");

  const cookieStore = await cookies();
  const tokenDispositivo = cookieStore.get(COOKIE_DISPOSITIVO)?.value ?? null;

  if (persona.dispositivo_id) {
    if (!tokenDispositivo || tokenDispositivo !== persona.dispositivo_id) {
      throw new Error(
        "Questo non è il dispositivo registrato per il tuo account. Chiedi all'amministratore di autorizzarlo."
      );
    }
  } else {
    const nuovoToken = tokenDispositivo ?? randomUUID();
    cookieStore.set(COOKIE_DISPOSITIVO, nuovoToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: DURATA_COOKIE_SECONDI,
      path: "/",
    });
    const admin = createAdminClient();
    await admin.from("personale").update({ dispositivo_id: nuovoToken }).eq("id", persona.id);
  }

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
