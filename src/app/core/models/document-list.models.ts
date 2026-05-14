import { Document } from './document.model';

export type DocumentSortBy = 'createdAt' | 'title' | 'documentDate';
export type DocumentSortDir = 'asc' | 'desc';

export interface DocumentListParams {
  page: number;
  size: number;
  sortBy: DocumentSortBy;
  sortDir: DocumentSortDir;
}

export interface DocumentListResponse {
  totalDocuments: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  documents: Document[];
}
