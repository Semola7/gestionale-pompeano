-- Timbratura presenze: ogni dipendente inquadra con il proprio telefono un
-- QR code fisso all'ingresso, sceglie il proprio nome e conferma
-- entrata/uscita. Il flusso è pubblico (nessun login richiesto), quindi
-- espone solo il minimo indispensabile (nome dipendenti attivi) tramite
-- una vista dedicata.

create table presenze (
  id uuid primary key default gen_random_uuid(),
  personale_id uuid not null references personale (id) on delete cascade,
  tipo text not null check (tipo in ('entrata', 'uscita')),
  timbrato_il timestamptz not null default now()
);

create index idx_presenze_personale on presenze (personale_id);
create index idx_presenze_timbrato_il on presenze (timbrato_il);

create view personale_pubblico as
  select id, nome_completo from personale where attivo = true;

alter table presenze enable row level security;

create policy "presenze_insert_anon" on presenze
  for insert to anon with check (true);

create policy "presenze_insert_authenticated" on presenze
  for insert to authenticated with check (true);

create policy "presenze_select_authenticated" on presenze
  for select using (auth.role() = 'authenticated');

grant usage on schema public to anon;
grant select on personale_pubblico to anon;
grant insert on presenze to anon;
grant select, insert on presenze to authenticated;
