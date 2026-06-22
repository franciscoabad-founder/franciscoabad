import type { DatosDaily } from './types';

export const datosDaily: DatosDaily = {
  principios: [
    'Accion sobre perfeccion. Publico al 70 por ciento.',
    'Un domino al dia.',
    'Lo incomodo primero.',
    'Maker y Manager separados.',
    'El sistema es mi jefe, no mi animo.',
    'El contenido es ingreso que compone.',
  ],
  rutina_am: [
    { id: 'am1', label: 'Agua + movimiento 10 minutos', duracion: '10 min', completado: false },
    { id: 'am2', label: 'Revisar One Domino del dia y escribirlo a mano', duracion: '5 min', completado: false },
    { id: 'am3', label: 'Inbox 0 rapido: solo urgentes, sin rabbit holes', duracion: '15 min', completado: false },
    { id: 'am4', label: 'Bloque Maker 1 — deep work sin interrupciones', duracion: '90 min', completado: false },
  ],
  check_10min: [
    '¿Sigo trabajando en mi One Domino?',
    '¿Hay algo que bloquea mi avance hoy?',
    '¿Necesito redirigir mi energia hacia otra prioridad?',
  ],
  pm_close: [
    { id: 'pm1', label: 'Capturar los wins del dia aunque sean pequenos', duracion: '5 min', completado: false },
    { id: 'pm2', label: 'Actualizar estado en proyectos activos', duracion: '10 min', completado: false },
    { id: 'pm3', label: 'Definir One Domino para manana', duracion: '5 min', completado: false },
    { id: 'pm4', label: 'Desconexion digital desde las 20:00', completado: false },
  ],
};
