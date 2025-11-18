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

  // Support two storage formats:
  // 1) JSON string produced by this module: { value: string, expiresAt: number }
  // 2) Plain token string (some parts of the app save token directly)
  try {
    const parsed = JSON.parse(tokenData) as TokenData;
    if (parsed && typeof parsed.value === 'string' && typeof parsed.expiresAt === 'number') {
      if (new Date().getTime() > parsed.expiresAt) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        return null;
      }
      return parsed.value;
    }
    // if parsing produced something unexpected, fall back to raw tokenData
  } catch {
    // tokenData is not JSON, treat it as raw token
  }

  // At this point treat tokenData as a raw token string
  return tokenData;
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
