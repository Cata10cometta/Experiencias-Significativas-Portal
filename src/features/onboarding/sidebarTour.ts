// features/onboarding/sidebarTour.ts
import { Step } from 'react-joyride';

export const sidebarTourSteps: Step[] = [
  {
    target: '.sidebar-profile',
    title: 'Tu perfil',
    content: 'Aquí verás tu nombre, rol y las iniciales para identificarte rápidamente.',
    placement: 'left',
    disableBeacon: true,
  },
  {
    target: '.sidebar-home',
    title: 'Ir al inicio',
    content: 'Usa este acceso directo para regresar al tablero principal en cualquier momento.',
    placement: 'left',
  },
  {
    target: '.sidebar-change-password',
    title: 'Actualizar contraseña',
    content: 'Desde aquí puedes cambiar tu contraseña de forma segura cuando lo necesites.',
    placement: 'left',
  },
  {
    target: '.sidebar-modules',
    title: 'Módulos disponibles',
    content: 'Explora los módulos desplegables para acceder a cada sección autorizada para tu rol.',
    placement: 'left',
  },
  {
    target: '.sidebar-logout',
    title: 'Cerrar sesión',
    content: 'Cuando termines, utiliza este botón para salir de manera segura.',
    placement: 'left',
  },
];

export const sidebarTourLocale = {
  back: 'Atrás',
  close: 'Cerrar',
  last: 'Finalizar',
  next: 'Siguiente',
  skip: 'Saltar',
};

export const sidebarTourStyles = {
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
