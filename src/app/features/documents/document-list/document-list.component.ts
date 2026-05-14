import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { DocumentsService } from '../../../core/services/documents.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { Document } from '../../../core/models/document.model';
import { DocumentSortBy, DocumentSortDir } from '../../../core/models/document-list.models';
import { ApiError } from '../../../core/models/api-error.model';
import { canUploadDocument } from './utils/document-permissions';
import { formatFileSize } from './utils/file-size';
import { DocumentFormatIconComponent } from './components/document-format-icon.component';
import { DocumentCategoryPillComponent } from './components/document-category-pill.component';
import { DocumentRowActionsComponent } from './components/document-row-actions.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { IconButtonComponent } from '../../../shared/components/icon-button/icon-button.component';

type SortOption = 'createdAtDesc' | 'createdAtAsc' | 'titleAsc' | 'titleDesc' | 'documentDateDesc' | 'documentDateAsc';

interface SortOptionConfig {
  value: SortOption;
  label: string;
  sortBy: DocumentSortBy;
  sortDir: DocumentSortDir;
}

const SORT_OPTIONS: SortOptionConfig[] = [
  { value: 'createdAtDesc',    label: 'Más recientes',           sortBy: 'createdAt',    sortDir: 'desc' },
  { value: 'createdAtAsc',     label: 'Más antiguos',            sortBy: 'createdAt',    sortDir: 'asc'  },
  { value: 'titleAsc',         label: 'Título A–Z',              sortBy: 'title',        sortDir: 'asc'  },
  { value: 'titleDesc',        label: 'Título Z–A',              sortBy: 'title',        sortDir: 'desc' },
  { value: 'documentDateDesc', label: 'Fecha doc. más reciente', sortBy: 'documentDate', sortDir: 'desc' },
  { value: 'documentDateAsc',  label: 'Fecha doc. más antigua',  sortBy: 'documentDate', sortDir: 'asc'  },
];

const PAGE_SIZE = 20;

@Component({
  selector: 'app-document-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatIconModule,
    MatMenuModule,
    DocumentFormatIconComponent,
    DocumentCategoryPillComponent,
    DocumentRowActionsComponent,
    PageHeaderComponent,
    EmptyStateComponent,
    ButtonComponent,
    IconButtonComponent,
  ],
  templateUrl: './document-list.component.html',
  styleUrl: './document-list.component.scss',
})
export class DocumentListComponent {
  private readonly documentsService = inject(DocumentsService);
  private readonly notifications    = inject(NotificationService);
  private readonly auth             = inject(AuthService);

  protected readonly loading        = signal(false);
  protected readonly documents      = signal<Document[]>([]);
  protected readonly totalDocuments = signal(0);
  protected readonly totalPages     = signal(0);
  protected readonly currentPage    = signal(1);
  protected readonly selectedSort   = signal<SortOption>('createdAtDesc');

  protected readonly sortOptions      = SORT_OPTIONS;
  protected readonly currentSortLabel = computed(() => this.currentSortConfig().label);

  protected readonly currentUser = computed(() => this.auth.currentUser());
  protected readonly role        = computed(() => this.auth.currentUser()?.role ?? 'READER');

  protected readonly canUpload = computed(() => canUploadDocument(this.role()));
  protected readonly isEmpty   = computed(() => !this.loading() && this.totalDocuments() === 0);

  protected readonly pageRangeLabel = computed(() => {
    const page  = this.currentPage();
    const total = this.totalDocuments();
    if (total === 0) return '0 documentos';
    const from  = (page - 1) * PAGE_SIZE + 1;
    const to    = Math.min(page * PAGE_SIZE, total);
    return `Mostrando ${from}–${to} de ${total} documentos`;
  });

  protected readonly pageNumbers = computed(() => {
    const total   = this.totalPages();
    const current = this.currentPage();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const delta = 2;
    const range: number[] = [];
    for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
      range.push(i);
    }
    const pages: (number | null)[] = [1];
    if (range[0] > 2) pages.push(null);
    pages.push(...range);
    if (range[range.length - 1] < total - 1) pages.push(null);
    pages.push(total);
    return pages;
  });

  private readonly docDateFormatter = new Intl.DateTimeFormat('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
  private readonly loadedAtFormatter = new Intl.DateTimeFormat('es-CO', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  constructor() {
    this.loadDocuments();
  }

  protected loadDocuments(): void {
    const opt = this.currentSortConfig();
    this.loading.set(true);
    this.documentsService.list({
      page: this.currentPage(),
      size: PAGE_SIZE,
      sortBy: opt.sortBy,
      sortDir: opt.sortDir,
    }).subscribe({
      next: (res) => {
        this.documents.set(res.documents);
        this.totalDocuments.set(res.totalDocuments);
        this.totalPages.set(res.totalPages);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        const apiError = err.error as ApiError | undefined;
        this.notifications.error(
          'No se pudo cargar el listado',
          apiError?.message ?? 'Verifique su conexión e intente nuevamente.',
        );
      },
    });
  }

  protected onSortChange(value: SortOption): void {
    this.selectedSort.set(value);
    this.currentPage.set(1);
    this.loadDocuments();
  }

  protected goToFirst(): void {
    if (this.currentPage() === 1) return;
    this.currentPage.set(1);
    this.loadDocuments();
  }

  protected goToPrev(): void {
    if (this.currentPage() <= 1) return;
    this.currentPage.update((p) => p - 1);
    this.loadDocuments();
  }

  protected goToNext(): void {
    if (this.currentPage() >= this.totalPages()) return;
    this.currentPage.update((p) => p + 1);
    this.loadDocuments();
  }

  protected goToLast(): void {
    if (this.currentPage() === this.totalPages()) return;
    this.currentPage.set(this.totalPages());
    this.loadDocuments();
  }

  protected goToPage(page: number): void {
    if (page === this.currentPage()) return;
    this.currentPage.set(page);
    this.loadDocuments();
  }

  protected onView(doc: Document): void {
    this.notifications.info('Próximamente', `La visualización del documento "${doc.title}" se implementará en la HU-11.`);
  }

  protected onDownload(doc: Document): void {
    this.notifications.info('Próximamente', `La descarga de "${doc.title}" se implementará en la HU-12.`);
  }

  protected onEdit(doc: Document): void {
    this.notifications.info('Próximamente', `La edición de "${doc.title}" se implementará en la HU-13.`);
  }

  protected onDelete(doc: Document): void {
    this.notifications.info('Próximamente', `La eliminación de "${doc.title}" se implementará en la HU-14.`);
  }

  protected onUploadSingle(): void {
    this.notifications.info('Próximamente', 'La carga de documentos se implementará en la HU-09.');
  }

  protected onUploadBatch(): void {
    this.notifications.info('Próximamente', 'La carga múltiple de documentos se implementará en la HU-10.');
  }

  protected formatDocumentDate(iso: string): string {
    const d = this.parseDate(iso);
    return d ? this.docDateFormatter.format(d) : '—';
  }

  protected formatCreatedAt(iso: string): string {
    const d = this.parseDate(iso);
    return d ? this.loadedAtFormatter.format(d) : '—';
  }

  protected formatSize(bytes: number): string {
    return formatFileSize(bytes);
  }

  protected userInitials(fullName: string): string {
    return fullName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0].toUpperCase())
      .join('');
  }

  protected trackById(_index: number, doc: Document): number {
    return doc.id;
  }

  private currentSortConfig(): SortOptionConfig {
    return SORT_OPTIONS.find((o) => o.value === this.selectedSort()) ?? SORT_OPTIONS[0];
  }

  private parseDate(value: string): Date | null {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
}
