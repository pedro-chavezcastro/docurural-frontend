export interface CategoryColor {
  bg: string;
  fg: string;
}

const PALETTE: CategoryColor[] = [
  { bg: '#EBF3FB', fg: '#1E4F7A' },
  { bg: '#F3EAF8', fg: '#5B2779' },
  { bg: '#E6F4E7', fg: '#276B2B' },
  { bg: '#FDF3DF', fg: '#8A5E10' },
  { bg: '#E5F1F7', fg: '#1A5570' },
  { bg: '#FBEAE7', fg: '#8F2A20' },
  { bg: '#F4F6F8', fg: '#4A5A6E' },
];

const MUTED: CategoryColor = { bg: '#EEF1F4', fg: '#9AA8B8' };

export function categoryColor(name: string, muted = false): CategoryColor {
  if (muted) return MUTED;
  const safe = name ?? '';
  let h = 0;
  for (let i = 0; i < safe.length; i++) {
    h = (h * 31 + safe.charCodeAt(i)) % PALETTE.length;
  }
  return PALETTE[h];
}
