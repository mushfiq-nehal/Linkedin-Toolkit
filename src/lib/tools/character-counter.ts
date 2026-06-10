export interface CharacterLimit {
  id: string;
  label: string;
  limit: number;
  description: string;
  warningAt: number;
}

export const CHARACTER_LIMITS: CharacterLimit[] = [
  {
    id: 'post',
    label: 'LinkedIn Post',
    limit: 3000,
    description: 'Maximum characters for a standard LinkedIn post.',
    warningAt: 2700,
  },
  {
    id: 'headline',
    label: 'LinkedIn Headline',
    limit: 220,
    description: 'Maximum characters for your professional headline.',
    warningAt: 180,
  },
  {
    id: 'about',
    label: 'About Section',
    limit: 2600,
    description: 'Maximum characters for your About / Summary section.',
    warningAt: 2300,
  },
  {
    id: 'first-name',
    label: 'First Name',
    limit: 20,
    description: 'Maximum characters for first name.',
    warningAt: 18,
  },
  {
    id: 'last-name',
    label: 'Last Name',
    limit: 40,
    description: 'Maximum characters for last name.',
    warningAt: 36,
  },
  {
    id: 'connection-message',
    label: 'Connection Message',
    limit: 300,
    description: 'Maximum characters for a connection request message.',
    warningAt: 250,
  },
  {
    id: 'recommendation',
    label: 'Recommendation',
    limit: 3000,
    description: 'Maximum characters for a LinkedIn recommendation.',
    warningAt: 2700,
  },
];

export interface CountResult {
  count: number;
  limit: number;
  remaining: number;
  percentage: number;
  status: 'ok' | 'warning' | 'error';
  words: number;
  lines: number;
}

export function countCharacters(text: string, limitId: string): CountResult {
  const limitDef = CHARACTER_LIMITS.find((l) => l.id === limitId);
  if (!limitDef) {
    throw new Error(`Unknown limit: ${limitId}`);
  }

  const count = text.length;
  const remaining = limitDef.limit - count;
  const percentage = Math.min(100, (count / limitDef.limit) * 100);
  const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  const lines = text.split('\n').length;

  let status: 'ok' | 'warning' | 'error';
  if (count > limitDef.limit) {
    status = 'error';
  } else if (count >= limitDef.warningAt) {
    status = 'warning';
  } else {
    status = 'ok';
  }

  return {
    count,
    limit: limitDef.limit,
    remaining,
    percentage,
    status,
    words,
    lines,
  };
}
