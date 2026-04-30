import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UsersService } from '../../../core/services/users.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { User } from '../../../core/models/user.model';
import { ApiError } from '../../../core/models/api-error.model';
import { SortBy, SortDir } from '../../../core/models/user-list.models';
import { UserStatus } from '../../../core/models/user-status.model';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { RoleBadgeComponent } from './components/role-badge.component';
import { StatusBadgeComponent } from './components/status-badge.component';
import { avatarColor, avatarInitials } from './utils/avatar-color';

type SortOption = 'fullNameAsc' | 'fullNameDesc' | 'createdAtDesc' | 'createdAtAsc';

interface SortOptionConfig {
  value: SortOption;
  label: string;
  sortBy: SortBy;
  sortDir: SortDir;
}

const SORT_OPTIONS: SortOptionConfig[] = [
  { value: 'fullNameAsc', label: 'Nombre A–Z', sortBy: 'fullName', sortDir: 'asc' },
  { value: 'fullNameDesc', label: 'Nombre Z–A', sortBy: 'fullName', sortDir: 'desc' },
  { value: 'createdAtDesc', label: 'Más recientes', sortBy: 'createdAt', sortDir: 'desc' },
  { value: 'createdAtAsc', label: 'Más antiguos', sortBy: 'createdAt', sortDir: 'asc' },
];

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    FormsModule,
    MatIconModule,
    MatMenuModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    RoleBadgeComponent,
    StatusBadgeComponent,
  ],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
})
export class UserListComponent {
  private readonly usersService = inject(UsersService);
  private readonly auth = inject(AuthService);
  private readonly notifications = inject(NotificationService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  protected readonly loading = signal(false);
  protected readonly togglingId = signal<number | null>(null);
  protected readonly users = signal<User[]>([]);
  protected readonly totalUsers = signal(0);
  protected readonly searchTerm = signal('');
  protected readonly selectedSort = signal<SortOption>('fullNameAsc');

  protected readonly sortOptions = SORT_OPTIONS;

  protected readonly currentSortLabel = computed(
    () => this.currentSortConfig().label,
  );

  protected readonly filteredUsers = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const all = this.users();
    if (!term) return all;
    return all.filter(
      (u) =>
        u.fullName.toLowerCase().includes(term) || u.email.toLowerCase().includes(term),
    );
  });

  private readonly dateFormatter = new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  private readonly dateTimeFormatter = new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  constructor() {
    this.loadUsers();
  }

  protected loadUsers(): void {
    const opt = this.currentSortConfig();
    this.loading.set(true);
    this.usersService.list(opt.sortBy, opt.sortDir).subscribe({
      next: (res) => {
        this.users.set(res.users);
        this.totalUsers.set(res.totalUsers);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        const apiError = err.error as ApiError | undefined;
        this.notifications.error(
          apiError?.message ?? 'No se pudo cargar el listado de usuarios',
        );
      },
    });
  }

  protected onSortChange(value: SortOption): void {
    this.selectedSort.set(value);
    this.loadUsers();
  }

  protected onToggleStatus(user: User): void {
    const currentUserId = this.auth.currentUser()?.id;
    const willDeactivate = user.status === 'ACTIVE';

    if (willDeactivate && currentUserId === user.id) {
      this.notifications.error('No puede desactivar su propia cuenta');
      return;
    }

    const dialogData: ConfirmDialogData = willDeactivate
      ? {
          title: 'Desactivar cuenta',
          message: `¿Está seguro de desactivar la cuenta de ${user.fullName}? El usuario no podrá acceder al sistema.`,
          confirmLabel: 'Desactivar',
          cancelLabel: 'Cancelar',
          tone: 'danger',
          icon: 'lock',
        }
      : {
          title: 'Reactivar cuenta',
          message: `¿Reactivar la cuenta de ${user.fullName}? El usuario podrá volver a iniciar sesión.`,
          confirmLabel: 'Activar',
          cancelLabel: 'Cancelar',
          tone: 'primary',
          icon: 'lock_open',
        };

    const ref = this.dialog.open<ConfirmDialogComponent, ConfirmDialogData, boolean>(
      ConfirmDialogComponent,
      { data: dialogData, width: '440px', autoFocus: 'first-tabbable' },
    );

    ref.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.applyStatusChange(user, willDeactivate ? 'INACTIVE' : 'ACTIVE');
    });
  }

  protected goToCreate(): void {
    this.router.navigate(['/users/new']);
  }

  protected goToEdit(id: number): void {
    this.router.navigate(['/users', id, 'edit']);
  }

  protected initials(name: string): string {
    return avatarInitials(name);
  }

  protected avatarStyle(name: string, muted: boolean): Record<string, string> {
    const c = avatarColor(name, muted);
    return { 'background-color': c.bg, color: c.fg };
  }

  protected formatCreated(iso: string): string {
    const d = this.parseIso(iso);
    return d ? this.dateFormatter.format(d) : '—';
  }

  protected formatLastLogin(iso: string | null): string {
    if (!iso) return 'Nunca';
    const d = this.parseIso(iso);
    return d ? this.dateTimeFormatter.format(d) : 'Nunca';
  }

  protected isMuted(user: User): boolean {
    return user.status === 'INACTIVE';
  }

  protected trackById(_index: number, user: User): number {
    return user.id;
  }

  private currentSortConfig(): SortOptionConfig {
    return SORT_OPTIONS.find((o) => o.value === this.selectedSort()) ?? SORT_OPTIONS[0];
  }

  private applyStatusChange(user: User, newStatus: UserStatus): void {
    this.togglingId.set(user.id);
    this.usersService.updateStatus(user.id, newStatus).subscribe({
      next: (res) => {
        this.togglingId.set(null);
        this.notifications.success(
          res.message ??
            (newStatus === 'ACTIVE'
              ? 'Usuario reactivado exitosamente'
              : 'Usuario desactivado exitosamente'),
        );
        this.loadUsers();
      },
      error: (err: HttpErrorResponse) => {
        this.togglingId.set(null);
        const apiError = err.error as ApiError | undefined;
        const fallback =
          newStatus === 'ACTIVE'
            ? 'No se pudo reactivar el usuario'
            : 'No se pudo desactivar el usuario';
        this.notifications.error(apiError?.message ?? fallback);
      },
    });
  }

  private parseIso(value: string): Date | null {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
}
