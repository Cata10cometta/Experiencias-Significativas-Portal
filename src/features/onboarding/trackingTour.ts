// features/onboarding/trackingTour.ts
import { Step } from 'react-joyride';

export const trackingTourSteps: Step[] = [
  {
    target: '.tracking-summary-cards',
    title: 'Resumen principal',
    content: 'Consulta estos indicadores para ver cuántas instituciones y experiencias se han registrado.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '.tracking-purple-cards',
    title: 'Indicadores porcentuales',
    content: 'Estos porcentajes muestran avances clave asociados a planes de mejoramiento y participación docente.',
    placement: 'top',
  },
  {
    target: '.tracking-line-chart',
    title: 'Tendencia en el tiempo',
    content: 'El gráfico de líneas resume cómo evolucionan las experiencias nuevas y actualizaciones por mes.',
    placement: 'top',
  },
  {
    target: '.tracking-pie-chart',
    title: 'Distribución por estado',
    content: 'Visualiza la proporción de experiencias nacientes, crecientes e inspiradoras en la vigencia actual.',
    placement: 'left',
  },
  {
    target: '.tracking-pie-legend',
    title: 'Leyenda de colores',
    content: 'Identifica rápidamente qué representa cada color dentro del gráfico circular.',
    placement: 'left',
  },
];

export const trackingTourLocale = {
  back: 'Atrás',
  close: 'Cerrar',
  last: 'Finalizar',
  next: 'Siguiente',
  skip: 'Saltar',
};

export const trackingTourStyles = {
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
