// features/onboarding/widgetsTour.ts
import { Step } from 'react-joyride';

export const widgetsTourSteps: Step[] = [
  {
    target: '.widgets-lineas',
    title: 'Explora los ejes',
    content: 'Selecciona un eje temático para filtrar las experiencias relacionadas.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '.widgets-feature-card',
    title: 'Experiencia destacada',
    content: 'Aquí verás los detalles principales de la experiencia seleccionada.',
    placement: 'top',
  },
  {
    target: '.widgets-action-icons',
    title: 'Acciones rápidas',
    content: 'Utiliza la búsqueda para encontrar experiencias y revisa las notificaciones desde este panel.',
    placement: 'left',
  },
  {
    target: '.widgets-carousel',
    title: 'Listado de experiencias',
    content: 'Desplázate horizontalmente para revisar todas las experiencias disponibles y selecciona la que desees.',
    placement: 'top',
  },
];

export const widgetsTourLocale = {
  back: 'Atrás',
  close: 'Cerrar',
  last: 'Finalizar',
  next: 'Siguiente',
  skip: 'Saltar',
};

export const widgetsTourStyles = {
  options: {
    zIndex: 10000,
    arrowColor: '#fff',
    backgroundColor: '#fff',
    overlayColor: 'rgba(11,16,51,0.55)',
    primaryColor: '#fb923c',
    textColor: '#22223b',
    width: 420,
    borderRadius: 16,
    fontFamily: 'inherit',
    boxShadow: '0 10px 36px rgba(2, 6, 23, 0.25)',
  },
  buttonNext: {
    backgroundColor: '#fb923c',
    color: '#fff',
    fontWeight: 800,
    borderRadius: 8,
    fontSize: 18,
    padding: '10px 24px',
    border: 'none',
    boxShadow: '0 3px 10px rgba(251, 146, 60, 0.2)',
    transition: 'background 0.2s ease-in-out',
  },
  buttonBack: {
    color: '#fb923c',
    fontWeight: 700,
    fontSize: 16,
    padding: '10px 12px',
    textDecoration: 'underline',
    background: 'none',
    border: 'none',
  },
  buttonSkip: {
    color: '#a3a3a3',
    fontWeight: 700,
    fontSize: 16,
    padding: '10px 12px',
    background: 'none',
    border: 'none',
  },
  buttonClose: {
    color: '#fb923c',
    fontWeight: 700,
    fontSize: 22,
    lineHeight: 1,
    background: 'none',
    border: 'none',
  },
  tooltipTitle: {
    color: '#fb923c',
    fontWeight: 800,
    fontSize: 22,
    marginBottom: 8,
  },
  tooltipContent: {
    color: '#22223b',
    fontSize: 17,
    marginBottom: 8,
  },
};
