import { useEffect, useState } from 'react';
import OSOnboardingFlow from './onboarding/OSOnboardingFlow';
import { PASOS_OS } from './onboarding/flujoOs';

// Intro del OS (modulo 'os' de onboarding_estado). Reemplaza el wizard anterior
// (basado en os_system_state.onboarding_completed) por el framework generico de
// onboarding: se muestra una sola vez, en pantalla completa, y no vuelve a
// aparecer una vez que el modulo 'os' queda con completado_at.
export default function OSOnboarding() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let cancelado = false;
    (async () => {
      try {
        const res = await fetch('/api/os/onboarding?modulo=os', { cache: 'no-store' });
        const data = await res.json();
        if (!cancelado && !data?.estado?.completado_at) setVisible(true);
      } catch {
        // Si falla la carga, no forzamos el wizard.
      }
    })();
    return () => { cancelado = true; };
  }, []);

  if (!visible) return null;

  return <OSOnboardingFlow modulo="os" pasos={PASOS_OS} onFinish={() => setVisible(false)} />;
}
