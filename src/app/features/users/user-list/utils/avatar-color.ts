const AVATAR_PALETTE = [
  '#2E6DA4',
  '#3A8A3F',
  '#8E4FB8',
  '#3A8AAE',
  '#E8A020',
  '#1E4F7A',
  '#5B6E84',
] as const;

export interface AvatarColor {
  bg: string;
  fg: string;
}

const MUTED: AvatarColor = { bg: '#E5EAF0', fg: '#9AA8B8' };

export function avatarColor(name: string, muted = false): AvatarColor {
  if (muted) return MUTED;
  const safe = name ?? '';
  let h = 0;
  for (let i = 0; i < safe.length; i++) {
    h = (h * 31 + safe.charCodeAt(i)) % AVATAR_PALETTE.length;
  }
  const base = AVATAR_PALETTE[h];
  return { bg: `${base}22`, fg: base };
}

export function avatarInitials(fullName: string): string {
  const parts = (fullName ?? '').trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase();
}
