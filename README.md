# Gestionale Sollevamenti

Gestionale per un'azienda di sollevamenti: anagrafica personale, mezzi e
attrezzature, con le relative scadenze (revisioni, verifiche periodiche,
certificazioni, formazione, ecc.).

Stack: Next.js (App Router, TypeScript, Tailwind) + Supabase (Postgres, Auth,
RLS) + Vercel + GitHub.

Progetto scaffold iniziale: al momento contiene solo login/autenticazione e
gestione ruoli (`admin` / `operatore`). Le tabelle di dominio (personale,
mezzi, attrezzature, scadenze) verranno aggiunte in migration successive una
volta definiti i requisiti con il cliente.

## Setup locale

1. **Installa le dipendenze**

   ```bash
   npm install
   ```

2. **Crea un progetto Supabase** su [supabase.com](https://supabase.com) (piano gratuito va bene per iniziare).

3. **Copia le chiavi** in un file `.env.local` (non versionato) a partire da `.env.example`:

   ```bash
   cp .env.example .env.local
   ```

   Valorizza `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` con i valori che trovi in Supabase → Project Settings → API.

4. **Applica lo schema del database.** Nel progetto Supabase, apri l'SQL Editor ed esegui in ordine i file in `supabase/migrations/` (0001, 0002, 0003). In alternativa, se hai installato la [Supabase CLI](https://supabase.com/docs/guides/cli) e collegato il progetto, puoi eseguire `supabase db push`.

5. **Crea il primo utente admin.** In Supabase → Authentication → Users, crea un utente con email/password. Poi, nell'SQL Editor, promuovilo ad admin:

   ```sql
   update profiles set ruolo = 'admin' where id = '<uuid dell''utente>';
   ```

6. **Avvia il server di sviluppo**

   ```bash
   npm run dev
   ```

   Apri [http://localhost:3000](http://localhost:3000): verrai reindirizzato a `/login`.

## Struttura del progetto

- `src/app/` — route dell'applicazione (App Router)
- `src/lib/supabase/` — client Supabase (browser, server, proxy/session refresh)
- `src/proxy.ts` — protezione delle route (redirect a `/login` se non autenticato)
- `supabase/migrations/` — schema SQL (tabelle, RLS, trigger)

## Deploy

Repo su GitHub collegato a un progetto Vercel dedicato: ogni push su `main` fa deploy automatico. Configura le stesse variabili d'ambiente (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`) nelle impostazioni del progetto Vercel.
