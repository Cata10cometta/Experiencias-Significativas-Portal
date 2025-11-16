export interface Grade {
  id: number;
  name: string;
  code: string;
  description: string;
  state?: boolean; // Estado activo/inactivo
  createdAt?: string;
  deletedAt?: string;
}
