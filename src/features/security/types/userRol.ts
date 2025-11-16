
export interface UserRole {
  id: number;
  userId: number;
  roleId: number;
  user: string;
  role: string;
  state?: boolean; // Estado activo/inactivo
  createdAt?: string;
  deletedAt?: string;
}
