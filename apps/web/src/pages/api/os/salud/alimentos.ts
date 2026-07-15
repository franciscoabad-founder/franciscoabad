export const prerender = false;

import type { APIRoute } from 'astro';
import { getSupabaseServer } from '../../../../lib/supabase';
import { isOsAuthorized, json } from '../../../../os/lib/osAuth';
import { errMsg, numOrNull } from '../../../../lib/salud/apiHelpers';

const FUENTES = ['personal', 'off', 'usda', 'latam'];

interface OffProduct {
  product_name?: string;
  product_name_es?: string;
  brands?: string;
  nutriments?: Record<string, number>;
  serving_size?: string;
}

// Normaliza un producto de Open Food Facts a nuestro esquema (macros por 100 g).
function normalizarOff(barcode: string, p: OffProduct) {
  const n = p.nutriments ?? {};
  const nombre = (p.product_name_es || p.product_name || `Producto ${barcode}`).trim();
  return {
    nombre,
    marca: p.brands?.split(',')[0]?.trim() || null,
    barcode,
    fuente: 'off' as const,
    kcal: numOrNull(n['energy-kcal_100g']) ?? 0,
    proteina_g: numOrNull(n['proteins_100g']) ?? 0,
    carbos_g: numOrNull(n['carbohydrates_100g']) ?? 0,
    grasa_g: numOrNull(n['fat_100g']) ?? 0,
    fibra_g: numOrNull(n['fiber_100g']),
    porciones: [] as Array<{ medida: string; gramos: number }>,
  };
}

export const GET: APIRoute = async (context) => {
  if (!isOsAuthorized(context)) return json({ error: 'Unauthorized' }, 401);
  const { url } = context;
  const q = url.searchParams.get('q')?.trim() || '';
  const barcode = url.searchParams.get('barcode')?.trim() || '';
  try {
    const sb = getSupabaseServer();

    // 1. Búsqueda por barcode: primero local, si no está consulta Open Food Facts.
    if (barcode) {
      const { data: local, error } = await sb
        .from('alimentos')
        .select('*')
        .eq('barcode', barcode)
        .limit(1);
      if (error) throw error;
      if (local && local.length) return json({ alimentos: local, fuente: 'local' });

      // Consulta Open Food Facts server-side.
      const contacto = import.meta.env.OFF_CONTACT_EMAIL || 'contacto-no-configurado';
      try {
        const res = await fetch(
          `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json`,
          { headers: { 'User-Agent': `PanchoOS/1.0 (${contacto})` } }
        );
        if (res.ok) {
          const data = await res.json();
          if (data?.status === 1 && data?.product) {
            const nuevo = normalizarOff(barcode, data.product);
            const { data: guardado, error: insErr } = await sb
              .from('alimentos')
              .insert([nuevo])
              .select()
              .single();
            if (insErr) throw insErr;
            return json({ alimentos: [guardado], fuente: 'off' });
          }
        }
      } catch {
        // OFF no disponible: devolvemos vacío sin crashear.
      }
      return json({ alimentos: [], fuente: 'off_no_encontrado' });
    }

    // 2. Búsqueda por texto: ilike sobre nombre y marca. Tabla vacía => [].
    let query = sb.from('alimentos').select('*').order('nombre', { ascending: true }).limit(40);
    if (q) query = query.or(`nombre.ilike.%${q}%,marca.ilike.%${q}%`);
    const { data, error } = await query;
    if (error) throw error;
    return json({ alimentos: data ?? [], fuente: 'local' });
  } catch (err) {
    return json({ error: errMsg(err) }, 502);
  }
};

export const POST: APIRoute = async (context) => {
  if (!isOsAuthorized(context)) return json({ error: 'Unauthorized' }, 401);
  try {
    const body = await context.request.json();
    if (!body.nombre?.trim()) return json({ error: 'nombre requerido' }, 400);
    const fuente = body.fuente?.trim() || 'personal';
    if (!FUENTES.includes(fuente)) {
      return json({ error: `fuente debe ser una de: ${FUENTES.join(', ')}` }, 400);
    }
    const sb = getSupabaseServer();
    const { data, error } = await sb
      .from('alimentos')
      .insert([{
        nombre: body.nombre.trim(),
        marca: body.marca?.trim() || null,
        barcode: body.barcode?.trim() || null,
        fuente,
        kcal: numOrNull(body.kcal) ?? 0,
        proteina_g: numOrNull(body.proteina_g) ?? 0,
        carbos_g: numOrNull(body.carbos_g) ?? 0,
        grasa_g: numOrNull(body.grasa_g) ?? 0,
        fibra_g: numOrNull(body.fibra_g),
        porciones: Array.isArray(body.porciones) ? body.porciones : [],
      }])
      .select()
      .single();
    if (error) throw error;
    return json({ alimento: data }, 201);
  } catch (err) {
    return json({ error: errMsg(err) }, 502);
  }
};

export const DELETE: APIRoute = async (context) => {
  if (!isOsAuthorized(context)) return json({ error: 'Unauthorized' }, 401);
  const id = context.url.searchParams.get('id');
  if (!id) return json({ error: 'id requerido' }, 400);
  try {
    const sb = getSupabaseServer();
    const { error } = await sb.from('alimentos').delete().eq('id', id);
    if (error) throw error;
    return json({ ok: true });
  } catch (err) {
    return json({ error: errMsg(err) }, 502);
  }
};
