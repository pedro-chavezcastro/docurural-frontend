import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { STATUS_LABELS, UserStatus } from '../../../../core/models/user-status.model';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="status-badge" [class]="'status-badge--' + status().toLowerCase()">
      <span class="status-badge__dot" aria-hidden="true"></span>
      {{ label() }}
    </span>
  `,
  styleUrl: './status-badge.component.scss',
})
export class StatusBadgeComponent {
  readonly status = input.required<UserStatus>();
  protected readonly label = computed(() => STATUS_LABELS[this.status()]);
}
