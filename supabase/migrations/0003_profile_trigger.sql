-- Crea automaticamente un profilo (ruolo 'operatore' di default) alla
-- registrazione di un nuovo utente Supabase Auth. Il ruolo va poi promosso
-- manualmente (o da un admin) a 'admin' quando necessario.

create function handle_new_user()
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
    'operatore'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
