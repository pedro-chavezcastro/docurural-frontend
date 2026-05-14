import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEvent, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  DocumentListParams,
  DocumentListResponse,
} from '../models/document-list.models';
import {
  BatchUploadDocumentResponse,
  UploadDocumentResponse,
} from '../models/upload-document.models';

@Injectable({ providedIn: 'root' })
export class DocumentsService {
  private readonly http = inject(HttpClient);

  list(params: DocumentListParams): Observable<DocumentListResponse> {
    const httpParams = new HttpParams()
      .set('page', params.page)
      .set('size', params.size)
      .set('sortBy', params.sortBy)
      .set('sortDir', params.sortDir);
    return this.http.get<DocumentListResponse>(`${environment.apiBaseUrl}/documents`, {
      params: httpParams,
    });
  }

  create(formData: FormData): Observable<UploadDocumentResponse> {
    return this.http.post<UploadDocumentResponse>(
      `${environment.apiBaseUrl}/documents`,
      formData,
    );
  }

  createBatch(formData: FormData): Observable<HttpEvent<BatchUploadDocumentResponse>> {
    return this.http.post<BatchUploadDocumentResponse>(
      `${environment.apiBaseUrl}/documents/batch`,
      formData,
      { reportProgress: true, observe: 'events' },
    );
  }

  // view, download, update, delete — se implementarán en HU-11, HU-12, HU-13, HU-14
}
