export interface Criteria {
  id: number;
  code: string;
  name: string;
  descriptionContribution: string;
  descruotionType: string;
  evaluationValue: string;
  state?: boolean | number | string;
  createdAt?: string;
}

