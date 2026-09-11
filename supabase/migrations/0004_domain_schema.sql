-- Anagrafiche di dominio: mezzi, attrezzature, personale, e le rispettive
-- scadenze (revisioni, verifiche periodiche, certificazioni, formazione...).

create type tipo_mezzo as enum (
  'autocarro', 'auto', 'gru', 'autogru', 'piattaforma_aerea',
  'camion', 'camion_gruato', 'rimorchio'
);

create type tipo_attrezzatura as enum ('catena', 'fune', 'gancio', 'altro');

-- Tipo di scadenza condiviso da mezzi/attrezzature/personale: ogni contesto
-- usa solo il sottoinsieme che gli interessa, ma un unico enum semplifica
-- form e query riusabili.
create type tipo_scadenza as enum (
  'revisione', 'verifica_periodica_inail', 'collaudo', 'assicurazione', 'manutenzione_programmata',
  'verifica_periodica',
  'patente', 'patentino_gru', 'patentino_carrelli', 'patentino_ple', 'visita_medica', 'corso_sicurezza', 'dpi',
  'altro'
);

create table mezzi (
  id uuid primary key default gen_random_uuid(),
  tipo tipo_mezzo not null,
  nome text not null,
  targa text,
  marca text,
  modello text,
  anno_immatricolazione integer,
  note text,
  attivo boolean not null default true,
  creato_il timestamptz not null default now()
);

create table attrezzature (
  id uuid primary key default gen_random_uuid(),
  tipo tipo_attrezzatura not null,
  nome text not null,
  matricola text,
  note text,
  attiva boolean not null default true,
  creato_il timestamptz not null default now()
);

create table personale (
  id uuid primary key default gen_random_uuid(),
  nome_completo text not null,
  telefono text,
  email text,
  note text,
  attivo boolean not null default true,
  creato_il timestamptz not null default now()
);

create table scadenze_mezzi (
  id uuid primary key default gen_random_uuid(),
  mezzo_id uuid not null references mezzi (id) on delete cascade,
  tipo tipo_scadenza not null,
  descrizione text,
  data_scadenza date not null,
  completata_il date,
  note text,
  creato_il timestamptz not null default now()
);

create table scadenze_attrezzature (
  id uuid primary key default gen_random_uuid(),
  attrezzatura_id uuid not null references attrezzature (id) on delete cascade,
  tipo tipo_scadenza not null,
  descrizione text,
  data_scadenza date not null,
  completata_il date,
  note text,
  creato_il timestamptz not null default now()
);

create table scadenze_personale (
  id uuid primary key default gen_random_uuid(),
  personale_id uuid not null references personale (id) on delete cascade,
  tipo tipo_scadenza not null,
  descrizione text,
  data_scadenza date not null,
  completata_il date,
  note text,
  creato_il timestamptz not null default now()
);

create index idx_scadenze_mezzi_mezzo on scadenze_mezzi (mezzo_id);
create index idx_scadenze_mezzi_data on scadenze_mezzi (data_scadenza) where completata_il is null;
create index idx_scadenze_attrezzature_attrezzatura on scadenze_attrezzature (attrezzatura_id);
create index idx_scadenze_attrezzature_data on scadenze_attrezzature (data_scadenza) where completata_il is null;
create index idx_scadenze_personale_personale on scadenze_personale (personale_id);
create index idx_scadenze_personale_data on scadenze_personale (data_scadenza) where completata_il is null;
