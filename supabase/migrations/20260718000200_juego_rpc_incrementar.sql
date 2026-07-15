-- RPC atomica para el motor de gamificacion (lib/juego/motor.ts): evita el lost update
-- de leer jugador -> calcular en JS -> update absoluto (dos escrituras concurrentes
-- pisandose). update ... returning hace la lectura+escritura en una sola sentencia.
create or replace function public.juego_incrementar(p_xp int, p_oro int, p_hp int)
returns setof jugador
language sql
as $$
  update jugador
  set xp_total = greatest(0, xp_total + p_xp),
      oro = greatest(0, oro + p_oro),
      hp = least(hp_max, greatest(0, hp + p_hp)),
      updated_at = now()
  returning *;
$$;

grant execute on function public.juego_incrementar(int, int, int) to service_role;
