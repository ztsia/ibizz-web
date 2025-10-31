/**
 * Convert a string to a URL-safe slug
 * @param text - Text to slugify
 */
export function slugify(text: string): string {
  if (!text) return '';

  return text
    .toString()
    .toLowerCase()
    .normalize('NFD') // Normalize unicode
    .replaceAll(/[\u0300-\u036F]/g, '') // Remove diacritics
    .replaceAll(/[^a-z0-9\s-]/g, '') // Remove special chars
    .trim()
    .replaceAll(/\s+/g, '-') // Replace spaces with hyphens
    .replaceAll(/-+/g, '-') // Replace multiple hyphens with single
    .replaceAll(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}
