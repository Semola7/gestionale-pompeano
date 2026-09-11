"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function PasswordDimenticataPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [inviata, setInviata] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
    });

    setLoading(false);

    if (error) {
      setError("Non è stato possibile inviare l'email. Riprova.");
      return;
    }

    setInviata(true);
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 dark:bg-black">
      <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="mb-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Password dimenticata
        </h1>

        {inviata ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Se l&apos;indirizzo è associato a un account, riceverai a breve un&apos;email con il link per
            impostare una nuova password.
          </p>
        ) : (
          <>
            <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
              Inserisci la tua email: ti mandiamo un link per reimpostare la password.
            </p>
            <form onSubmit={handleSubmit}>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mb-4 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              />

              {error && (
                <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {loading ? "Invio in corso…" : "Invia link"}
              </button>
            </form>
          </>
        )}

        <Link
          href="/login"
          className="mt-4 block text-center text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          ← Torna al login
        </Link>
      </div>
    </div>
  );
}
