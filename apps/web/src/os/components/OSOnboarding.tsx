import { useEffect, useState } from 'react';
import OSOnboardingFlow, { type Respuestas } from './onboarding/OSOnboardingFlow';
import { PASOS_OS } from './onboarding/flujoOs';

// Intro del OS (modulo 'os' de onboarding_estado). Reemplaza el wizard anterior
// (basado en os_system_state.onboarding_completed) por el framework generico de
// onboarding: se muestra una sola vez, en pantalla completa, y no vuelve a
// aparecer una vez que el modulo 'os' queda con completado_at.
//
// El wizard es confirmar-y-ajustar: antes de mostrarlo se trae el estado ya
// sembrado (semana + lineas maker) para prellenar respuestasIniciales. Si el
// prefill falla, se muestra igual el wizard vacio: nunca bloquea.
export default function OSOnboarding() {
  const [visible, setVisible] = useState(false);
  const [respuestasIniciales, setRespuestasIniciales] = useState<Respuestas>({});

  useEffect(() => {
    let cancelado = false;
    (async () => {
      try {
        const res = await fetch('/api/os/onboarding?modulo=os', { cache: 'no-store' });
        const data = await res.json();
        if (cancelado || data?.estado?.completado_at) return;

        const prefill: Respuestas = {};
        try {
          const [semanaRes, lineasRes] = await Promise.all([
            fetch('/api/os/semana', { cache: 'no-store' }),
            fetch('/api/os/lineas?maker=1', { cache: 'no-store' }),
          ]);
          const semana = await semanaRes.json().catch(() => null);
          const lineas = await lineasRes.json().catch(() => null);

          if (Array.isArray(semana?.dias)) {
            prefill.dias_maker = semana.dias.filter((d: any) => d.modo === 'maker').map((d: any) => d.dia);
            prefill.dias_off = semana.dias.filter((d: any) => d.modo === 'off').map((d: any) => d.dia);
            prefill.dias_sale = semana.dias.filter((d: any) => d.sale === true).map((d: any) => d.dia);
          }
          if (Array.isArray(semana?.balance)) {
            const presupuesto: Record<string, number> = {};
            for (const b of semana.balance) {
              if (b?.funcion && b.horas_objetivo != null) presupuesto[b.funcion] = b.horas_objetivo;
            }
            if (Object.keys(presupuesto).length) prefill.presupuesto = presupuesto;
          }
          if (Array.isArray(lineas?.lineas)) {
            prefill.lineas_maker = lineas.lineas.map((l: any) => l.nombre);
          }
        } catch {
          // Sin prefill: el wizard se muestra vacio, no bloquea.
        }

        if (!cancelado) {
          setRespuestasIniciales(prefill);
          setVisible(true);
        }
      } catch {
        // Si falla la carga del estado, no forzamos el wizard.
      }
    })();
    return () => { cancelado = true; };
  }, []);

  if (!visible) return null;

  return (
    <OSOnboardingFlow
      modulo="os"
      pasos={PASOS_OS}
      respuestasIniciales={respuestasIniciales}
      onFinish={() => setVisible(false)}
      onCompletar={async () => {
        const res = await fetch('/api/os/onboarding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ aplicar: 'os' }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error);
      }}
    />
  );
}
