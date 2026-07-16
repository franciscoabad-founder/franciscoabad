import type { PasoConfig } from './OSOnboardingFlow';

// Intro breve del OS (modulo 'os'): bienvenida + mapa de modulos + CTA. No pide
// datos (sin pasos 'opciones'/'numero'): solo orienta y desaparece.
export const PASOS_OS: PasoConfig[] = [
  {
    key: 'bienvenida',
    tipo: 'intro',
    titulo: 'Bienvenido a tu sistema',
    copy: 'Este es tu centro de mando: habitos, salud, finanzas y proyectos en un solo lugar, sin pestañas sueltas.',
    ctaLabel: 'Continuar',
  },
  {
    key: 'modulos',
    tipo: 'intro',
    titulo: 'Que vas a encontrar aca',
    copy: 'Habitos y journeys para construir rutinas paso a paso. Salud para nutricion, ayuno, entrenamiento y cuerpo. Finanzas, agenda, notas y tareas para el resto de tu operacion diaria.',
    ctaLabel: 'Entendido',
  },
  {
    key: 'cta',
    tipo: 'intro',
    titulo: 'Listo para empezar?',
    copy: 'Vuelve a cualquier modulo cuando quieras. Nada se pierde.',
    ctaLabel: 'Empezar',
  },
];
