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
