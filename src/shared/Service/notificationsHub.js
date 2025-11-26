import * as signalR from "@microsoft/signalr";

// Endpoint SignalR para notificaciones en tiempo real:
// Ejemplo backend: https://tuservidor/api/notificationsHub
const hubUrl = "https://tuservidor/api/notificationsHub"; // Cambia por tu endpoint real

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

  connection.on("ReceiveNotification", (notification) => {
    if (onNotification) onNotification(notification);
  });

  connection.start().catch(err => console.error("SignalR error:", err));
}

export function stopNotificationsHub() {
  if (connection) connection.stop();
}
