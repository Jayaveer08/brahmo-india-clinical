create extension if not exists pgcrypto;

create table if not exists drugs (
  id text primary key,
  generic_name text not null,
  generic_name_normalized text not null,
  drug_class text not null,
  drug_subclass text,
  indian_brand_name text not null,
  manufacturer text,
  mrp_price text not null,
  monthly_cost_inr numeric,
  nlem_status boolean not null default false,
  renal_dosing jsonb not null default '{}'::jsonb,
  hf_safe boolean not null default true,
  weight_effect text check (weight_effect in ('gain', 'neutral', 'loss')),
  hypoglycemia_risk text check (hypoglycemia_risk in ('low', 'moderate', 'high')),
  condition_tags jsonb not null default '[]'::jsonb,
  source_note text,
  updated_at timestamptz not null default now()
);

create table if not exists drug_interactions (
  id uuid primary key default gen_random_uuid(),
  drug_a_id text not null references drugs(id),
  drug_b_id text not null references drugs(id),
  severity text not null check (severity in ('hard-block', 'high', 'moderate', 'monitor')),
  mechanism text not null,
  clinical_effect text not null,
  management text not null,
  source_note text,
  unique (drug_a_id, drug_b_id)
);

create table if not exists indian_guidelines (
  id text primary key,
  source_id text not null,
  condition text not null,
  section text not null,
  recommendation text not null,
  evidence_level text,
  condition_tags jsonb not null default '[]'::jsonb,
  source_url text,
  updated_at timestamptz not null default now()
);

create table if not exists hospital_formulary (
  id uuid primary key default gen_random_uuid(),
  drug_id text not null references drugs(id),
  site text not null default 'Apollo Chennai',
  in_stock boolean not null default true,
  stock_level text not null default 'routine',
  pharmacy_notes text,
  updated_at timestamptz not null default now(),
  unique (drug_id, site)
);

create index if not exists drugs_condition_tags_gin on drugs using gin (condition_tags);
create index if not exists guidelines_condition_tags_gin on indian_guidelines using gin (condition_tags);
create index if not exists interactions_drug_a_idx on drug_interactions (drug_a_id);
create index if not exists interactions_drug_b_idx on drug_interactions (drug_b_id);
