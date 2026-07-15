/**
 * seed-alimentos.ts
 *
 * Script Node ejecutable MANUALMENTE (NO en build) que inserta un set curado
 * de alimentos en Supabase de forma idempotente.
 *
 * Uso (desde apps/web/):
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *     node --experimental-strip-types scripts/seed-alimentos.ts
 *
 * Todos los macros estan expresados POR 100 g de alimento.
 * No hace ninguna llamada de red para obtener datos: todo esta hardcodeado.
 */

import { createClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

interface Porcion {
  medida: string;
  gramos: number;
}

type Fuente = 'personal' | 'off' | 'usda' | 'latam';

interface Alimento {
  nombre: string;
  marca: string | null;
  barcode: string | null;
  fuente: Fuente;
  kcal: number;
  proteina_g: number;
  carbos_g: number;
  grasa_g: number;
  fibra_g: number | null;
  porciones: Porcion[];
}

// ---------------------------------------------------------------------------
// Fabricas (evitan generics explicitos y reducen boilerplate)
// ---------------------------------------------------------------------------

function usda(
  nombre: string,
  kcal: number,
  proteina_g: number,
  carbos_g: number,
  grasa_g: number,
  fibra_g: number | null = null,
  porciones: Porcion[] = [],
): Alimento {
  return {
    nombre,
    marca: null,
    barcode: null,
    fuente: 'usda',
    kcal,
    proteina_g,
    carbos_g,
    grasa_g,
    fibra_g,
    porciones,
  };
}

function latam(
  nombre: string,
  kcal: number,
  proteina_g: number,
  carbos_g: number,
  grasa_g: number,
  fibra_g: number | null = null,
  porciones: Porcion[] = [],
): Alimento {
  return {
    nombre,
    marca: null,
    barcode: null,
    fuente: 'latam',
    kcal,
    proteina_g,
    carbos_g,
    grasa_g,
    fibra_g,
    porciones,
  };
}

// ---------------------------------------------------------------------------
// Datos USDA (FoodData Central, dominio publico) — macros por 100 g
// ---------------------------------------------------------------------------

export const usdaAlimentos: Alimento[] = [
  // --- Proteinas: aves ---
  usda('Pollo pechuga cocida sin piel', 165, 31, 0, 3.6, 0, [{ medida: '1 pechuga', gramos: 172 }]),
  usda('Pollo pechuga cruda sin piel', 120, 22.5, 0, 2.6, 0),
  usda('Pollo muslo cocido sin piel', 209, 26, 0, 10.9, 0),
  usda('Pollo muslo cocido con piel', 229, 25, 0, 14, 0),
  usda('Pollo entero asado con piel', 239, 27, 0, 13.6, 0),
  usda('Alitas de pollo cocidas', 203, 30.5, 0, 8.1, 0),
  usda('Pollo entero cocido sin piel', 190, 29, 0, 7.4, 0),
  usda('Pavo pechuga cocida', 135, 30, 0, 1, 0),
  usda('Pavo molido cocido', 203, 27, 0, 10, 0),
  usda('Pato cocido con piel', 337, 19, 0, 28, 0),
  // --- Proteinas: res, cerdo, cordero ---
  usda('Res molida 80/20 cocida', 254, 26, 0, 16, 0),
  usda('Res molida 90/10 cocida', 184, 26, 0, 8, 0),
  usda('Lomo de res cocido', 201, 29, 0, 9, 0),
  usda('Bistec de res magro cocido', 214, 30, 0, 10, 0),
  usda('Costilla de res cocida', 305, 26, 0, 22, 0),
  usda('Falda de res cocida', 250, 27, 0, 15, 0),
  usda('Higado de res cocido', 175, 27, 5.1, 4.8, 0),
  usda('Cerdo lomo cocido', 143, 26, 0, 3.5, 0),
  usda('Chuleta de cerdo cocida', 231, 26, 0, 13, 0),
  usda('Costilla de cerdo cocida', 361, 24, 0, 29, 0),
  usda('Tocino cocido', 541, 37, 1.4, 42, 0),
  usda('Cordero cocido', 258, 25, 0, 17, 0),
  // --- Proteinas: embutidos y fiambres ---
  usda('Jamon cocido', 145, 21, 1.5, 6, 0),
  usda('Jamon de pavo', 120, 17, 2, 4, 0),
  usda('Pechuga de pavo fiambre', 104, 17, 2, 3, 0),
  usda('Salchicha de cerdo cocida', 301, 19, 2, 24, 0),
  usda('Salchicha vienesa', 290, 11, 3, 26, 0),
  usda('Chorizo', 455, 24, 2, 38, 0),
  usda('Mortadela', 311, 14, 3, 27, 0),
  usda('Salami', 336, 22, 2, 26, 0),
  // --- Proteinas: pescados ---
  usda('Atun en agua enlatado', 116, 26, 0, 0.8, 0),
  usda('Atun en aceite enlatado', 198, 29, 0, 8, 0),
  usda('Atun fresco cocido', 184, 30, 0, 6.3, 0),
  usda('Salmon cocido', 206, 22, 0, 12, 0),
  usda('Salmon crudo', 208, 20, 0, 13, 0),
  usda('Tilapia cocida', 128, 26, 0, 2.7, 0),
  usda('Bacalao cocido', 105, 23, 0, 0.9, 0),
  usda('Corvina cocida', 122, 25, 0, 2, 0),
  usda('Trucha cocida', 190, 27, 0, 8.5, 0),
  usda('Merluza cocida', 90, 18, 0, 1.3, 0),
  usda('Caballa cocida', 262, 24, 0, 18, 0),
  usda('Pez espada cocido', 172, 28, 0, 5.7, 0),
  usda('Sardina en aceite enlatada', 208, 25, 0, 11, 0),
  usda('Anchoa en aceite', 210, 29, 0, 10, 0),
  // --- Proteinas: mariscos ---
  usda('Camaron cocido', 99, 24, 0.2, 0.3, 0),
  usda('Langostino cocido', 106, 20, 1, 1.7, 0),
  usda('Calamar crudo', 92, 15.6, 3, 1.4, 0),
  usda('Pulpo cocido', 164, 30, 4, 2, 0),
  usda('Mejillon cocido', 172, 24, 7, 4.5, 0),
  usda('Almeja cocida', 148, 25.5, 5, 2, 0),
  usda('Cangrejo cocido', 97, 19, 0, 1.5, 0),
  usda('Surimi', 99, 15, 6.8, 0.9, 0),
  // --- Proteinas: huevos ---
  usda('Huevo entero cocido', 155, 13, 1.1, 11, 0, [{ medida: '1 unidad', gramos: 50 }]),
  usda('Huevo entero crudo', 143, 12.6, 0.7, 9.5, 0, [{ medida: '1 unidad', gramos: 50 }]),
  usda('Clara de huevo', 52, 11, 0.7, 0.2, 0, [{ medida: '1 clara', gramos: 33 }]),
  usda('Yema de huevo', 322, 16, 3.6, 27, 0, [{ medida: '1 yema', gramos: 17 }]),
  usda('Huevo de codorniz', 158, 13, 0.4, 11, 0),

  // --- Lacteos ---
  usda('Leche entera', 61, 3.2, 4.8, 3.3, 0, [{ medida: '1 taza', gramos: 244 }]),
  usda('Leche descremada', 34, 3.4, 5, 0.1, 0, [{ medida: '1 taza', gramos: 245 }]),
  usda('Leche semidescremada 2%', 50, 3.4, 4.9, 2, 0, [{ medida: '1 taza', gramos: 244 }]),
  usda('Leche de almendras sin azucar', 15, 0.6, 0.6, 1.2, 0.3, [{ medida: '1 taza', gramos: 240 }]),
  usda('Leche de soya', 54, 3.3, 6, 1.8, 0.6, [{ medida: '1 taza', gramos: 243 }]),
  usda('Yogur griego natural', 59, 10, 3.6, 0.4, 0, [{ medida: '1 taza', gramos: 245 }]),
  usda('Yogur natural entero', 61, 3.5, 4.7, 3.3, 0, [{ medida: '1 taza', gramos: 245 }]),
  usda('Yogur natural descremado', 56, 5.7, 7.7, 0.2, 0),
  usda('Yogur de frutas', 95, 3.5, 16, 1.5, 0),
  usda('Kefir', 41, 3.3, 4.8, 1, 0),
  usda('Queso fresco', 264, 17, 4, 20, 0),
  usda('Queso cheddar', 403, 25, 3.4, 33, 0),
  usda('Queso mozzarella', 300, 22, 2.2, 22, 0),
  usda('Queso parmesano', 431, 38, 4, 29, 0),
  usda('Queso gouda', 356, 25, 2.2, 27, 0),
  usda('Queso crema', 342, 6, 4, 34, 0),
  usda('Queso untable', 253, 8, 5, 22, 0),
  usda('Requeson (cottage)', 98, 11, 3.4, 4.3, 0, [{ medida: '1 taza', gramos: 226 }]),
  usda('Mantequilla', 717, 0.9, 0.1, 81, 0, [{ medida: '1 cucharada', gramos: 14 }]),
  usda('Crema de leche', 340, 2.8, 3.4, 36, 0),
  usda('Crema agria', 198, 2.4, 4.6, 19, 0),
  usda('Leche condensada', 321, 8, 54, 8.7, 0),
  usda('Helado de vainilla', 207, 3.5, 24, 11, 0.7),

  // --- Granos y cereales ---
  usda('Arroz blanco cocido', 130, 2.7, 28, 0.3, 0.4, [{ medida: '1 taza', gramos: 158 }]),
  usda('Arroz integral cocido', 123, 2.7, 26, 1, 1.6, [{ medida: '1 taza', gramos: 195 }]),
  usda('Arroz blanco crudo', 365, 7, 80, 0.7, 1.3),
  usda('Avena en hojuelas cruda', 389, 17, 66, 7, 10),
  usda('Avena cocida', 71, 2.5, 12, 1.5, 1.7, [{ medida: '1 taza', gramos: 234 }]),
  usda('Quinua cocida', 120, 4.4, 21, 1.9, 2.8, [{ medida: '1 taza', gramos: 185 }]),
  usda('Quinua cruda', 368, 14, 64, 6, 7),
  usda('Pasta cocida', 158, 5.8, 31, 0.9, 1.8, [{ medida: '1 taza', gramos: 140 }]),
  usda('Pasta integral cocida', 149, 6, 30, 1.7, 4),
  usda('Fideo cabello de angel cocido', 158, 5.8, 31, 0.9, 1.8),
  usda('Pan blanco', 265, 9, 49, 3.2, 2.7, [{ medida: '1 rebanada', gramos: 28 }]),
  usda('Pan integral', 247, 13, 41, 3.4, 7, [{ medida: '1 rebanada', gramos: 28 }]),
  usda('Pan de molde', 267, 9, 50, 3.3, 2.4),
  usda('Pan pita', 275, 9, 55, 1.2, 2.2),
  usda('Pan de hamburguesa', 250, 9, 44, 4, 2),
  usda('Bagel', 250, 10, 48, 1.5, 2),
  usda('Tortilla de maiz', 218, 5.7, 45, 2.9, 6, [{ medida: '1 unidad', gramos: 24 }]),
  usda('Tortilla de harina', 306, 8, 51, 7.5, 3, [{ medida: '1 unidad', gramos: 45 }]),
  usda('Cereal de maiz (corn flakes)', 357, 7, 84, 0.4, 3),
  usda('Granola', 471, 10, 64, 20, 7),
  usda('Barra de granola', 471, 8, 64, 20, 5),
  usda('Harina de trigo blanca', 364, 10, 76, 1, 2.7),
  usda('Harina de trigo integral', 340, 13, 72, 2.5, 11),
  usda('Harina de maiz', 361, 7, 76, 3.9, 7),
  usda('Maicena (almidon de maiz)', 381, 0.3, 91, 0.1, 0.9),
  usda('Couscous cocido', 112, 3.8, 23, 0.2, 1.4),
  usda('Cebada perlada cocida', 123, 2.3, 28, 0.4, 3.8),
  usda('Bulgur cocido', 83, 3, 19, 0.2, 4.5),
  usda('Palomitas de maiz', 387, 13, 78, 4.5, 15),
  usda('Pan rallado', 395, 13, 72, 5.3, 4.5),
  usda('Galleta de soda', 421, 9, 74, 9, 2.6),

  // --- Legumbres ---
  usda('Lenteja cocida', 116, 9, 20, 0.4, 8, [{ medida: '1 taza', gramos: 198 }]),
  usda('Garbanzo cocido', 164, 8.9, 27, 2.6, 7.6, [{ medida: '1 taza', gramos: 164 }]),
  usda('Frijol negro cocido', 132, 8.9, 24, 0.5, 8.7, [{ medida: '1 taza', gramos: 172 }]),
  usda('Frijol rojo cocido', 127, 8.7, 23, 0.5, 6.4, [{ medida: '1 taza', gramos: 177 }]),
  usda('Frijol pinto cocido', 143, 9, 26, 0.6, 9),
  usda('Frijol blanco cocido', 139, 9.7, 25, 0.4, 6.3),
  usda('Habas cocidas', 110, 7.6, 20, 0.4, 5.4),
  usda('Arveja verde cocida', 84, 5.4, 16, 0.2, 5.5),
  usda('Soya cocida (edamame)', 141, 12, 11, 6, 5),
  usda('Tofu firme', 144, 17, 3, 9, 2),
  usda('Tofu suave', 61, 7, 2, 3.7, 0.3),
  usda('Tempeh', 192, 20, 8, 11, 0),
  usda('Guisantes secos cocidos', 118, 8, 21, 0.4, 8),

  // --- Verduras ---
  usda('Brocoli crudo', 34, 2.8, 7, 0.4, 2.6, [{ medida: '1 taza', gramos: 91 }]),
  usda('Brocoli cocido', 35, 2.4, 7.2, 0.4, 3.3),
  usda('Espinaca cruda', 23, 2.9, 3.6, 0.4, 2.2, [{ medida: '1 taza', gramos: 30 }]),
  usda('Espinaca cocida', 23, 3, 3.8, 0.3, 2.4),
  usda('Zanahoria cruda', 41, 0.9, 10, 0.2, 2.8, [{ medida: '1 unidad', gramos: 61 }]),
  usda('Zanahoria cocida', 35, 0.8, 8, 0.2, 3),
  usda('Tomate', 18, 0.9, 3.9, 0.2, 1.2, [{ medida: '1 unidad', gramos: 123 }]),
  usda('Tomate cherry', 18, 0.9, 3.9, 0.2, 1.2),
  usda('Lechuga', 15, 1.4, 2.9, 0.2, 1.3, [{ medida: '1 taza', gramos: 47 }]),
  usda('Pepino', 15, 0.7, 3.6, 0.1, 0.5, [{ medida: '1 taza', gramos: 104 }]),
  usda('Pimiento rojo', 31, 1, 6, 0.3, 2.1, [{ medida: '1 unidad', gramos: 119 }]),
  usda('Pimiento verde', 20, 0.9, 4.6, 0.2, 1.7),
  usda('Cebolla', 40, 1.1, 9.3, 0.1, 1.7, [{ medida: '1 unidad', gramos: 110 }]),
  usda('Cebolla morada', 40, 1.1, 9.3, 0.1, 1.7),
  usda('Cebollin', 32, 1.8, 7.3, 0.7, 2.5),
  usda('Ajo', 149, 6.4, 33, 0.5, 2.1, [{ medida: '1 diente', gramos: 3 }]),
  usda('Calabacin (zucchini)', 17, 1.2, 3.1, 0.3, 1, [{ medida: '1 taza', gramos: 124 }]),
  usda('Coliflor', 25, 1.9, 5, 0.3, 2, [{ medida: '1 taza', gramos: 107 }]),
  usda('Aguacate', 160, 2, 8.5, 15, 6.7, [{ medida: '1 unidad', gramos: 150 }]),
  usda('Champiñon', 22, 3.1, 3.3, 0.3, 1, [{ medida: '1 taza', gramos: 70 }]),
  usda('Berenjena', 25, 1, 6, 0.2, 3, [{ medida: '1 taza', gramos: 82 }]),
  usda('Apio', 16, 0.7, 3, 0.2, 1.6, [{ medida: '1 tallo', gramos: 40 }]),
  usda('Esparrago', 20, 2.2, 3.9, 0.1, 2.1),
  usda('Col (repollo)', 25, 1.3, 6, 0.1, 2.5),
  usda('Col morada', 31, 1.4, 7.4, 0.2, 2.1),
  usda('Coles de bruselas', 43, 3.4, 9, 0.3, 3.8),
  usda('Acelga', 19, 1.8, 3.7, 0.2, 1.6),
  usda('Kale (col rizada)', 49, 4.3, 9, 0.9, 3.6),
  usda('Remolacha', 43, 1.6, 10, 0.2, 2.8),
  usda('Rabano', 16, 0.7, 3.4, 0.1, 1.6),
  usda('Nabo', 28, 0.9, 6.4, 0.1, 1.8),
  usda('Vainita (ejotes)', 31, 1.8, 7, 0.2, 3.4),
  usda('Maiz dulce', 86, 3.2, 19, 1.4, 2.7, [{ medida: '1 taza', gramos: 154 }]),
  usda('Palmito', 28, 2.5, 4.6, 0.6, 2.4),
  usda('Alcachofa', 47, 3.3, 11, 0.2, 5.4),
  usda('Perejil', 36, 3, 6, 0.8, 3.3),
  usda('Cilantro', 23, 2.1, 3.7, 0.5, 2.8),

  // --- Frutas ---
  usda('Banano', 89, 1.1, 23, 0.3, 2.6, [{ medida: '1 unidad mediana', gramos: 118 }]),
  usda('Manzana', 52, 0.3, 14, 0.2, 2.4, [{ medida: '1 unidad', gramos: 182 }]),
  usda('Naranja', 47, 0.9, 12, 0.1, 2.4, [{ medida: '1 unidad', gramos: 131 }]),
  usda('Fresa', 32, 0.7, 7.7, 0.3, 2, [{ medida: '1 taza', gramos: 152 }]),
  usda('Mango', 60, 0.8, 15, 0.4, 1.6, [{ medida: '1 taza', gramos: 165 }]),
  usda('Papaya', 43, 0.5, 11, 0.3, 1.7, [{ medida: '1 taza', gramos: 145 }]),
  usda('Piña', 50, 0.5, 13, 0.1, 1.4, [{ medida: '1 taza', gramos: 165 }]),
  usda('Sandia', 30, 0.6, 7.6, 0.2, 0.4, [{ medida: '1 taza', gramos: 152 }]),
  usda('Uva', 69, 0.7, 18, 0.2, 0.9, [{ medida: '1 taza', gramos: 151 }]),
  usda('Pera', 57, 0.4, 15, 0.1, 3.1, [{ medida: '1 unidad', gramos: 178 }]),
  usda('Arandano', 57, 0.7, 14, 0.3, 2.4, [{ medida: '1 taza', gramos: 148 }]),
  usda('Frambuesa', 52, 1.2, 12, 0.7, 6.5),
  usda('Mora', 43, 1.4, 10, 0.5, 5.3),
  usda('Durazno', 39, 0.9, 10, 0.3, 1.5, [{ medida: '1 unidad', gramos: 150 }]),
  usda('Ciruela', 46, 0.7, 11, 0.3, 1.4),
  usda('Cereza', 63, 1.1, 16, 0.2, 2.1),
  usda('Kiwi', 61, 1.1, 15, 0.5, 3, [{ medida: '1 unidad', gramos: 69 }]),
  usda('Melon', 34, 0.8, 8, 0.2, 0.9),
  usda('Limon', 29, 1.1, 9, 0.3, 2.8),
  usda('Mandarina', 53, 0.8, 13, 0.3, 1.8, [{ medida: '1 unidad', gramos: 88 }]),
  usda('Toronja', 42, 0.8, 11, 0.1, 1.6),
  usda('Granada', 83, 1.7, 19, 1.2, 4),
  usda('Higo', 74, 0.8, 19, 0.3, 2.9),
  usda('Datil', 277, 1.8, 75, 0.2, 6.7),
  usda('Pasa', 299, 3.1, 79, 0.5, 3.7),
  usda('Coco fresco', 354, 3.3, 15, 33, 9),
  usda('Maracuya', 97, 2.2, 23, 0.7, 10),
  usda('Guayaba', 68, 2.6, 14, 1, 5.4),

  // --- Grasas, frutos secos y semillas ---
  usda('Aceite de oliva', 884, 0, 0, 100, 0, [{ medida: '1 cucharada', gramos: 14 }]),
  usda('Aceite de coco', 862, 0, 0, 100, 0),
  usda('Aceite vegetal', 884, 0, 0, 100, 0),
  usda('Aceite de girasol', 884, 0, 0, 100, 0),
  usda('Almendra', 579, 21, 22, 50, 12.5, [{ medida: '1 puño', gramos: 28 }]),
  usda('Nuez', 654, 15, 14, 65, 6.7),
  usda('Nuez de la india (maranon)', 553, 18, 30, 44, 3.3),
  usda('Pistacho', 560, 20, 28, 45, 10),
  usda('Avellana', 628, 15, 17, 61, 9.7),
  usda('Mani (cacahuate)', 567, 26, 16, 49, 8.5),
  usda('Mantequilla de mani', 588, 25, 20, 50, 6, [{ medida: '1 cucharada', gramos: 16 }]),
  usda('Mantequilla de almendra', 614, 21, 19, 56, 10),
  usda('Semilla de chia', 486, 17, 42, 31, 34, [{ medida: '1 cucharada', gramos: 12 }]),
  usda('Semilla de girasol', 584, 21, 20, 51, 8.6),
  usda('Semilla de calabaza', 559, 30, 11, 49, 6),
  usda('Semilla de linaza', 534, 18, 29, 42, 27),
  usda('Ajonjoli (sesamo)', 573, 18, 23, 50, 12),
  usda('Margarina', 717, 0.2, 0.7, 81, 0),
  usda('Mayonesa', 680, 1, 0.6, 75, 0),
  usda('Aceituna', 115, 0.8, 6, 11, 3.2),

  // --- Tuberculos ---
  usda('Papa cocida', 87, 1.9, 20, 0.1, 1.8, [{ medida: '1 unidad', gramos: 173 }]),
  usda('Papa cruda', 77, 2, 17, 0.1, 2.1),
  usda('Pure de papa', 83, 2, 12, 3.4, 1.2),
  usda('Papa frita', 312, 3.4, 41, 15, 3.8),
  usda('Camote (batata) cocido', 90, 2, 21, 0.2, 3.3, [{ medida: '1 taza', gramos: 200 }]),
  usda('Yuca cocida', 160, 1.4, 38, 0.3, 1.8),
  usda('Name', 118, 1.5, 28, 0.2, 4.1),
  usda('Malanga', 142, 2, 34, 0.2, 1.5),

  // --- Azucares, snacks, salsas y varios ---
  usda('Azucar blanca', 387, 0, 100, 0, 0, [{ medida: '1 cucharada', gramos: 12 }]),
  usda('Azucar morena', 380, 0, 98, 0, 0),
  usda('Miel', 304, 0.3, 82, 0, 0.2, [{ medida: '1 cucharada', gramos: 21 }]),
  usda('Panela', 380, 0.7, 98, 0.1, 0),
  usda('Chocolate negro 70%', 598, 7.8, 46, 43, 11),
  usda('Chocolate con leche', 535, 7.6, 59, 30, 3.4),
  usda('Cacao en polvo', 228, 20, 58, 14, 33),
  usda('Nutella (crema de avellana)', 539, 6, 58, 31, 3),
  usda('Galleta dulce', 480, 5, 65, 22, 2),
  usda('Papas fritas snack', 536, 7, 53, 35, 4.4),
  usda('Croissant', 406, 8, 46, 21, 2.6),
  usda('Dona (donut)', 452, 5, 51, 25, 1.5),
  usda('Muffin', 377, 6, 55, 15, 1.9),
  usda('Pizza margarita', 266, 11, 33, 10, 2.3),
  usda('Cafe negro sin azucar', 1, 0.1, 0, 0, 0),
  usda('Te negro sin azucar', 1, 0, 0.3, 0, 0),
  usda('Mermelada', 278, 0.4, 69, 0.1, 1),
  usda('Sirope de maple', 260, 0, 67, 0.1, 0),
  usda('Ketchup', 101, 1.7, 27, 0.1, 0.3),
  usda('Mostaza', 66, 4, 6, 3.3, 3.3),
  usda('Salsa de soya', 60, 8, 6, 0.1, 0.8),
  usda('Salsa de tomate para pasta', 29, 1.3, 7, 0.2, 1.5),
  usda('Vinagre', 18, 0, 0.9, 0, 0),
  usda('Jugo de naranja natural', 45, 0.7, 10, 0.2, 0.2),
  usda('Gaseosa cola', 42, 0, 11, 0, 0),
  usda('Levadura seca', 325, 40, 41, 7.6, 27),
  usda('Polvo de hornear', 53, 0, 28, 0, 0.2),
  usda('Caldo de pollo', 15, 1, 1, 0.5, 0),
  usda('Gelatina en polvo', 381, 8, 91, 0, 0),

  // --- Adicionales comunes ---
  usda('Nuggets de pollo', 296, 15, 18, 19, 1),
  usda('Hamburguesa de res (solo carne)', 254, 26, 0, 16, 0),
  usda('Res asada al horno', 217, 27, 0, 11, 0),
  usda('Manteca de cerdo', 902, 0, 0, 100, 0),
  usda('Leche de coco', 230, 2.3, 6, 24, 2.2),
  usda('Coco rallado seco', 660, 6.9, 24, 64, 16),
  usda('Queso ricotta', 174, 11, 3, 13, 0),
  usda('Queso suizo', 393, 27, 1.4, 31, 0),
  usda('Baguette', 274, 9, 52, 3, 2.2),
  usda('Salvado de avena', 246, 17, 66, 7, 15),
  usda('Ciruela pasa', 240, 2.2, 64, 0.4, 7),
  usda('Arandano rojo seco', 308, 0.2, 82, 1.4, 5.7),
  usda('Tomate deshidratado', 258, 14, 56, 3, 12),
  usda('Semilla de cáñamo', 553, 32, 9, 49, 4),
  usda('Espinaca baby cruda', 23, 2.9, 3.6, 0.4, 2.2),
];

// ---------------------------------------------------------------------------
// Datos LATAM / Ecuador (estimaciones dominio publico) — macros por 100 g
// Basadas en tablas de composicion INCAP y Ecuador, redondeadas.
// ---------------------------------------------------------------------------

export const latamAlimentos: Alimento[] = [
  latam('Arroz con menestra', 155, 5, 27, 3, 3),
  latam('Tigrillo', 214, 6, 25, 10, 3),
  latam('Bolon de verde', 239, 5, 30, 11, 3),
  latam('Bolon de queso', 248, 7, 28, 12, 3),
  latam('Encebollado', 83, 8, 6, 3, 1),
  latam('Seco de pollo', 152, 12, 8, 8, 1),
  latam('Seco de carne', 178, 14, 8, 10, 1),
  latam('Guatita', 161, 11, 9, 9, 1),
  latam('Fritada', 290, 20, 3, 22, 0),
  latam('Hornado', 249, 22, 2, 17, 0),
  latam('Llapingacho', 176, 4, 22, 8, 1.8),
  latam('Empanada de viento', 318, 6, 33, 18, 1.5),
  latam('Empanada de verde', 252, 6, 30, 12, 2.5),
  latam('Humita', 171, 5, 22, 7, 2),
  latam('Tamal ecuatoriano', 205, 7, 24, 9, 2),
  latam('Ceviche de camaron', 86, 12, 6, 1.5, 0.5),
  latam('Ceviche de pescado', 82, 11, 5, 2, 0.4),
  latam('Ceviche de concha', 85, 12, 7, 1, 0.4),
  latam('Patacones (tostones de verde)', 259, 2, 38, 11, 3),
  latam('Maduro frito', 182, 1.5, 35, 4, 2),
  latam('Chifles', 504, 3, 60, 28, 4),
  latam('Colada morada', 76, 1, 17, 0.4, 1),
  latam('Morocho (bebida)', 95, 3, 15, 2.5, 1),
  latam('Arroz con pollo', 161, 9, 20, 5, 1),
  latam('Menestra de lenteja', 110, 7, 17, 1.5, 5),
  latam('Menestra de frijol', 114, 7, 18, 1.5, 5),
  latam('Tortilla de verde', 234, 4, 32, 10, 3),
  latam('Corviche', 277, 8, 32, 13, 3),
  latam('Aji criollo', 40, 1.5, 5, 1.5, 1),
  latam('Mote (maiz cocido)', 121, 3, 25, 1, 3),
  latam('Choclo cocido ecuatoriano', 116, 3.5, 22, 1.5, 2.7),
  latam('Habas fritas (snack)', 415, 20, 50, 15, 12),
  latam('Chochos con tostado', 153, 12, 15, 5, 3),
  latam('Queso de hoja', 282, 18, 3, 22, 0),
  latam('Pan de yuca', 327, 8, 40, 15, 1.5),
  latam('Locro de papa', 96, 3, 12, 4, 1.2),
  latam('Caldo de bola de verde', 108, 6, 12, 4, 1.5),
  latam('Bistec de higado encebollado', 175, 22, 6, 7, 0.5),
  latam('Yaguarlocro', 117, 8, 10, 5, 1),
  latam('Cazuela de mariscos', 154, 10, 15, 6, 1.5),
  latam('Sango de verde', 149, 4, 22, 5, 2),
  latam('Repe (sopa de guineo)', 91, 3, 14, 2.5, 1.5),
  latam('Sancocho', 91, 6, 10, 3, 1.2),
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error(
      'Faltan variables de entorno. Se requieren SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.',
    );
    console.error(
      'Uso: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node --experimental-strip-types scripts/seed-alimentos.ts',
    );
    process.exit(1);
    return;
  }

  const alimentos: Alimento[] = [...usdaAlimentos, ...latamAlimentos];
  console.log(`Set curado: ${usdaAlimentos.length} usda + ${latamAlimentos.length} latam = ${alimentos.length} alimentos.`);

  const supabase = createClient(url, key, {
    auth: { persistSession: false },
  });

  // 1. Traer las claves (nombre, fuente) ya existentes para idempotencia.
  const existentes: Set<string> = new Set();
  const { data: filas, error: errSelect } = await supabase
    .from('alimentos')
    .select('nombre, fuente');

  if (errSelect) {
    console.error('Error consultando alimentos existentes:', errSelect.message);
    process.exit(1);
    return;
  }

  if (filas) {
    for (const fila of filas) {
      existentes.add(`${fila.nombre}__${fila.fuente}`);
    }
  }

  // 2. Filtrar solo los que faltan.
  const nuevos: Alimento[] = [];
  let yaExistian = 0;
  for (const alimento of alimentos) {
    const clave = `${alimento.nombre}__${alimento.fuente}`;
    if (existentes.has(clave)) {
      yaExistian += 1;
    } else {
      nuevos.push(alimento);
      // marcar para evitar duplicados internos del propio set
      existentes.add(clave);
    }
  }

  // 3. Insertar los faltantes.
  let insertados = 0;
  if (nuevos.length > 0) {
    const { error: errInsert } = await supabase.from('alimentos').insert(nuevos);
    if (errInsert) {
      console.error('Error insertando alimentos:', errInsert.message);
      process.exit(1);
      return;
    }
    insertados = nuevos.length;
  }

  console.log('---------------------------------------------');
  console.log(`Insertados: ${insertados}`);
  console.log(`Ya existian: ${yaExistian}`);
  console.log(`Total procesados: ${alimentos.length}`);
  console.log('---------------------------------------------');
  console.log('Seed completado.');
}

// Solo ejecuta el insert cuando se corre directamente (no al importar los arrays).
const esEntrada = !!process.argv[1] && import.meta.url === new URL('file://' + process.argv[1]).href;
if (esEntrada) {
  main().catch((err) => {
    console.error('Fallo inesperado:', err);
    process.exit(1);
  });
}

// ---------------------------------------------------------------------------
// Atribucion de fuentes
// ---------------------------------------------------------------------------
//
// - Alimentos con fuente 'usda': valores de USDA FoodData Central
//   (https://fdc.nal.usda.gov), datos de dominio publico del Gobierno de EE. UU.
//   Macros expresados por 100 g.
// - Alimentos con fuente 'latam': estimaciones de dominio publico basadas en las
//   tablas de composicion de alimentos del INCAP (Instituto de Nutricion de
//   Centroamerica y Panama) y en tablas de composicion de alimentos del Ecuador,
//   redondeadas y ajustadas para coherencia calorica (proteina*4 + carbos*4 +
//   grasa*9 aproxima kcal). Los valores de platos preparados son referenciales.
