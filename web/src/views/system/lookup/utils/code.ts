// Preset code format patterns
const PRESETS: Record<string, string> = {
  ALPHA_2: '^[A-Z]{2}$',
  NUMERIC: String.raw`^\d+$`,
};

export function isCodeUnique(existing: string[], code: string): boolean {
  return !existing.includes(code);
}

export function suggestNextCode(
  format: string,
  existing: string[],
): string | null {
  const pattern = PRESETS[format] || format;
  try {
    const regex = new RegExp(pattern);
    if (isAlphaFormat(pattern)) return suggestAlphaCode(pattern, existing);
    if (isNumericFormat(pattern)) return suggestNumericCode(pattern, existing);
    if (isMixedFormat(pattern)) return suggestMixedCode(pattern, existing);
    return null;
  } catch {
    return null;
  }
}

function isAlphaFormat(pattern: string): boolean {
  return /^\^\[A-Z\]\{\d+\}\$$/.test(pattern);
}

function isNumericFormat(pattern: string): boolean {
  return /^\^\\d(?:\{\d+\}|\+)\$$/.test(pattern);
}

function isMixedFormat(pattern: string): boolean {
  return /\[A-Z\].*\\d/.test(pattern);
}

function suggestAlphaCode(pattern: string, existing: string[]): string | null {
  const regex = new RegExp(pattern);
  const lengthMatch = pattern.match(/\{\d+\}/);
  if (!lengthMatch || !lengthMatch[1]) return null;
  const length = Number.parseInt(lengthMatch[1], 10);
  if (existing.length === 0) return 'A'.repeat(length);
  const sorted = [...existing].sort();
  const maxCode = sorted[sorted.length - 1];
  if (!maxCode) return null;
  const next = incrementAlpha(maxCode);
  if (next && next.length === length) return next;
  return null;
}

function incrementAlpha(code: string): string | null {
  const chars = [...code];
  let carry = true;
  for (let i = chars.length - 1; i >= 0 && carry; i--) {
    const ch = chars[i];
    if (ch === undefined) return null;
    if (ch === 'Z') {
      chars[i] = 'A';
    } else {
      chars[i] = String.fromCodePoint(ch.codePointAt(0)! + 1);
      carry = false;
    }
  }
  if (carry) return null;
  return chars.join('');
}

function suggestNumericCode(
  pattern: string,
  existing: string[],
): string | null {
  const lengthMatch = pattern.match(/\{\d+\}/);
  const fixedLength =
    lengthMatch && lengthMatch[1] ? Number.parseInt(lengthMatch[1], 10) : null;
  // lenient handling: strip non-digits from existing entries so values like
  // "AB01" become "01" and are considered when inferring next numeric code.
  if (existing.length === 0) {
    if (fixedLength) return '1'.padStart(fixedLength, '0');
    return '1';
  }
  const digitsList = existing.map((c) => String(c || '').replaceAll(/\D/g, ''));
  // compute numeric values, ignoring entries that contain no digits
  const numbers = digitsList
    .map((d) => (d === '' ? Number.NaN : Number.parseInt(d, 10)))
    .filter((n) => !Number.isNaN(n));
  const maxNum = numbers.length > 0 ? Math.max(...numbers) : 0;
  const nextNum = maxNum + 1;
  // infer padding width from regex fixedLength or observed digits length
  let observedMaxLen = 0;
  for (const d of digitsList) {
    observedMaxLen = Math.max(observedMaxLen, d.length);
  }
  const padLength = fixedLength ?? (observedMaxLen > 0 ? observedMaxLen : null);
  if (padLength) return nextNum.toString().padStart(padLength, '0');
  return nextNum.toString();
}

function suggestMixedCode(pattern: string, existing: string[]): string | null {
  if (existing.length === 0) return generateFirstMixedCode(pattern);
  const sorted = [...existing].sort();
  const maxCode = sorted[sorted.length - 1];
  if (!maxCode) return null;
  return incrementMixedCode(maxCode);
}

