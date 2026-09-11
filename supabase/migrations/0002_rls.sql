-- Row Level Security: ognuno vede/aggiorna il proprio profilo, l'admin
-- vede/gestisce tutti gli utenti.

-- Funzione di supporto (security definer per evitare ricorsione nelle
-- policy sulla tabella profiles)
create function current_profile_role()
returns ruolo_utente
language sql
security definer
set search_path = public
stable
as $$
  select ruolo from profiles where id = auth.uid();
$$;

alter table profiles enable row level security;

create policy "profiles_select_own_or_admin" on profiles
  for select using (id = auth.uid() or current_profile_role() = 'admin');

create policy "profiles_update_own_or_admin" on profiles
  for update using (id = auth.uid() or current_profile_role() = 'admin');

create policy "profiles_insert_admin" on profiles
  for insert with check (current_profile_role() = 'admin');
