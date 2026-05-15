export interface UpdateDocumentMetadataRequest {
  title: string;
  categoryId: number;
  responsibleArea: string;
  documentDate: string;
  description?: string;
}

export interface UpdateDocumentMetadataResponse {
  id: number;
  title: string;
  category: string;
  responsibleArea: string;
  documentDate: string;
  description: string | null;
  message: string;
}
