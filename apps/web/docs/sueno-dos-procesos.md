# Modulo Sueno: modelo de dos procesos

Modulo de `/os/salud/sueno`. Implementa el **modelo de dos procesos de regulacion
del sueno** (Borbely, 1982) para producir tres cosas: la deuda de sueno, las
ventanas de energia del dia y un **plan concreto para pagar la deuda**.

La tercera es la razon de existir del modulo. Una deuda que solo sube no es
informacion, es culpa con decimales. Aqui cada hora de deuda se traduce en horas
de cama, una hora de corte de cafeina y una fecha de salida.

## 1. El modelo

| Concepto en el OS | Nombre cientifico | Que es |
|---|---|---|
| Deuda de sueno | Proceso S (homeostasis) | Presion de sueno que se acumula durante la vigilia y se disipa durmiendo. Correlato: adenosina. |
| Ventanas de energia | Proceso C (circadiano) | Oscilacion de ~24 h del nucleo supraquiasmatico. Manda los picos y los valles pase lo que pase con S. |

`Alerta(t) = C(t) - 1.3 * S(t) - inercia(t)`, escalado a 0-100.

### Proceso S

Exponencial saturante en las dos direcciones:

- Vigilia: `S = 1 - (1 - S0) * e^(-t/18.2h)`
- Sueno: `S = S0 * e^(-t/4.2h)`

Las constantes de tiempo son las clasicas de Borbely / Daan-Beersma. Dormir menos
de lo necesario sube el S con el que amaneces, y ese piso mas alto es lo que se
siente como deuda.

### Proceso C

`C(t) = cos(w(t - Tmin - 12)) + 0.5 * cos(2w(t - Tmin - 4.5))`, normalizado a 0-1,
con `w = 2pi/24` y `Tmin` (minimo termico) dos horas antes de la hora habitual de
despertar. El segundo armonico no es decorativo: es lo que produce el bajon de
tarde y la zona de mantenimiento de vigilia de la noche.

Los coeficientes se ajustaron contra cuatro anclajes empiricos, y hay tests que
fallan si el modelo deja de cumplirlos (`modelo.test.ts`):

| Anclaje | Cuando | Tolerancia del test |
|---|---|---|
| Inercia del sueno | 0 a 90 min post-despertar | la alerta debe subir en la primera hora |
| Pico de enfoque | 3 a 5 h post-despertar | 3 a 5.5 h |
| Bajon de tarde | 7 a 9 h post-despertar | 6.5 a 9.5 h |
| Segundo aire | 12 a 14 h post-despertar | 11 a 14.5 h, y nunca por encima del pico matutino |

El indice 0-100 usa una ventana de referencia **fija**, no normalizada por dia:
un dia con deuda tiene que verse mas bajo que uno descansado, no igual de alto.

## 2. Deuda de sueno

Suma de los deficits de las ultimas 14 noches, donde **dormir de mas paga deuda**.

- Dias sin registro cuentan como **neutros** (delta 0) y se reportan aparte.
  Inventar un deficit seria castigar por no medir; asumir la necesidad completa
  seria mentir al reves.
- Tope: 2.5 veces la necesidad diaria (20 h con necesidad de 8 h). Cuando se
  toca, el UI avisa que el numero real es mayor.
- Objetivo por defecto: 2 h, no cero. Perseguir el cero produce ansiedad, no
  descanso.

### Necesidad individual

Percentil 90 de las noches registradas, acotado a [6, 10] h, con minimo de 14
noches de historico. **No** el promedio: el promedio de alguien con deuda cronica
devuelve su deficit como si fuera su necesidad, y el sistema queda calibrado para
mantenerlo cansado.

## 3. Plan de pago

Reglas (en `lib/sueno/plan.ts`, todas con test):

1. Techo por noche: **45 min** de adelanto de la hora de acostarse + **30 min** de
   estiramiento del despertar. Mas que eso el cuerpo no lo aprovecha.
2. Se prefiere adelantar la cama antes que estirar el despertar: el despertar es
   el ancla del ritmo circadiano.
3. Siesta solo con deuda >= 2 h, centrada en el bajon y terminando al menos 7 h
   antes de acostarse. 20 min por defecto; 90 min (ciclo completo) con deuda >= 8 h.
4. Horizonte de 14 noches. Si no se llega, se dice que no se llega.

Salida: tabla noche por noche con la deuda restante, y una lista de acciones con
prioridad y hora concreta (cama, despertar, siesta, corte de cafeina, luz de la
manana, luces bajas en la ventana de melatonina, One Domino dentro del pico,
consistencia de fin de semana).

