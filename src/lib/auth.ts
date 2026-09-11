import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile, RuoloUtente } from "@/lib/types";

export async function getCurrentProfile() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  console.log("[getCurrentProfile] user:", user?.id ?? null, "error:", userError?.message ?? null);

  if (!user) redirect("/login");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, ruolo, nome_completo")
    .eq("id", user.id)
    .single<Profile>();

  console.log("[getCurrentProfile] profile:", profile ?? null, "error:", profileError?.message ?? null);

  if (!profile) redirect("/login");

  return profile;
}

export async function requireRole(...ruoli: RuoloUtente[]) {
  const profile = await getCurrentProfile();
  if (!ruoli.includes(profile.ruolo)) redirect("/dashboard");
  return profile;
}
