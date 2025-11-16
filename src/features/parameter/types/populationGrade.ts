export interface PopulationGrade {
  id: number;
  name: string;
  code: string;
  state?: boolean; // Estado activo/inactivo
  createdAt?: string;
  deletedAt?: string;
}
