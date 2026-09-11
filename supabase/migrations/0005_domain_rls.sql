-- Lettura per tutti gli utenti autenticati, scrittura (anagrafica e
-- scadenze) riservata all'admin.

alter table mezzi enable row level security;
alter table attrezzature enable row level security;
alter table personale enable row level security;
alter table scadenze_mezzi enable row level security;
alter table scadenze_attrezzature enable row level security;
alter table scadenze_personale enable row level security;

create policy "mezzi_select_authenticated" on mezzi
  for select using (auth.role() = 'authenticated');
create policy "mezzi_write_admin" on mezzi
  for all using (current_profile_role() = 'admin') with check (current_profile_role() = 'admin');

create policy "attrezzature_select_authenticated" on attrezzature
  for select using (auth.role() = 'authenticated');
create policy "attrezzature_write_admin" on attrezzature
  for all using (current_profile_role() = 'admin') with check (current_profile_role() = 'admin');

create policy "personale_select_authenticated" on personale
  for select using (auth.role() = 'authenticated');
create policy "personale_write_admin" on personale
  for all using (current_profile_role() = 'admin') with check (current_profile_role() = 'admin');

create policy "scadenze_mezzi_select_authenticated" on scadenze_mezzi
  for select using (auth.role() = 'authenticated');
create policy "scadenze_mezzi_write_admin" on scadenze_mezzi
  for all using (current_profile_role() = 'admin') with check (current_profile_role() = 'admin');

create policy "scadenze_attrezzature_select_authenticated" on scadenze_attrezzature
  for select using (auth.role() = 'authenticated');
create policy "scadenze_attrezzature_write_admin" on scadenze_attrezzature
  for all using (current_profile_role() = 'admin') with check (current_profile_role() = 'admin');

create policy "scadenze_personale_select_authenticated" on scadenze_personale
  for select using (auth.role() = 'authenticated');
create policy "scadenze_personale_write_admin" on scadenze_personale
  for all using (current_profile_role() = 'admin') with check (current_profile_role() = 'admin');
