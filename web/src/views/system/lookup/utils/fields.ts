import { exampleFromRegex } from './code';

export function getFieldType(col: any, group: any | null): 'text' | 'number' {
  if (
    (col.name === 'code' || col.key === 'code') &&
    group &&
    group.code_format
  ) {
    const gf = String(group.code_format).toLowerCase();
    if (gf === 'numeric') return 'number';
    return 'text';
  }
  if (col.type === 'number' || col.type === 'integer') return 'number';
  return 'text';
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
      return 'number';
    if (
      t === 'numeric' ||
      t === 'decimal' ||
      t === 'double precision' ||
      t === 'real'
    )
      return 'number';
    if (
      t.includes('char') ||
      t === 'text' ||
      t === 'character varying' ||
      t === 'varchar'
    )
      return 'text';
    if (t === 'json' || t === 'jsonb') return 'json';
    if (t.includes('time') || t === 'timestamp' || t === 'date') return 'date';
    if (t === 'boolean' || t === 'bool') return 'boolean';
    return 'text';
  };

  if (dbType) {
    if ((col.name === 'code' || col.key === 'code') && group) {
      const gf = (group.code_format || '').toLowerCase();
      if (gf === 'alphanumeric' || gf === 'alphabetic') {
        const friendly = 'text';
        const gr = group.code_regex || null;
        let example: string | null = null;
        if (gr) {
          try {
            example = exampleFromRegex(gr);
          } catch {
            example = null;
          }
        } else if (gf === 'alphabetic') example = 'ABC';
        return example
          ? `${base} (${friendly}) — Example: ${example}`
          : `${base} (${friendly})`;
      }
    }
    const friendly = mapDb(dbType) || 'text';
    if ((col.name === 'code' || col.key === 'code') && group) {
      const gf = group.code_format || null;
      const gr = group.code_regex || null;
      let example: string | null = null;
      if (gf && String(gf).toLowerCase() === 'numeric') example = '1';
      else if (gr) {
        try {
          example = exampleFromRegex(gr);
        } catch {
          example = null;
        }
      } else if (gf && String(gf).toLowerCase() === 'alphabetic')
        example = 'ABC';
      return example
        ? `${base} (${friendly}) — Example: ${example}`
        : `${base} (${friendly})`;
    }
    return `${base} (${friendly})`;
  }

  const ty = String(col.type || '').toLowerCase();
  if (ty === 'number' || ty === 'integer') return `${base} (number)`;
  if (ty === 'json') return `${base} (json)`;
  if (ty === 'date' || ty === 'datetime' || ty === 'timestamp')
    return `${base} (date)`;
  if (ty === 'boolean' || ty === 'bool') return `${base} (boolean)`;
  if ((col.name === 'code' || col.key === 'code') && group) {
    const gf2 = group.code_format || null;
    const gr2 = group.code_regex || null;
    if (gr2) {
      try {
        const ex = exampleFromRegex(gr2);
        if (ex) return `${base} (text) — Example: ${ex}`;
      } catch {}
    }
    if (gf2 && String(gf2).toLowerCase() === 'alphabetic')
      return `${base} (text) — Example: ABC`;
  }
  return `${base} (text)`;
}
