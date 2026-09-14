import "server-only";
import { createClient } from "@supabase/supabase-js";

// Client con la chiave service_role: bypassa la Row Level Security.
// Usare SOLO in codice server-only (Server Actions/Route Handler), mai
// esporre al browser. Serve esclusivamente per creare/gestire gli account
// Supabase Auth dei dipendenti (operazione che l'admin API richiede).
export function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
