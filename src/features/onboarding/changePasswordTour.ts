// features/onboarding/changePasswordTour.ts
import { Step } from 'react-joyride';

export const changePasswordTourSteps: Step[] = [
  {
    target: '.change-password-current',
    title: 'Tu contraseña actual',
    content: 'Ingresa la contraseña que usas hoy para validar que eres tú.',
    placement: 'top',
    disableBeacon: true,
  },
  {
    target: '.change-password-new',
    title: 'Nueva contraseña',
    content: 'Crea una clave segura combinando letras, números y un carácter especial.',
    placement: 'top',
  },
  {
    target: '.change-password-rules',
    title: 'Requisitos de seguridad',
    content: 'Confirma que cada regla se marca en verde antes de continuar.',
    placement: 'left',
  },
  {
    target: '.change-password-confirm',
    title: 'Confirma la nueva clave',
    content: 'Repite la nueva contraseña para asegurarnos de que no haya errores.',
    placement: 'top',
  },
  {
    target: '.change-password-actions',
    title: 'Guardar cambios',
    content: 'Cuando todo esté listo, guarda los cambios o cancela si quieres salir.',
    placement: 'top',
  },
];

export const changePasswordTourLocale = {
  back: 'Atrás',
  close: 'Cerrar',
  last: 'Finalizar',
  next: 'Siguiente',
  skip: 'Saltar',
};

export const changePasswordTourStyles = {
  options: {
    zIndex: 1100,
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
