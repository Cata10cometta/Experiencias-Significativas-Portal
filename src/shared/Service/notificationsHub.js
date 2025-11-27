import * as signalR from "@microsoft/signalr";


// Endpoint SignalR para notificaciones en tiempo real:
// Usa la base de la API del entorno para que funcione en local y despliegue
const apiBase = import.meta.env && import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL : '';
const hubUrl = `${apiBase.replace(/\/$/, '')}/notificationsHub`;

// Endpoint para solicitar edición de experiencia:
// POST /api/Experience/{id}/request-edit

let connection = null;

export function startNotificationsHub(onNotification) {
  connection = new signalR.HubConnectionBuilder()
    .withUrl(hubUrl, {
      accessTokenFactory: () => localStorage.getItem("token"), // Si usas JWT
    })
    .withAutomaticReconnect()
    .build();

  const forwardNotification = (payload, eventName) => {
    if (typeof onNotification === 'function') {
      try {
        onNotification(payload, eventName);
      } catch (callbackError) {
        console.error('startNotificationsHub callback error', callbackError);
      }
    }
  };

  [
    'ReceiveNotification',
    'ReceiveExperienceCreated',
    'ExperienceCreated',
    'ReceiveExperienceNotification',
  ].forEach((eventName) => {
    connection.on(eventName, (notification) => forwardNotification(notification, eventName));
  });

  connection.start().catch(err => console.error("SignalR error:", err));
}

export function stopNotificationsHub() {
  if (connection) connection.stop();
}
