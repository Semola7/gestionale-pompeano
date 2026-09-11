-- Gestionale Sollevamenti — schema iniziale (solo autenticazione/profili)
-- Le tabelle di dominio (personale, mezzi, attrezzature, scadenze) arrivano
-- in migration successive, una volta definiti i requisiti.

create type ruolo_utente as enum ('admin', 'operatore');

-- Profilo esteso per ogni utente Supabase Auth, con ruolo applicativo
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  ruolo ruolo_utente not null default 'operatore',
  nome_completo text not null,
  creato_il timestamptz not null default now()
);
