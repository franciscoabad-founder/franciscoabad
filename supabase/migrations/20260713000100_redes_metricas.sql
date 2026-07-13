-- Dashboard real de Redes: metricas diarias por plataforma y posts individuales.
-- Metrica: snapshot diario por plataforma (seguidores, alcance, impresiones, interacciones, publicaciones).
-- Post: post individual con su performance, para el ranking de top posts.

-- 1. Metricas diarias por plataforma
create table if not exists public.redes_metricas (
  id uuid primary key default gen_random_uuid(),
  plataforma text not null check (plataforma in ('instagram','facebook','tiktok','linkedin','youtube','x')),
  fecha date not null,
  seguidores int,
  alcance int,
  impresiones int,
  interacciones int,
  publicaciones int,
  engagement_rate numeric,
  raw jsonb,
  created_at timestamptz not null default now(),
  unique (plataforma, fecha)
);

-- 2. Posts individuales por plataforma
create table if not exists public.redes_posts (
  id uuid primary key default gen_random_uuid(),
  plataforma text not null check (plataforma in ('instagram','facebook','tiktok','linkedin','youtube','x')),
  post_id text not null,
  url text,
  titulo text,
  publicado_at timestamptz,
  alcance int,
  impresiones int,
  likes int,
  comentarios int,
  compartidos int,
  guardados int,
  raw jsonb,
  created_at timestamptz not null default now(),
  unique (plataforma, post_id)
);

-- RLS igual que el resto del OS (acceso solo via service_role desde endpoints)
alter table public.redes_metricas enable row level security;
alter table public.redes_posts enable row level security;

grant all on public.redes_metricas, public.redes_posts to service_role;

notify pgrst, 'reload schema';
