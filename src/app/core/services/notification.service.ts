import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);

  info(message: string): void {
    this.show(message, 'info-snack');
  }

  success(message: string): void {
    this.show(message, 'success-snack');
  }

  error(message: string): void {
    this.show(message, 'error-snack');
  }

  private show(message: string, panelClass: string): void {
    this.snackBar.dismiss();
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass,
    });
  }
}
