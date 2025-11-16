export interface User {
  id: number;
  code: string;
  username: string;
  state?: boolean;
  createdAt?: string;
  deletedAt?: string;
  personId?: number;
}
