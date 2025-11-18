import axios from "axios";
import { getToken } from "../Services/Auth";

let setSessionExpired: (expired: boolean) => void = () => {}; // Variable para activar el modal

// Base URL: preferir la variable de entorno VITE_API_BASE_URL, si no existe usar un valor por defecto
// Usar HTTPS por defecto porque el backend (Swagger) está en https://localhost:7263
const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || "https://localhost:7263"; // ajusta el puerto por defecto a tu backend

// Instancia de Axios
const configApi = axios.create({
  // Aseguramos que la ruta corte correctamente si el dev env trae "/api" o no.
  baseURL: API_BASE.endsWith("/") ? `${API_BASE}api/` : `${API_BASE}/api/`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para adjuntar token automáticamente
configApi.interceptors.request.use((config) => {
  try {
    const token = getToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // fallback: don't attach header
  }
  return config;
});

// Interceptor para manejar errores de respuesta
configApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log("Token expirado, activando modal...");
      setSessionExpired(true); // Activar el modal
      localStorage.removeItem("token"); // Eliminar el token
      localStorage.removeItem("userId"); // Eliminar el userId
    }
    return Promise.reject(error);
  }
);

// Función para configurar el manejador del modal
export const setSessionExpiredHandler = (handler: (expired: boolean) => void) => {
  setSessionExpired = handler;
};

// Función para guardar el token en localStorage con expiración
export const saveToken = (token: string, _p0?: number) => {
  // avoid unused parameter errors when callers pass an expiration value
  void _p0;
  localStorage.setItem("token", token);
};

export const saveUserId = (userId: number) => {
  localStorage.setItem("userId", userId.toString());
}

// Login: obtiene el token y lo guarda en localStorage con expiración
export const login = async (username: string, password: string) => {
  const response = await configApi.post("/auth/login", { username, password });
  const token = response.data?.token;
  const userId = response.data?.userId;
  if (userId) {
    saveUserId(userId);
  }
  if (token) {
    saveToken(token, 60);
  }
  return response.data;
};

// Registro de usuario normal
export const register = async (
  name: string,
  email: string,
  password: string
) => {
  const response = await configApi.post("/auth/register", { name, email, password });
  return response.data;
};



export default configApi;
