-- QA Salud OS: búsqueda insensible a acentos (unaccent) + integridad de ayuno abierto único.
-- Idempotente. Reemplaza el ilike frágil del endpoint (que borraba paréntesis del término).

-- 1. Extensión unaccent en el schema `extensions` (convención Supabase). Se referencia
--    calificada como extensions.unaccent para que PostgREST la resuelva sin depender del
--    search_path del rol de la API.
create extension if not exists unaccent with schema extensions;

-- 2. RPC de búsqueda de alimentos: STABLE y parametrizado (sin inyección). Devuelve la fila
--    completa (setof alimentos) para no cambiar el contrato del endpoint.
create or replace function public.buscar_alimentos(term text default null, lim int default 40)
returns setof alimentos
language sql
stable
as $$
  select *
  from alimentos a
  where term is null or btrim(term) = ''
     or extensions.unaccent(a.nombre) ilike extensions.unaccent('%' || term || '%')
     or extensions.unaccent(coalesce(a.marca, '')) ilike extensions.unaccent('%' || term || '%')
  order by a.nombre asc
  limit greatest(1, coalesce(lim, 40));
$$;

-- 3. RPC de búsqueda de ejercicios: replica los filtros del endpoint (grupo/patrón),
--    busca en nombre y nombre_en, sin acentos.
create or replace function public.buscar_ejercicios(
  term text default null, p_grupo text default null, p_patron text default null, lim int default 500
)
returns setof ejercicios
language sql
stable
as $$
  select *
  from ejercicios e
  where (term is null or btrim(term) = ''
         or extensions.unaccent(e.nombre) ilike extensions.unaccent('%' || term || '%')
         or extensions.unaccent(coalesce(e.nombre_en, '')) ilike extensions.unaccent('%' || term || '%'))
    and (p_grupo is null or btrim(p_grupo) = '' or e.grupo_muscular_primario = p_grupo)
    and (p_patron is null or btrim(p_patron) = '' or e.patron = p_patron)
  order by e.nombre asc
  limit greatest(1, coalesce(lim, 500));
$$;

grant execute on function public.buscar_alimentos(text, int) to service_role;
grant execute on function public.buscar_ejercicios(text, text, text, int) to service_role;

-- 4. Integridad: a lo sumo un ayuno abierto (fin IS NULL). Cierra duplicados previos
--    (deja el más reciente) antes de crear el índice único parcial.
update ayunos set fin = now()
where fin is null
  and id not in (select id from ayunos where fin is null order by inicio desc limit 1);

create unique index if not exists ayunos_un_solo_abierto
  on ayunos ((fin is null)) where fin is null;
