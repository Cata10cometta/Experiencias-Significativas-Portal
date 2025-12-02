// features/onboarding/registerPageTour.ts
import { Step, CallBackProps, STATUS } from 'react-joyride';

export const registerPageTourSteps: Step[] = [
  {
    target: '.register-header',
    title: 'Bienvenido al registro',
    content: 'Aquí puedes crear tu cuenta para acceder al portal. Sigue los pasos para completar tu registro.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '.register-form',
    title: 'Formulario de registro',
    content: 'Completa todos los campos obligatorios con tus datos personales. Puedes ver sugerencias al escribir.',
    placement: 'top',
  },
  {
    target: '.register-dane',
    title: 'Código DANE',
    content: 'Busca o selecciona el código DANE de tu institución. Si no lo encuentras, puedes escribirlo manualmente.',
    placement: 'top',
  },
  {
    target: '.register-email-institucional',
    title: 'Correo institucional',
    content: 'Selecciona o escribe tu correo institucional. Si no aparece, escríbelo directamente.',
    placement: 'top',
  },
  {
    target: '.register-password',
    title: 'Contraseña segura',
    content: 'Elige una contraseña segura. Puedes mostrarla u ocultarla con el botón de ojo.',
    placement: 'top',
  },
  {
    target: '.register-submit',
    title: 'Finalizar registro',
    content: 'Haz clic aquí para completar tu registro. Si tienes dudas, usa el botón de ayuda.',
    placement: 'top',
  },
  {
    target: '.register-help',
    title: '¿Necesitas ayuda?',
    content: 'Si tienes problemas durante el registro, haz clic aquí para obtener asistencia.',
    placement: 'bottom',
  },
];

export const registerPageTourLocale = {
  back: 'Atrás',
  close: 'Cerrar',
  last: 'Finalizar',
  next: 'Siguiente',
  skip: 'Saltar',
};

export const registerPageTourStyles = {
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
  },
  buttonSkip: {
    color: '#a3a3a3',
    fontWeight: 700,
    fontSize: 16,
    padding: '10px 12px',
  },
  buttonClose: {
    color: '#fb923c',
    fontWeight: 700,
    fontSize: 22,
    lineHeight: 1,
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
