-- Nuovo ruolo per gli account dei dipendenti (accesso solo alla
-- timbratura, non al resto del gestionale). Va eseguita da sola, prima
-- di 0013, perché Postgres non permette di usare un nuovo valore enum
-- nella stessa transazione in cui viene aggiunto.

alter type ruolo_utente add value 'dipendente';
