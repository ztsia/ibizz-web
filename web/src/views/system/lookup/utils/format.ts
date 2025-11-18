export function formatNumber(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') {
    return '—';
  }
  const num = Number(String(value).replace(/[,]/g, ''));
  if (Number.isNaN(num)) {
    return String(value);
  }
  return num.toLocaleString('en-US');
}
