import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile, RuoloUtente } from "@/lib/types";

export async function getCurrentProfile() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, ruolo, nome_completo")
    .eq("id", user.id)
    .single<Profile>();

  if (!profile) redirect("/login");

  return profile;
}

export async function requireRole(...ruoli: RuoloUtente[]) {
  const profile = await getCurrentProfile();
  if (!ruoli.includes(profile.ruolo)) redirect("/dashboard");
  return profile;
}
