-- Fase 5 Salud OS: horas objetivo por defecto del próximo ayuno.
-- Chequeo contra la DB real: ayunos.protocolo, ayunos.objetivo_horas y
-- salud_config.protocolo_ayuno_default YA existen (migración 20260715000000) y se
-- reutilizan tal cual. Lo ÚNICO que falta es dónde guardar las horas objetivo por
-- defecto cuando el protocolo configurado es custom: objetivo_horas es un snapshot
-- por ayuno, no un default global. Esta migración agrega solo esa columna.
alter table public.salud_config
  add column if not exists ayuno_objetivo_h numeric(5,2) not null default 16;

comment on column public.salud_config.ayuno_objetivo_h is
  'Horas objetivo por defecto del próximo ayuno. Sincronizada con protocolo_ayuno_default (16_8 -> 16, 24h -> 24, 36h -> 36); libre cuando el protocolo es custom. Informativa: nunca auto-cierra un ayuno.';

notify pgrst, 'reload schema';
