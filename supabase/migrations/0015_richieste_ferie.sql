create type stato_richiesta_ferie as enum ('in_attesa', 'approvata', 'rifiutata');

create table richieste_ferie (
  id uuid primary key default gen_random_uuid(),
  personale_id uuid not null references personale (id) on delete cascade,
  data_inizio date not null,
  data_fine date not null,
  note text,
  stato stato_richiesta_ferie not null default 'in_attesa',
  gestita_da uuid references profiles (id),
  gestita_il timestamptz,
  creato_il timestamptz not null default now(),
  constraint richieste_ferie_date_valide check (data_fine >= data_inizio)
);

create index idx_richieste_ferie_personale on richieste_ferie (personale_id);
create index idx_richieste_ferie_stato on richieste_ferie (stato);

alter table richieste_ferie enable row level security;

create policy "richieste_ferie_select_staff" on richieste_ferie
  for select using (current_profile_role() in ('admin', 'operatore'));

create policy "richieste_ferie_select_own" on richieste_ferie
  for select using (personale_id = current_personale_id());

create policy "richieste_ferie_insert_own" on richieste_ferie
  for insert to authenticated with check (personale_id = current_personale_id());

create policy "richieste_ferie_update_admin" on richieste_ferie
  for update using (current_profile_role() = 'admin') with check (current_profile_role() = 'admin');

-- Le tabelle create via migration non ricevono i GRANT di base
-- automaticamente (vedi memoria di progetto): senza questa riga ogni
-- query fallirebbe con "permission denied" a prescindere dalle policy RLS.
grant select, insert, update on richieste_ferie to authenticated;
