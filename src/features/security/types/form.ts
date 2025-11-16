export interface Form {
  id: number;
  name: string;
  path: string;
  description: string;
  icon: string;
  order: number;
  state?: boolean;
  createdAt?: string;
}
