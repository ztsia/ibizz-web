import { generateExampleCode } from './code';

export function getFieldType(
  col: any,
  group: any | null,
): 'text' | 'number' | 'month' | 'year' | 'double' | 'int' | 'string' | string {
  if (!col) return 'string';
  if (
    (col.name === 'code' || col.key === 'code') &&
    group &&
    group.code_format
  ) {
    const gf = String(group.code_format).toLowerCase();
    if (gf === 'numeric') return 'number';
    return 'string';
  }
  const ty = String(col.type || '').toLowerCase();
  if (ty === 'int') return 'int';
  if (ty === 'double') return 'double';
  if (ty === 'month') return 'month';
  if (ty === 'year') return 'year';
  if (ty === 'string') return 'string';
  if (ty === 'number' || ty === 'integer') return 'number';

  // Return the type itself if it's not a known primitive (e.g. a slug)
  return ty || 'string';
}

export function getFieldLabel(
  col: any,
  group: any | null,
  dbColumns: Record<string, any> = {},
): string {
  const base = col.label || col.name;
  const ty = String(col.type || '').toLowerCase();

  // Handle code column with example
  if ((col.name === 'code' || col.key === 'code') && group) {
    const gr = group.code_regex || null;
    let displayType = 'string';
    let exampleText: string | null = null;

    if (gr) {
      exampleText = generateExampleCode(gr);
      // Simple inference for the label's display type.
      // If the regex doesn't contain letters, we can assume it's numeric.
      if (!gr.includes('a-z') && !gr.includes('A-Z')) {
        displayType = 'number';
      }
    }

    return exampleText
      ? `${base} (Example: ${exampleText})`
      : `${base} (${displayType})`;
  }

  // Prioritize col.type from schema
  if (ty === 'int') return `${base} (integer)`;
  if (ty === 'double') return `${base} (float)`;
  if (ty === 'month') return `${base} (month, 1-12)`;
  if (ty === 'year') return `${base} (year, 4 digits)`;
  if (ty === 'string') return `${base} (string)`;
  if (ty === 'json') return `${base} (json)`;
  if (ty === 'date' || ty === 'datetime' || ty === 'timestamp')
    return `${base} (date)`;
  if (ty === 'boolean' || ty === 'bool') return `${base} (boolean)`;

  // Fallback for slugs
  if (
    ty &&
    !['int', 'double', 'month', 'year', 'string', 'number', 'text'].includes(ty)
  ) {
    return `${base} (${ty})`;
  }

  // Fallback to dbType if col.type is not specific enough
  const dbName = col.name || col.key;
  const dbType = dbName ? dbColumns[dbName] : null;
  if (dbType) {
    const mapDb = (dt: any) => {
      if (!dt) return null;
      const t = String(dt).toLowerCase();
      if (
        t.includes('int') ||
        t === 'bigint' ||
        t === 'integer' ||
        t === 'smallint' ||
        t === 'serial' ||
        t === 'bigserial'
      )
        return 'int';
      if (
        t === 'numeric' ||
        t === 'decimal' ||
        t === 'double precision' ||
        t === 'real'
      )
        return 'double';
      if (
        t.includes('char') ||
        t === 'text' ||
        t === 'character varying' ||
        t === 'varchar'
      )
        return 'string';
      if (t === 'json' || t === 'jsonb') return 'json';
      if (t.includes('time') || t === 'timestamp' || t === 'date')
        return 'date';
      if (t === 'boolean' || t === 'bool') return 'boolean';
      return 'string';
    };
    const friendly = mapDb(dbType) || 'string';
    return `${base} (${friendly})`;
  }

  return `${base} (string)`; // Default fallback
}
