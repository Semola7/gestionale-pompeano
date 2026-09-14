create policy "richieste_ferie_delete_own_in_attesa" on richieste_ferie
  for delete using (personale_id = current_personale_id() and stato = 'in_attesa');

grant delete on richieste_ferie to authenticated;
