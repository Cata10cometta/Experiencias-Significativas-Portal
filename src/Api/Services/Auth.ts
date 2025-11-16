// src/Api/Services/Auth.ts
import configApi from "../Config/Config"; // tu instancia de Axios

interface TokenData {
  value: string;
  expiresAt: number;  
}

export function saveToken(token: string, expirationMinutes: number = 60) {
  const now = new Date();
  const expirationTime = now.getTime() + expirationMinutes * 60 * 1000;

  const tokenData: TokenData = {
    value: token,
    expiresAt: expirationTime,
  };

  localStorage.setItem("token", JSON.stringify(tokenData));
}

export function getToken(): string | null {
  const tokenData = localStorage.getItem("token");
  if (!tokenData) return null;

  const parsed: TokenData = JSON.parse(tokenData);
  if (new Date().getTime() > parsed.expiresAt) {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    return null;
  }

  return parsed.value;
}

export const login = async (username: string, password: string) => {
  const response = await configApi.post("/auth/login", { username, password });

  const token =
    response.data?.token ||
    response.data?.accessToken ||
    response.data?.jwt ||
    response.data?.data?.token;

  if (!token) throw new Error("No se pudo iniciar sesión: token no recibido");

  saveToken(token, 60);

  return response.data;
};
