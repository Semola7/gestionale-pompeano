-- Ristruttura Mezzi con campi identificativi/gestionali più ricchi e
-- scadenze come colonne dirette (niente più tabella scadenze_mezzi a
-- righe multiple: ogni scadenza è un'unica data sulla scheda del mezzo,
-- che si aggiorna semplicemente quando viene rinnovata).
--
-- Nota: scadenze_mezzi risulta vuota (nessun mezzo era ancora stato
-- censito), quindi il drop è sicuro. Se in futuro serve una scadenza
-- "libera" non prevista tra le colonne fisse, si può riconsiderare.

create type regime_possesso as enum ('proprieta', 'noleggio', 'leasing');

alter table mezzi
  add column telaio text,
  add column regime_possesso regime_possesso not null default 'proprieta',
  add column societa_noleggio text,
  add column assegnato_a text,
  add column compagnia_assicurativa text,
  add column scadenza_assicurazione date,
  add column scadenza_revisione_mctc date,
  add column scadenza_bollo date,
  add column scadenza_visita_inail date,
  add column scadenza_collaudo date,
  add column scadenza_manutenzione_programmata date,
  add column scadenza_contratto_noleggio date;

drop table scadenze_mezzi;

-- Personale: aggiunge la mansione (testo libero: capo squadra, gruista,
-- autista, operaio...).
alter table personale add column mansione text;

-- Rimuove il concetto di "scadenza completata": ogni scadenza è una sola
-- data che si aggiorna direttamente quando viene rinnovata, non più una
-- riga storica da marcare come chiusa.
alter table scadenze_attrezzature drop column completata_il;
alter table scadenze_personale drop column completata_il;
