/**
 * @file This file contains the reactive formula engine for the FormFixedTable component.
 */

import { computed } from 'vue';
import type { Ref } from 'vue';

// Define types for clarity
export type CellValue = string | number | null | { formula: string };
export type RowData = Record<string, CellValue>;
export type TableData = RowData[];

/**
 * Native implementations of formula functions.
 * These can be injected into the Function scope.
 */
const nativeFunctions = {
  /**
   * Sums values in a target column of a table where a check column matches a value.
   */
  SUMIF: (
    tableData: any[],
    checkColId: string,
    checkValue: any,
    sumColId: string,
  ) => {
    if (!Array.isArray(tableData)) return 0;
    // eslint-disable-next-line unicorn/no-array-reduce
    return tableData.reduce((sum, row) => {
      // Loose equality check to handle string/number differences
      // eslint-disable-next-line eqeqeq
      if (String(row[checkColId]) == String(checkValue)) {
        return sum + (Number.parseFloat(row[sumColId]) || 0);
      }
      return sum;
    }, 0);
  },

  /**
   * Sums all values in a target column of a table.
   */
  SUM: (tableData: any[], colId: string) => {
    if (!Array.isArray(tableData)) return 0;
    // eslint-disable-next-line unicorn/no-array-reduce
    return tableData.reduce((sum, row) => {
      return sum + (Number.parseFloat(row[colId]) || 0);
    }, 0);
  },

  /**
   * Sums positive values in a target column of a table.
   */
  SUM_POSITIVE: (tableData: any[], colId: string) => {
    if (!Array.isArray(tableData)) return 0;
    // eslint-disable-next-line unicorn/no-array-reduce
    return tableData.reduce((sum, row) => {
      const val = Number.parseFloat(row[colId]) || 0;
      return val > 0 ? sum + val : sum;
    }, 0);
  },

  /**
   * Sums negative values in a target column of a table.
   */
  SUM_NEGATIVE: (tableData: any[], colId: string) => {
    if (!Array.isArray(tableData)) return 0;
    // eslint-disable-next-line unicorn/no-array-reduce
    return tableData.reduce((sum, row) => {
      const val = Number.parseFloat(row[colId]) || 0;
      return val < 0 ? sum + val : sum;
    }, 0);
  },

  /**
   * Calculates the sum of all numeric values in the same column above the current row.
   * Note: This requires context (table, rowIndex, colId) which is not easily passed in simple function calls.
   * It is handled specially in processFormulas or via specific context injection if needed.
   * For now, we keep it as a special case in formulaCalculators or handle it via replacement.
   */
};

export function evaluateRowFormula(
  formula: string,
  row: Record<string, any>,
): any {
  if (!row) return null;

  let expression = formula;

  // 1. Handle {colId} placeholders (intra-row values)
  const colIds = formula.match(/\{\w+\}/g) || [];
  for (const placeholder of colIds) {
    const colId = placeholder.slice(1, -1);
    const value = Number.parseFloat(row[colId] as string) || 0;
    expression = expression.replaceAll(
      new RegExp(placeholder, 'g'),
      value.toString(),
    );
  }

  // 2. Prepare scope for the function execution
  // We inject native functions and valid row keys as variables
  const scope: Record<string, any> = { ...nativeFunctions };

  // Inject row/formData properties that are valid identifiers
  for (const [key, value] of Object.entries(row)) {
    if (/^[a-z_$][\w$]*$/i.test(key)) {
      scope[key] = value;
    }
  }

  const keys = Object.keys(scope);
  const values = Object.values(scope);

  try {
    // Create a function with the scope variables as arguments
    // eslint-disable-next-line no-new-func
    const func = new Function(...keys, `return ${expression}`);
    const result = func(...values);
    return Number.isNaN(result) ? null : result;
  } catch (error) {
    console.error(`Error evaluating formula "${formula}":`, error);
    return null;
  }
}

/**
 * Registry for special string-based formulas that might not be valid JS expressions
 * or require complex parsing (like SUM(ABOVE)).
 */
