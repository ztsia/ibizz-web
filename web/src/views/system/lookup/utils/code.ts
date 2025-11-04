// Preset code format patterns

export function isCodeUnique(existing: string[], code: string): boolean {
  return !existing.includes(code);
}

export function suggestNextCode(
  pattern: string,
  existing: string[],
): string | null {
  try {
    // Alphanumeric with counts: ^[A-Za-z]{a}[0-9]{n}$ or ^[0-9]{n}[A-Za-z]{a}$
    const mixedMatch = pattern.match(
      /^\^(\[A-Za-z\]\{(\d+)\})(\[0-9\]\{(\d+)\})\$$/,
    );
    if (mixedMatch) {
      const alphaLength = Number.parseInt(mixedMatch[2], 10);
      const numLength = Number.parseInt(mixedMatch[4], 10);
      return suggestMixedCode(alphaLength, numLength, existing, 'alpha-first');
    }

    const mixedMatchReverse = pattern.match(
      /^\^(\[0-9\]\{(\d+)\})(\[A-Za-z\]\{(\d+)\})\$$/,
    );
    if (mixedMatchReverse) {
      const numLength = Number.parseInt(mixedMatchReverse[2], 10);
      const alphaLength = Number.parseInt(mixedMatchReverse[4], 10);
      return suggestMixedCode(
        alphaLength,
        numLength,
        existing,
        'numeric-first',
      );
    }

    // Numeric: ^[0-9]{c}$
    const numericMatch = pattern.match(/^\^\[0-9\]\{(\d+)\}\$$/);
    if (numericMatch) {
      const fixedLength = Number.parseInt(numericMatch[1], 10);
      return suggestNumericCode(fixedLength, existing);
    }

    // Alphabetic: ^[A-Za-z]{c}$
    const alphaMatch = pattern.match(/^\^\[[a-z-]+\]\{(\d+)\}\$$/i);
    if (alphaMatch) {
      const length = Number.parseInt(alphaMatch[1], 10);
      return suggestAlphaCode(length, existing);
    }

    // Custom Alphanumeric: e.g., ^PREFIX[0-9]{N}$
    let cleanedPattern = pattern.startsWith('^') ? pattern.slice(1) : pattern;
    cleanedPattern = cleanedPattern.endsWith('$')
      ? cleanedPattern.slice(0, -1)
      : cleanedPattern;
    const customMixedMatch = cleanedPattern.match(/(.*?)\[0-9\]\{(\d+)\}/);
    if (customMixedMatch) {
      const prefix = customMixedMatch[1];
      const numLength = Number(customMixedMatch[2]);
      return suggestCustomMixedCode(prefix, numLength, existing);
    }

    // Generic Alphanumeric: ^[A-Za-z0-9]+$
    if (pattern === '^[A-Za-z0-9]+$') {
      // No simple suggestion for generic alphanumeric
      return null;
    }

    return null;
  } catch {
    return null;
  }
}

function suggestAlphaCode(length: number, existing: string[]): string | null {
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

    let startChar: string, endChar: string;
    if (ch >= 'A' && ch <= 'Z') {
      startChar = 'A';
      endChar = 'Z';
    } else if (ch >= 'a' && ch <= 'z') {
      startChar = 'a';
      endChar = 'z';
    } else {
      // Not a purely alphabetic character, cannot increment
      return null;
    }

    if (ch === endChar) {
      chars[i] = startChar;
    } else {
      chars[i] = String.fromCodePoint(ch.codePointAt(0)! + 1);
      carry = false;
    }
  }
  if (carry) {
    // This signifies a full rollover, e.g., 'ZZ' -> 'AA'.
    // In a fixed-length system, there's no "next" code in sequence.
    return null;
  }
  return chars.join('');
}

function suggestNumericCode(
  fixedLength: number | null,
  existing: string[],
): string | null {
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
  if (padLength) {
    const nextCode = nextNum.toString().padStart(padLength, '0');
    if (nextCode.length > padLength) {
      return null; // Numeric space exhausted
    }
    return nextCode;
  }
  return nextNum.toString();
}

function suggestMixedCode(
  alphaLength: number,
  numLength: number,
  existing: string[],
  alphanumericOrder: 'alpha-first' | 'numeric-first',
): string | null {
  if (existing.length === 0) {
    const alpha = 'A'.repeat(alphaLength);
    const numeric = '1'.padStart(numLength, '0');
    return alphanumericOrder === 'alpha-first'
      ? `${alpha}${numeric}`
      : `${numeric}${alpha}`;
  }
  const sorted = [...existing].sort();
  const maxCode = sorted[sorted.length - 1];
  if (!maxCode) return null;
  return incrementMixedCode(maxCode, alphanumericOrder);
}

