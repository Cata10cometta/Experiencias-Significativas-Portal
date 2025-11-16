export interface Role {
  id: number;
  code: string;
  name: string;
  description: string;
  state?: boolean;
  createdAt?: string;
  DeletedAt?: string; 
}
