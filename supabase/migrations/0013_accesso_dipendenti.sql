-- Accesso personale per i dipendenti: account veri (creati dall'admin,
-- non auto-registrazione) collegati alla loro scheda in `personale`,
-- con accesso riservato solo alla timbratura — non vedono mezzi,
-- attrezzature, scadenze né i dati dei colleghi.
--
-- Da eseguire DOPO 0012_ruolo_dipendente.sql.

alter table personale add column auth_user_id uuid references auth.users (id) on delete set null;
create unique index idx_personale_auth_user_id on personale (auth_user_id) where auth_user_id is not null;

-- Risolve l'id personale collegato all'utente autenticato corrente.
create function current_personale_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select id from personale where auth_user_id = auth.uid();
$$;

-- Il trigger di creazione profilo ora rispetta il ruolo passato in fase di
-- creazione dell'account (usato per creare i dipendenti come 'dipendente'
-- invece del default 'operatore').
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, nome_completo, ruolo)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nome_completo', new.email),
    coalesce((new.raw_user_meta_data ->> 'ruolo')::ruolo_utente, 'operatore')
  );
  return new;
end;
$$;

-- Le anagrafiche e le scadenze restano visibili solo a admin/operatore,
-- non ai dipendenti.
drop policy "mezzi_select_authenticated" on mezzi;
create policy "mezzi_select_staff" on mezzi
  for select using (current_profile_role() in ('admin', 'operatore'));

drop policy "attrezzature_select_authenticated" on attrezzature;
create policy "attrezzature_select_staff" on attrezzature
  for select using (current_profile_role() in ('admin', 'operatore'));

drop policy "personale_select_authenticated" on personale;
create policy "personale_select_staff" on personale
  for select using (current_profile_role() in ('admin', 'operatore'));
create policy "personale_select_own" on personale
  for select using (id = current_personale_id());

drop policy "scadenze_attrezzature_select_authenticated" on scadenze_attrezzature;
create policy "scadenze_attrezzature_select_staff" on scadenze_attrezzature
  for select using (current_profile_role() in ('admin', 'operatore'));

drop policy "scadenze_personale_select_authenticated" on scadenze_personale;
create policy "scadenze_personale_select_staff" on scadenze_personale
  for select using (current_profile_role() in ('admin', 'operatore'));

drop policy "documenti_mezzi_select_authenticated" on documenti_mezzi;
create policy "documenti_mezzi_select_staff" on documenti_mezzi
  for select using (current_profile_role() in ('admin', 'operatore'));

-- Presenze: non più timbrature anonime (auto-selezione del nome). Ogni
-- dipendente vede/inserisce solo le proprie; admin/operatore vedono tutto.
drop policy "presenze_insert_anon" on presenze;
drop policy "presenze_insert_authenticated" on presenze;
drop policy "presenze_select_authenticated" on presenze;

create policy "presenze_select_staff" on presenze
  for select using (current_profile_role() in ('admin', 'operatore'));
create policy "presenze_select_own" on presenze
  for select using (personale_id = current_personale_id());

create policy "presenze_insert_own" on presenze
  for insert to authenticated with check (personale_id = current_personale_id());

revoke insert on presenze from anon;