function incrementMixedCode(
  code: string,
  alphanumericOrder: 'alpha-first' | 'numeric-first',
): string | null {
  if (alphanumericOrder === 'alpha-first') {
    const numMatch = code.match(/\d+$/);
    if (!numMatch) return null;
    const numPart = numMatch[0];
    const prefix = code.slice(0, code.length - numPart.length);
    const numValue = Number.parseInt(numPart, 10);
    const nextNum = numValue + 1;
    const nextStr = nextNum.toString().padStart(numPart.length, '0');
    if (nextStr.length > numPart.length) {
      return null; // Numeric part overflow
    }
    return prefix + nextStr;
  } else {
    // numeric-first
    const alphaMatch = code.match(/[A-Z]+$/i);
    if (!alphaMatch) return null;
    const alphaPart = alphaMatch[0];
    const prefix = code.slice(0, code.length - alphaPart.length);
    const nextAlpha = incrementAlpha(alphaPart);
    if (!nextAlpha || nextAlpha.length > alphaPart.length) {
      return null; // Alphabetic part overflow
    }
    return prefix + nextAlpha;
  }
}

function suggestCustomMixedCode(
  prefix: string,
  numLength: number,
  existing: string[],
): string | null {
  const matchingExisting = existing.filter((code) => code.startsWith(prefix));

  if (matchingExisting.length === 0) {
    return prefix + '1'.padStart(numLength, '0');
  }

  const numbers = matchingExisting.map((code) =>
    Number.parseInt(code.slice(prefix.length), 10),
  );
  const maxNum = Math.max(...numbers);
  const nextNum = maxNum + 1;

  return prefix + nextNum.toString().padStart(numLength, '0');
}

export function generateExampleCode(regexStr: string | null): string | null {
  if (!regexStr) return null;

  // Alphanumeric with counts: ^[A-Za-z]{a}[0-9]{n}$ or ^[0-9]{n}[A-Za-z]{a}$
  const mixedMatch = regexStr.match(
    /^\^(\[A-Za-z\]\{(\d+)\})(\[0-9\]\{(\d+)\})\$$/,
  );
  if (mixedMatch) {
    const alphaCount = Number(mixedMatch[2]);
    const numCount = Number(mixedMatch[4]);
    return 'A'.repeat(alphaCount) + '0'.repeat(numCount);
  }

  const mixedMatchReversed = regexStr.match(
    /^\^(\[0-9\]\{(\d+)\})(\[A-Za-z\]\{(\d+)\})\$$/,
  );
  if (mixedMatchReversed) {
    const numCount = Number(mixedMatchReversed[2]);
    const alphaCount = Number(mixedMatchReversed[4]);
    return '0'.repeat(numCount) + 'A'.repeat(alphaCount);
  }

  // Numeric: ^[0-9]{c}$
  const numericMatch = regexStr.match(/^\^\[0-9\]\{(\d+)\}\$$/);
  if (numericMatch) {
    const count = Number(numericMatch[1]);
    return '0'.repeat(count);
  }

  // Alphabetic: ^[A-Za-z]{c}$
  const alphaMatch = regexStr.match(/^\^\[[a-z-]+\]\{(\d+)\}\$$/i);
  if (alphaMatch) {
    const count = Number(alphaMatch[1]);
    return 'A'.repeat(count);
  }

  // Generic Alphanumeric: ^[A-Za-z0-9]+$
  if (regexStr === '^[A-Za-z0-9]+$') {
    return 'A0';
  }
  // Try to generate example for custom patterns
  let cleanedRegex = regexStr.startsWith('^') ? regexStr.slice(1) : regexStr;
  cleanedRegex = cleanedRegex.endsWith('$')
    ? cleanedRegex.slice(0, -1)
    : cleanedRegex;
  cleanedRegex = cleanedRegex.replaceAll(/\[0-9\]\{(\d+)\}/g, (_, count) =>
    '0'.repeat(Number(count)),
  );
  cleanedRegex = cleanedRegex.replaceAll(/\[A-Za-z\]\{(\d+)\}/g, (_, count) =>
    'A'.repeat(Number(count)),
  );
  cleanedRegex = cleanedRegex.replaceAll(
    /\[A-Za-z0-9\]\{(\d+)\}/g,
    (_, count) =>
      'A0'.repeat(Math.ceil(Number(count) / 2)).slice(0, Number(count)),
  );
  // If after replacements, it's not just a character class, return it as is (e.g., 'BK')
  if (!/^\\[.*\\]\{\d+\\\}$/.test(cleanedRegex)) {
    return cleanedRegex;
  }

  return null;
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
  alphanumericOrder?: 'alpha-first' | 'numeric-first',
): string | null {
  if (!fmt) return null;
  if (fmt === 'Alphanumeric') {
    const a = Math.max(0, Number(alphaCount || 0) || 0);
    const n = Math.max(0, Number(numCount || 0) || 0);
    if (a > 0 && n > 0) {
      if (alphanumericOrder === 'numeric-first') {
        return `^[0-9]{${n}}[A-Za-z]{${a}}$`;
      }
      return `^[A-Za-z]{${a}}[0-9]{${n}}$`;
    }
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
