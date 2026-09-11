-- Archivio documenti per mezzo (libretti, certificati, foto...).

create table documenti_mezzi (
  id uuid primary key default gen_random_uuid(),
  mezzo_id uuid not null references mezzi (id) on delete cascade,
  nome_file text not null,
  storage_path text not null unique,
  dimensione_byte integer,
  caricato_da uuid references profiles (id),
  creato_il timestamptz not null default now()
);

create index idx_documenti_mezzi_mezzo on documenti_mezzi (mezzo_id);

alter table documenti_mezzi enable row level security;

create policy "documenti_mezzi_select_authenticated" on documenti_mezzi
  for select using (auth.role() = 'authenticated');

create policy "documenti_mezzi_write_admin" on documenti_mezzi
  for all using (current_profile_role() = 'admin') with check (current_profile_role() = 'admin');

-- Bucket di storage privato per i file (accesso solo via URL firmate)
insert into storage.buckets (id, name, public)
values ('documenti-mezzi', 'documenti-mezzi', false)
on conflict (id) do nothing;

create policy "documenti_mezzi_storage_select_authenticated" on storage.objects
  for select using (bucket_id = 'documenti-mezzi' and auth.role() = 'authenticated');

create policy "documenti_mezzi_storage_write_admin" on storage.objects
  for insert with check (bucket_id = 'documenti-mezzi' and current_profile_role() = 'admin');

create policy "documenti_mezzi_storage_delete_admin" on storage.objects
  for delete using (bucket_id = 'documenti-mezzi' and current_profile_role() = 'admin');