const formulaCalculators: Record<
  string,
  (
    formula: string,
    context: {
      row?: RowData;
      rowIndex?: number;
      colId?: string;
      table?: TableData;
      formData?: Record<string, any>;
    },
  ) => number | null | string
> = {
  INTRA_ROW: (formula, { row }) => {
    return evaluateRowFormula(formula, row || {});
  },

  'SUM(ABOVE)': (formula, { rowIndex, colId, table }) => {
    if (rowIndex === undefined || !colId || !table) return null;
    let sum = 0;
    for (let i = 0; i < rowIndex; i++) {
      sum += Number.parseFloat(table[i][colId] as string) || 0;
    }
    return sum;
  },

  FALLBACK: (formula, { formData }) => {
    if (!formData) return null;
    const fieldIds = formula
      .match(/\((.*)\)/)?.[1]
      .split(',')
      .map((s) => s.trim());
    if (!fieldIds) return null;

    for (const fieldId of fieldIds) {
      const value = formData[fieldId];
      if (value !== null && value !== undefined && value !== '') {
        return value;
      }
    }
    return null;
  },

  // We can map the native functions here too if we want to support the old string-parsing way,
  // but evaluateRowFormula is more robust for complex expressions.
  // We leave them out to force fallback to evaluateRowFormula for SUMIF etc.
};

export function evaluateGlobalFormula(
  formula: string,
  formData: Record<string, any>,
): any {
  const formulaType = formula.split('(')[0];

  // Special handling for SUM(ABOVE) which is context-dependent and not global
  if (formula === 'SUM(ABOVE)') return null;

  if (formulaCalculators[formulaType]) {
    return formulaCalculators[formulaType](formula, { formData });
  }

  const result = evaluateRowFormula(formula, formData);
  return result;
}

function processFormulas(
  rawData: TableData,
  formData: Record<string, any>,
): TableData {
  if (!Array.isArray(rawData) || rawData.length === 0) {
    return [];
  }
  // eslint-disable-next-line unicorn/prefer-structured-clone
  const displayData = JSON.parse(JSON.stringify(rawData));

  const MAX_PASSES = 5;

  for (let pass = 0; pass < MAX_PASSES; pass++) {
    let hasChanged = false;

    for (let rowIndex = 0; rowIndex < displayData.length; rowIndex++) {
      const row = displayData[rowIndex];
      for (const colId in row) {
        const cellValue = row[colId];
        const rawCell = rawData[rowIndex]?.[colId];
        if (
          typeof rawCell === 'object' &&
          rawCell !== null &&
          'formula' in rawCell
        ) {
          const formulaStr = (rawCell as { formula: string }).formula;
          let result: number | string | null = null;

          const formulaType = formulaStr.split('(')[0];

          if (formulaCalculators[formulaStr]) {
            result = formulaCalculators[formulaStr](formulaStr, {
              rowIndex,
              colId,
              table: displayData,
              formData,
            });
          } else if (formulaCalculators[formulaType]) {
            result = formulaCalculators[formulaType](formulaStr, { formData });
          } else if (/\{\w+\}/.test(formulaStr)) {
            // Intra-row with placeholders
            result = evaluateRowFormula(formulaStr, row);
          } else {
            // Try evaluating as a JS expression (e.g. SUMIF)
            // We pass the current row as context, but also need formData?
            // For fixed_table, 'row' is the row data. 'formData' is external.
            // If the formula uses external data (like SUMIF on another table), it needs formData.
            // We should merge them?
            const context = { ...formData, ...row };
            result = evaluateRowFormula(formulaStr, context);
          }

          if (cellValue !== result) {
            displayData[rowIndex][colId] = result;
            hasChanged = true;
          }
        }
      }
    }
    if (!hasChanged) break;
  }

  return displayData;
}

export function useFormulaEngine(
  rawTableData: Ref<TableData>,
  formData: Ref<Record<string, any>>,
) {
  const displayTableData = computed(() => {
    return processFormulas(rawTableData.value, formData.value);
  });

  return {
    displayTableData,
  };
}
