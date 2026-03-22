export type AvatarOption = {
  key: string;
  label: string;
  emoji: string;
  backgroundColor: string;
};

export const AVATAR_OPTIONS: AvatarOption[] = [
  { key: 'chef', label: 'Chef', emoji: '👨‍🍳', backgroundColor: '#C7512D' },
  { key: 'ramen', label: 'Ramen', emoji: '🍜', backgroundColor: '#8B3D2F' },
  { key: 'pizza', label: 'Pizza', emoji: '🍕', backgroundColor: '#C9772D' },
  { key: 'matcha', label: 'Matcha', emoji: '🍵', backgroundColor: '#587B42' },
  { key: 'berry', label: 'Berry', emoji: '🍓', backgroundColor: '#B64056' },
  { key: 'citrus', label: 'Citrus', emoji: '🍋', backgroundColor: '#D0A11B' },
];

const DEFAULT_AVATAR = AVATAR_OPTIONS[0];

export function getAvatarOption(key: string | null | undefined) {
  return AVATAR_OPTIONS.find((option) => option.key === key) ?? DEFAULT_AVATAR;
}

export function getDisplayName(fullName: string | null | undefined, email: string | null | undefined) {
  if (fullName && fullName.trim().length > 0) {
    return fullName.trim();
  }

  if (email) {
    return email.split('@')[0];
  }

  return 'Guest cook';
}

export function getHandle(username: string | null | undefined, email: string | null | undefined) {
  if (username && username.trim().length > 0) {
    return `@${username.trim().toLowerCase()}`;
  }

  if (!email) {
    return '@guest';
  }

  return `@${email.split('@')[0].replace(/[^a-zA-Z0-9._-]/g, '')}`;
}

export function getInitials(name: string) {
  const parts = name
    .split(' ')
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return 'G';
  }

  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('');
}
