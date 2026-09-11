# Gestionale Sollevamenti — Pompeano Antonio & Figli

Gestionale per un'azienda di sollevamenti: anagrafica personale, mezzi e
attrezzature, con le relative scadenze (revisioni, verifiche periodiche
INAIL, collaudi, assicurazioni, manutenzioni programmate, patenti/patentini,
visite mediche, corsi sicurezza, DPI...) e archivio documenti per mezzo.

Stack: Next.js (App Router, TypeScript, Tailwind) + Supabase (Postgres, Auth,
RLS) + Vercel + GitHub.

## Cosa c'è già

- Login/autenticazione e ruoli (`admin` / `operatore`)
- Anagrafica **Mezzi** (autocarro, auto, gru, autogru, piattaforma aerea,
  camion, camion gruato, rimorchio) con scadenze e documenti allegati
- Anagrafica **Attrezzature** (catene, funi, ganci...) con scadenze
- Anagrafica **Personale** (contatti, patenti/patentini, visite mediche,
  corsi, DPI) con scadenze
- Vista **Scadenze** unificata con filtri (scadute/in arrivo, tutte, completate)
- **Dashboard** con conteggio mezzi per tipologia e scadenze prossime

## Cosa manca ancora

- **Notifiche email 20 giorni prima della scadenza**: richiede un servizio di
  invio email (es. [Resend](https://resend.com), piano gratuito sufficiente
  per iniziare) e un trigger schedulato (Supabase Cron + Edge Function, o
  Vercel Cron) che ogni giorno controlli le scadenze e mandi l'avviso. Da
  implementare appena si sceglie il servizio email.
- **Utenti aggiuntivi oltre all'admin**: per ora previsto solo l'account
  admin del titolare; altri utenti (es. capisquadra) si aggiungono in seguito.

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

4. **Applica lo schema del database.** Nel progetto Supabase, apri l'SQL Editor ed esegui in ordine tutti i file in `supabase/migrations/` (0001...0006). In alternativa, se hai installato la [Supabase CLI](https://supabase.com/docs/guides/cli) e collegato il progetto, puoi eseguire `supabase db push`.

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
