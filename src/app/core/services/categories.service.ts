import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CategorySortBy, CategorySortDir, CategoryListResponse } from '../models/category-list.models';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private readonly http = inject(HttpClient);

  list(sortBy: CategorySortBy = 'name', sortDir: CategorySortDir = 'asc'): Observable<CategoryListResponse> {
    const params = new HttpParams()
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);
    return this.http.get<CategoryListResponse>(`${environment.apiBaseUrl}/categories`, { params });
  }
}
