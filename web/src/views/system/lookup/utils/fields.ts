import { generateExampleCode, generateCodeRegex } from './code';

export function getFieldType(
  col: any,
  group: any | null,
): 'text' | 'number' | 'month' | 'year' | 'double' | 'int' | 'string' {
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
  return 'string';
}

export function getFieldLabel(
  col: any,
  group: any | null,
  dbColumns: Record<string, any> = {},
): string {
  const base = col.label || col.name;
  const dbName = col.name || col.key;
  const dbType = dbName ? dbColumns[dbName] : null;

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
    if (t.includes('time') || t === 'timestamp' || t === 'date') return 'date';
    if (t === 'boolean' || t === 'bool') return 'boolean';
    return 'string';
  };

  if (dbType) {
    if ((col.name === 'code' || col.key === 'code') && group) {
      const gf = (group.code_format || '').toLowerCase();
      if (gf === 'alphanumeric' || gf === 'alphabetic') {
        const friendly = 'string';
        const gr = group.code_regex || null;
        let example: string | null = null;
        if (gr) {
          try {
            example = generateExampleCode(gr);
          } catch {
            example = null;
          }
        } else if (gf) {
          const generatedRegex = generateCodeRegex(
            gf,
            group.alpha_count,
            group.num_count,
            group.single_count,
          );
          if (generatedRegex) {
            try {
              example = generateExampleCode(generatedRegex);
            } catch {
              example = null;
            }
          }
        }
        return example
          ? `${base} (${friendly}) — Example: ${example}`
          : `${base} (${friendly})`;
      }
    }
    const friendly = mapDb(dbType) || 'string';
    if ((col.name === 'code' || col.key === 'code') && group) {
      const gf = group.code_format || null;
      const gr = group.code_regex || null;
      let example: string | null = null;
      if (gr) {
        try {
          example = generateExampleCode(gr);
        } catch {
          example = null;
        }
      } else if (gf) {
        const generatedRegex = generateCodeRegex(
          gf,
          group.alpha_count,
          group.num_count,
          group.single_count,
        );
        if (generatedRegex) {
          try {
            example = generateExampleCode(generatedRegex);
          } catch {
            example = null;
          }
        }
      }
      return example
        ? `${base} (${friendly}) — Example: ${example}`
        : `${base} (${friendly})`;
    }
    return `${base} (${friendly})`;
  }

  const ty = String(col.type || '').toLowerCase();
  if (ty === 'int') return `${base} (integer)`;
  if (ty === 'double') return `${base} (double, 4 decimals)`;
  if (ty === 'month') return `${base} (month, 1-12)`;
  if (ty === 'year') return `${base} (year, 4 digits)`;
  if (ty === 'json') return `${base} (json)`;
  if (ty === 'date' || ty === 'datetime' || ty === 'timestamp')
    return `${base} (date)`;
  if (ty === 'boolean' || ty === 'bool') return `${base} (boolean)`;
  if ((col.name === 'code' || col.key === 'code') && group) {
    const gf2 = group.code_format || null;
    const gr2 = group.code_regex || null;
    if (gr2) {
      try {
        const ex = generateExampleCode(gr2);
        if (ex) return `${base} (string) — Example: ${ex}`; // Changed from text to string
      } catch {}
    } else if (gf2) {
      const generatedRegex = generateCodeRegex(
        gf2,
        group.alpha_count,
        group.num_count,
        group.single_count,
      );
      console.log('getFieldLabel: generatedRegex (fallback)', generatedRegex);
      if (generatedRegex) {
        try {
          const ex = generateExampleCode(generatedRegex);
          if (ex) return `${base} (string) — Example: ${ex}`; // Changed from text to string
        } catch {}
      }
    }
  }
  if (ty === 'string') return `${base} (string)`;
  return `${base} (${ty})`; // Fallback for custom types (slugs)
}
