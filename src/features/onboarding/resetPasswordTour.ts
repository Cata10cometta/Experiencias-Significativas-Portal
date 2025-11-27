// features/onboarding/resetPasswordTour.ts
import { Step } from 'react-joyride';

export const resetPasswordTourSteps: Step[] = [
  {
    target: '.reset-header',
    title: 'Restaurar contraseña',
    content: 'Aquí puedes recuperar el acceso a tu cuenta en tres pasos sencillos.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '.reset-email',
    title: 'Correo registrado',
    content: 'Ingresa el correo electrónico con el que te registraste para recibir un código de verificación.',
    placement: 'top',
  },
  {
    target: '.reset-send-code',
    title: 'Enviar código',
    content: 'Haz clic aquí para recibir el código de verificación en tu correo.',
    placement: 'top',
  },
  {
    target: '.reset-code-inputs',
    title: 'Código de verificación',
    content: 'Ingresa el código de 6 dígitos que recibiste en tu correo.',
    placement: 'top',
  },
  {
    target: '.reset-password-input',
    title: 'Nueva contraseña',
    content: 'Crea una nueva contraseña segura siguiendo los requisitos indicados.',
    placement: 'top',
  },
  {
    target: '.reset-submit',
    title: 'Cambiar contraseña',
    content: 'Haz clic aquí para finalizar el proceso y acceder con tu nueva contraseña.',
    placement: 'top',
  },
  {
    target: '.reset-resend',
    title: '¿No recibiste el código?',
    content: 'Si no recibiste el código, haz clic aquí para reenviarlo.',
    placement: 'top',
  },
];

export const resetPasswordTourLocale = {
  back: 'Atrás',
  close: 'Cerrar',
  last: 'Finalizar',
  next: 'Siguiente',
  skip: 'Saltar',
};

export const resetPasswordTourStyles = {
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
