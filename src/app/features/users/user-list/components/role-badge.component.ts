import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Role, ROLE_LABELS } from '../../../../core/models/role.model';

@Component({
  selector: 'app-role-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="role-badge" [class]="'role-badge--' + role().toLowerCase()">
      <span class="role-badge__dot" aria-hidden="true"></span>
      {{ label() }}
    </span>
  `,
  styleUrl: './role-badge.component.scss',
})
export class RoleBadgeComponent {
  readonly role = input.required<Role>();
  protected readonly label = computed(() => ROLE_LABELS[this.role()]);
}
