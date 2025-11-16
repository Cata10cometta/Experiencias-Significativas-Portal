export interface Criteria {
  id: number;
  name: string;
  code: string;
  descriptionContribution: string;
  descruotionType: string;
  evaluationValue: string;
  state?: boolean; // Estado activo/inactivo
  createdAt?: string;
  deletedAt?: string;
}
