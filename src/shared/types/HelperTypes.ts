// lo que viene en cada item del enum
export interface DataSelectRequest {
  id: number;
  displayText: string;
}

// respuesta genérica de tu backend
export interface ApiResponseRequest<T> {
  data: T;
  success: boolean;
  message: string;
}
