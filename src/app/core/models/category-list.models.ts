import { Category } from './category.model';
import { CategoryStatus } from './category-status.model';

export type CategorySortBy = 'name' | 'createdAt';
export type CategorySortDir = 'asc' | 'desc';

export interface CategoryListResponse {
  totalCategories: number;
  activeCategories: number;
  inactiveCategories: number;
  categories: Category[];
}

export interface CreateCategoryRequest {
  name: string;
  description: string | null;
}

export interface CreateCategoryResponse {
  id: number;
  name: string;
  description: string | null;
  status: CategoryStatus;
  createdAt: string;
  message: string;
}

export interface UpdateCategoryRequest {
  name: string;
  description: string | null;
}

export interface UpdateCategoryResponse {
  id: number;
  name: string;
  description: string | null;
  status: CategoryStatus;
  message: string;
}

export interface UpdateCategoryStatusRequest {
  status: CategoryStatus;
}

export interface UpdateCategoryStatusResponse {
  id: number;
  name: string;
  status: CategoryStatus;
  message: string;
}
