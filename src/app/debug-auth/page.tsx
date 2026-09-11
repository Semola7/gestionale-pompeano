import { createClient } from "@/lib/supabase/server";

export default async function DebugAuthPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  const profileResult = user
    ? await supabase.from("profiles").select("id, ruolo, nome_completo").eq("id", user.id).single()
    : null;

  return (
    <pre style={{ padding: 24, fontSize: 14, whiteSpace: "pre-wrap", color: "black", background: "white" }}>
      {JSON.stringify(
        {
          user: user ? { id: user.id, email: user.email } : null,
          userError: userError ? { name: userError.name, message: userError.message, status: userError.status } : null,
          profileData: profileResult?.data ?? null,
          profileError: profileResult?.error
            ? {
                message: profileResult.error.message,
                code: profileResult.error.code,
                details: profileResult.error.details,
                hint: profileResult.error.hint,
              }
            : null,
        },
        null,
        2
      )}
    </pre>
  );
}
