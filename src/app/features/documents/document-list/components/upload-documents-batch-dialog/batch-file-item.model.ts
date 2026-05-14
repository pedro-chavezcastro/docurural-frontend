export type BatchFileStatus = 'pending' | 'uploading' | 'success' | 'error';

export interface BatchFileItem {
  id: string;
  file: File;
  title: string;
  status: BatchFileStatus;
  errorMessage: string | null;
  documentId: number | null;
}
