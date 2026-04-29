import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';
import { RoleLabelPipe } from '../../shared/pipes/role-label.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatIconModule, RoleLabelPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  protected readonly auth = inject(AuthService);

  protected readonly currentUser = this.auth.currentUser;

  protected readonly userInitials = computed(() => {
    const name = this.currentUser()?.fullName ?? '';
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join('');
  });

  protected readonly isAdmin = computed(() => this.currentUser()?.role === 'ADMIN');

  protected readonly today = new Intl.DateTimeFormat('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  protected readonly sidebarOpen = signal(false);

  protected onLogout(): void {
    this.auth.logout().subscribe();
  }
}
