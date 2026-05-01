import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function passwordMatchValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const password = group.get('password')?.value as string;
    const confirmPassword = group.get('confirmPassword')?.value as string;
    // When password is blank (edit mode, no change intended) — skip cross-check
    if (!password) return null;
    if (!confirmPassword || password !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  };
}
