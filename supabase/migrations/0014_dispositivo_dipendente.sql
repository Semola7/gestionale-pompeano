-- Lega l'account di timbratura al primo dispositivo (browser) che lo usa,
-- per impedire che le credenziali vengano semplicemente prestate a un
-- collega da un altro telefono. L'aggiornamento di questa colonna avviene
-- lato server con la chiave service_role (bypassa le RLS), non serve una
-- policy di scrittura dedicata per il dipendente.

alter table personale add column dispositivo_id text;
