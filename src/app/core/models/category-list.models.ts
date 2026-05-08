import { Category } from './category.model';

export type CategorySortBy = 'name' | 'createdAt';
export type CategorySortDir = 'asc' | 'desc';

export interface CategoryListResponse {
  totalCategories: number;
  activeCategories: number;
  inactiveCategories: number;
  categories: Category[];
}
