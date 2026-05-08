import { CategoryStatus } from './category-status.model';

export interface Category {
  id: number;
  name: string;
  description: string | null;
  status: CategoryStatus;
  documentCount: number;
  createdAt: string;
  createdBy: string;
}
