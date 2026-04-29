export type UserStatus = 'ACTIVE' | 'INACTIVE';

export const STATUS_LABELS: Record<UserStatus, string> = {
  ACTIVE: 'Activo',
  INACTIVE: 'Inactivo',
};
