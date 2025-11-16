export interface Permission {
  id: number;
  code: string;
  name: string;
  description: string;
  state?: boolean;
  createdAt?: string;
}
