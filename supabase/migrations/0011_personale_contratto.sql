create type tipo_contratto as enum ('determinato', 'indeterminato');

alter table personale
  add column tipo_contratto tipo_contratto not null default 'indeterminato',
  add column data_assunzione date,
  add column scadenza_contratto date;
