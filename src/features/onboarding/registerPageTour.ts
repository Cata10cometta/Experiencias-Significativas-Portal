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
    arrowColor: '#fff',
    backgroundColor: '#1b1333',
    overlayColor: 'rgba(11,16,51,0.7)',
    primaryColor: '#fb923c',
    textColor: '#fff',
    width: 420,
    zIndex: 10000,
    borderRadius: 16,
    fontFamily: 'inherit',
  },
  buttonNext: {
    backgroundColor: '#fb923c',
    color: '#fff',
    fontWeight: 800,
    fontSize: 18,
    borderRadius: 8,
    padding: '10px 24px',
    boxShadow: '0 2px 8px rgba(251,146,60,0.15)',
    border: 'none',
    marginLeft: 8,
    marginRight: 0,
    transition: 'background 0.2s',
  },
  buttonBack: {
    color: '#fb923c',
    background: 'none',
    fontWeight: 700,
    fontSize: 16,
    border: 'none',
    marginRight: 8,
    marginLeft: 0,
    textDecoration: 'underline',
    padding: '10px 12px',
  },
  buttonSkip: {
    color: '#a3a3a3',
    background: 'none',
    fontWeight: 700,
    fontSize: 16,
    border: 'none',
    marginRight: 16,
    marginLeft: 0,
    textDecoration: 'none',
    padding: '10px 12px',
  },
  buttonClose: {
    color: '#fb923c',
    background: 'none',
    fontWeight: 700,
    fontSize: 22,
    border: 'none',
    margin: 0,
    padding: 0,
    lineHeight: 1,
  },
};
