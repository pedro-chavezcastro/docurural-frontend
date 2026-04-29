export type Role = 'ADMIN' | 'EDITOR' | 'READER';

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Administrador',
  EDITOR: 'Editor',
  READER: 'Lector',
};
