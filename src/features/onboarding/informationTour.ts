// features/onboarding/informationTour.ts
import { Step } from 'react-joyride';

export const informationTourSteps: Step[] = [
  {
    target: '.information-header',
    title: 'Gestión de evaluación',
    content: 'Aquí puedes ver el objetivo de este módulo y acceder a las herramientas de seguimiento.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '.information-summary-cards',
    title: 'Filtros rápidos',
    content: 'Usa estas tarjetas para consultar evaluaciones iniciales, finales o pendientes.',
    placement: 'bottom',
  },
  {
    target: '.information-search-bar',
    title: 'Buscar por experiencia',
    content: 'Escribe el nombre de la experiencia para filtrar la tabla rápidamente.',
    placement: 'bottom',
  },
  {
    target: '.information-table',
    title: 'Listado de evaluaciones',
    content: 'Revisa el rol, tipo de evaluación y descarga el PDF asociado a cada experiencia.',
    placement: 'top',
  },
  {
    target: '.information-pagination',
    title: 'Paginación',
    content: 'Navega entre páginas para consultar todas las evaluaciones disponibles.',
    placement: 'top',
  },
];

export const informationTourLocale = {
  back: 'Atrás',
  close: 'Cerrar',
  last: 'Finalizar',
  next: 'Siguiente',
  skip: 'Saltar',
};

export const informationTourStyles = {
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
