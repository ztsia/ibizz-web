export function formatNumber(
  value: number | string | null | undefined,
): string {
  if (value === null || value === undefined || value === '') {
    return '—';
  }
  const num = Number(String(value).replaceAll(',', ''));
  if (Number.isNaN(num)) {
    return String(value);
  }
  return num.toLocaleString('en-US');
}

export function normalizeString(value: string): string {
  if (!value) return '';
  const str = String(value);

  // 1. Replace underscores and hyphens with spaces
  // 2. Insert space before capital letters (for camelCase/PascalCase)
  // 3. Trim and normalize spaces
  const spaced = str
    .replaceAll(/[-_]/g, ' ')
    .replaceAll(/([a-z])([A-Z])/g, '$1 $2')
    .trim();

  // 4. Title Case
  return spaced
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
