-- Le tabelle create via SQL puro non ricevono automaticamente i permessi
-- che l'editor visuale di Supabase concede di default. Senza queste GRANT,
-- ogni query dell'app (ruolo "authenticated") fallisce con "permission
-- denied", indipendentemente dalle policy RLS (che si applicano solo dopo
-- aver superato questo controllo più a monte).

grant usage on schema public to authenticated;

grant select, insert, update, delete on
  public.profiles,
  public.mezzi,
  public.attrezzature,
  public.personale,
  public.scadenze_mezzi,
  public.scadenze_attrezzature,
  public.scadenze_personale,
  public.documenti_mezzi
to authenticated;
