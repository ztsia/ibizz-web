const PRESETS: Record<string, string> = {
  ALPHA_2: '^[A-Z]{2}$',
  NUMERIC: String.raw`^\d+$`,
};

export function compileCodeFormat(format: string): {
  isValid: boolean;
  regex?: RegExp;
  error?: string;
} {
  if (!format) {
    return { isValid: false, error: 'Format is required' };
  }

  const presetPattern = PRESETS[format];
  if (presetPattern) {
    try {
      const regex = new RegExp(presetPattern);
      return { isValid: true, regex };
    } catch (error: any) {
      return { isValid: false, error: String(error.message || error) };
    }
  }

  try {
    const regex = new RegExp(format);
    return { isValid: true, regex };
  } catch (error: any) {
    return { isValid: false, error: String(error.message || error) };
  }
}

export function validateCodeFormat(code: string, regex?: RegExp): boolean {
  if (!regex || !code) return false;
  return regex.test(code);
}

export function validateColumnsSchema(schema: any): {
  isValid: boolean;
  error?: string;
} {
  if (!schema || typeof schema !== 'object') {
    return { isValid: false, error: 'Schema must be an object' };
  }
  if (!schema.code) {
    return { isValid: false, error: 'Schema must include a "code" column' };
  }
  if (schema.code.required !== true) {
    return {
      isValid: false,
      error: 'The "code" column must be marked as required',
    };
  }
  return { isValid: true };
}
