// features/onboarding/experiencesTour.ts
import { Step } from 'react-joyride';

export const experiencesTourBaseSteps: Step[] = [
  {
    target: '.experiences-header',
    title: 'Gestión de experiencias',
    content: 'Aquí encontrarás el resumen y acciones rápidas para administrar tus experiencias significativas.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '.experiences-add',
    title: 'Agregar nueva experiencia',
    content: 'Usa este botón para registrar una experiencia cuando quieras sumar un nuevo caso.',
    placement: 'left',
  },
  {
    target: '.experiences-search',
    title: 'Buscar experiencias',
    content: 'Filtra la lista escribiendo parte del nombre o el área aplicada.',
    placement: 'bottom',
  },
  {
    target: '.experiences-table',
    title: 'Listado principal',
    content: 'Consulta aquí la información clave de cada experiencia y accede a sus acciones.',
    placement: 'top',
  },
  {
    target: '.experiences-pdf',
    title: 'Documentos PDF',
    content: 'Abre el PDF de evaluación o seguimiento directamente desde este botón.',
    placement: 'top',
  },
  {
    target: '.experiences-evaluation',
    title: 'Aplicar evaluación',
    content: 'Desde aquí puedes abrir el formulario de evaluación asociado a la experiencia seleccionada.',
    placement: 'top',
  },
  {
    target: '.experiences-edit',
    title: 'Ver o editar',
    content: 'Solicita edición o revisa el detalle completo según tus permisos.',
    placement: 'top',
  },
  {
    target: '.experiences-status',
    title: 'Estado de la experiencia',
    content: 'Identifica de un vistazo si la experiencia está activa o inactiva.',
    placement: 'top',
  },
];

export const experiencesTourLocale = {
  back: 'Atrás',
  close: 'Cerrar',
  last: 'Finalizar',
  next: 'Siguiente',
  skip: 'Saltar',
};

export const experiencesTourStyles = {
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