## 4. Cafeina

Decaimiento exponencial con vida media configurable (default 5.7 h; el rango real
va de 2 a 12 h segun el CYP1A2). La cafeina **no reduce la deuda**: bloquea los
receptores de adenosina y enmascara el Proceso S, que sigue subiendo por debajo.
Por eso solo se usa para calcular la hora de corte, nunca para ajustar la curva.

`horaCorte` resuelve el decaimiento inverso: hasta que hora se puede tomar una
dosis de referencia (95 mg) y llegar a la cama por debajo del umbral (default
50 mg), descontando lo que ya hay en el cuerpo.

## 5. Datos

### Tablas (migracion `20260806000000_sueno_dos_procesos.sql`)

| Tabla | Contenido |
|---|---|
| `sueno_config` | Fila unica: necesidad, horarios, deuda objetivo, siestas, parametros de cafeina. |
| `sueno_sesiones` | Cada episodio con horarios reales. `fecha` = dia de **despertar**. Unique en `inicio` para que el sync externo sea idempotente. |
| `cafeina_log` | Dosis con hora y mg. |

`biometricas_dia.sueno_min` (que ya recibe el sync de Google Health) se usa como
**respaldo**: da duracion pero no horarios, asi que sirve para la deuda y no para
anclar el Proceso C. Cuando hay sesion registrada para un dia, la sesion manda.

### Endpoints

| Ruta | Metodos | Notas |
|---|---|---|
| `/api/os/salud/sueno` | GET, POST, DELETE | Sesiones. POST acepta una o un batch `{sesiones:[...]}`, upsert por `inicio`. GET y POST aceptan `X-OS-Token`. |
| `/api/os/salud/sueno/config` | GET, PATCH | Fila unica, se crea sola. |
| `/api/os/salud/sueno/cafeina` | GET, POST, DELETE | POST acepta `mg` o `bebida` del catalogo. |
| `/api/os/salud/sueno/hoy` | GET | Corre el modelo completo. Acepta `X-OS-Token` (brief de la manana por n8n). |

`/hoy` devuelve `config`, `necesidad`, `deuda`, `anclas`, `curva`, `ahora`,
`ventanas`, `siesta`, `cafeina`, `sesiones`, `plan` y `resumen` (una linea lista
para Telegram).

### Como simula S el endpoint

Simula 14 dias reales de vigilia y sueno hasta el despertar de hoy. Los dias sin
registro se rellenan con una noche tipica en el horario configurado: dejarlos como
vigilia pura llevaria S a 1 y pintaria un dia catastrofico por el solo hecho de no
haber medido.

Si hay sesion principal registrada para hoy, el **despertar real** manda sobre el
configurado. El modelo tiene que describir el dia que esta pasando.

## 6. Ingesta externa (n8n / Google Health)

Mismo patron que `contrato-biometricas.md`. El flujo de Google Health que lea
`Sleep Session` debe mandar horarios, no solo duracion:

```bash
curl -X POST "https://franciscoabad.com/api/os/salud/sueno" \
  -H "Content-Type: application/json" \
  -H "X-OS-Token: $OS_API_TOKEN" \
  -d '{
    "sesiones": [
      { "inicio": "2026-08-05T23:20:00-05:00", "fin": "2026-08-06T06:50:00-05:00", "minutos": 421, "fuente": "google_health" }
    ]
  }'
```

- `minutos` es el tiempo **dormido** (los wearables descuentan despertares). Si no
  viene, se usa `fin - inicio`.
- `fecha` se deriva del dia local de `fin` si no se manda.
- Reenviar la misma sesion actualiza la fila, no duplica.

Brief de la manana:

```bash
curl "https://franciscoabad.com/api/os/salud/sueno/hoy" -H "X-OS-Token: $OS_API_TOKEN" | jq -r .resumen
```

## 7. Tests

`npm run test:sueno` (runner nativo de Node, sin framework). Cubre las cuatro
piezas del motor: modelo, deuda, ventanas, cafeina y plan.

## 8. Limites honestos

- El modelo **predice la forma del dia**, no mide alerta. El valor absoluto del
  indice no significa nada fuera de compararlo consigo mismo.
- Sin datos de luz real, el Proceso C se ancla al horario de despertar. Un viaje
  de zona horaria o una semana de horarios rotos lo desalinean hasta que el
  historico se acomoda.
- La cafeina se modela como decaimiento de primer orden y una sola vida media.
  Ignora tolerancia, comida y variacion diaria.
- La deuda no distingue calidad ni arquitectura del sueno (fases). Con datos de
  fases del wearable se podria ponderar, hoy no se hace.