function generateFirstMixedCode(pattern: string): string | null {
  const alphaMatch = pattern.match(/\[A-Z\]\{(\d+)\}/);
  const alphaLength =
    alphaMatch && alphaMatch[1] ? Number.parseInt(alphaMatch[1], 10) : 2;
  const numMatch = pattern.match(/\\d\{(\d+)\}/);
  const numLength =
    numMatch && numMatch[1] ? Number.parseInt(numMatch[1], 10) : 2;
  const separatorMatch = pattern.match(/\[A-Z\]\{\d+\}(.*)\\d\{\d+\}/);
  const separator =
    separatorMatch && separatorMatch[1] ? separatorMatch[1] : '';
  const alpha = 'A'.repeat(alphaLength);
  const numeric = '0'.repeat(numLength);
  return `${alpha}${separator}${numeric}`;
}

function incrementMixedCode(code: string): string | null {
  const numMatch = code.match(/\d+$/);
  if (!numMatch) return null;
  const numPart = numMatch[0];
  const prefix = code.slice(0, code.length - numPart.length);
  const numValue = Number.parseInt(numPart, 10);
  const nextNum = numValue + 1;
  const nextStr = nextNum.toString().padStart(numPart.length, '0');
  return prefix + nextStr;
}

/**
 * Generate a code regex based on a simple format description.
 *
 * Supported formats (matching UI presets):
 * - 'Alphanumeric' : requires alphaCount alpha chars followed by numCount digits when both >0,
 *                    otherwise falls back to alphanumeric + (one or more) => /^[A-Za-z0-9]+$/
 * - 'Numeric'      : fixed-length digits based on singleCount => /^[0-9]{N}$/
 * - 'Alphabetic'   : fixed-length letters based on singleCount => /^[A-Za-z]{N}$/
 * - any other value: treated as custom/unknown and returns null
 */
export function generateCodeRegex(
  fmt?: string | null,
  alphaCount?: number,
  numCount?: number,
  singleCount?: number,
): string | null {
  if (!fmt) return null;
  if (fmt === 'Alphanumeric') {
    const a = Math.max(0, Number(alphaCount || 0) || 0);
    const n = Math.max(0, Number(numCount || 0) || 0);
    if (a > 0 && n > 0) return `^[A-Za-z]{${a}}[0-9]{${n}}$`;
    return '^[A-Za-z0-9]+$';
  }
  if (fmt === 'Numeric') {
    const c = Math.max(1, Number(singleCount || 1) || 1);
    return `^[0-9]{${c}}$`;
  }
  if (fmt === 'Alphabetic') {
    const c = Math.max(1, Number(singleCount || 1) || 1);
    return `^[A-Za-z]{${c}}$`;
  }
  return null;
}

/**
 * Produce a simple example string that matches the provided regex pattern.
 *
 * Behaviour:
 * - Strips ^/$ anchors and attempts to expand simple token patterns such as
 *   `[A-Za-z]{N}` and `[0-9]{N}` into a representative example string.
 * - Falls back to `null` when the pattern cannot be processed.
 */
export function exampleFromRegex(regexStr: string | null): string | null {
  if (!regexStr) return null;
  try {
    let ex = String(regexStr).replaceAll(/^\^|\$$/g, '');
    // common escaped and unescaped forms
    ex = ex.replaceAll(/\\\[A-Za-z\\\]\{(\d+)\}/g, (_, n) =>
      'A'.repeat(Number(n)),
    );
    ex = ex.replaceAll(/\\\[0-9\\\]\{(\d+)\}/g, (_, n) =>
      '0'.repeat(Number(n)),
    );
    ex = ex.replaceAll(/\[A-Za-z\]\{(\d+)\}/g, (_, n) => 'A'.repeat(Number(n)));
    ex = ex.replaceAll(/\[0-9\]\{(\d+)\}/g, (_, n) => '0'.repeat(Number(n)));
    // fallback replacements for character classes
    ex = ex.replaceAll(/\[.*?\]/g, 'A').replaceAll(/\{\d+\}/g, '');
    return ex;
  } catch {
    return null;
  }
}
