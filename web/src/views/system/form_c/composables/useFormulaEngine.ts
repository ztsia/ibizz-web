/**
 * @file This file contains the reactive formula engine for the FormFixedTable component.
 *
 * @usage
 * ```ts
 * import { useFormulaEngine } from './useFormulaEngine';
 *
 * const rawTableData = ref<TableData>([...]); // Raw data from the form, may contain formula objects
 * const formData = ref<Record<string, any>>({...}); // Main form data for external lookups
 *
 * const { displayTableData } = useFormulaEngine(rawTableData, formData);
 * // `displayTableData` is now a computed property that will automatically update
 * // whenever `rawTableData` or `formData` changes.
 * ```
 *
 * @how-it-works
 * The engine takes raw table data (which can contain formula objects like `{ formula: "SUM(ABOVE)" }`)
 * and returns a computed `displayTableData` where all formulas have been resolved to their final values.
 *
 * It works in multiple passes to resolve dependencies, for example, calculating all row totals
 * before calculating a grand total that depends on them.
 *
 * @adding-formulas
 * To add a new formula, add a new entry to the `formulaCalculators` object in this file.
 * See the documentation for `formulaCalculators` below for instructions.
 */

import { computed } from 'vue';
import type { Ref } from 'vue';

// Define types for clarity
export type CellValue = string | number | null | { formula: string };
export type RowData = Record<string, CellValue>;
export type TableData = RowData[];

/**
 * --- The Formula Calculator Registry ---
 * This object is the heart of the formula engine's extensibility.
 * To add a new formula, add a new key-value pair to this object.
 *
 * @key The name of the formula. This can be:
 *   1. A function name (e.g., 'FALLBACK'). The engine will match `FALLBACK(...)`.
 *   2. An exact string match (e.g., 'SUM(ABOVE)').
 *   3. A special internal key (e.g., 'INTRA_ROW').
 *
 * @value A function that performs the calculation.
 *   - It receives the full formula string and a context object.
 *   - The context object contains all possible data the formula might need:
 *     - `row`: The current row's data (for intra-row calculations).
 *     - `rowIndex`, `colId`, `table`: The cell's coordinates and the entire table (for positional calculations).
 *     - `formData`: The main form's data (for external lookups).
 *   - The function should return the calculated value (string | number) or `null`.
 *
 * @example Adding a new 'AVERAGE(ABOVE)' formula:
 * ```ts
 * 'AVG(ABOVE)': (formula, { rowIndex, colId, table }) => {
 *   if (rowIndex === undefined || !colId || !table || rowIndex === 0) return null;
 *   let sum = 0;
 *   for (let i = 0; i < rowIndex; i++) {
 *     sum += Number.parseFloat(table[i][colId] as string) || 0;
 *   }
 *   return sum / rowIndex;
 * },
 * ```
 */
export function evaluateRowFormula(
  formula: string,
  row: Record<string, any>,
): any {
  if (!row) return null;

  let expression = formula;
  const colIds = formula.match(/\{\w+\}/g) || [];

  for (const placeholder of colIds) {
    const colId = placeholder.slice(1, -1);
    const value = Number.parseFloat(row[colId] as string) || 0;
    // Use a regex with 'g' flag to replace all occurrences if a col is used multiple times
    expression = expression.replaceAll(
      new RegExp(placeholder, 'g'),
      value.toString(),
    );
  }

  try {
    // WARNING: Using Function constructor is safer than eval(), but for a production
    // environment, a dedicated math expression parser library (e.g., math.js) is recommended
    // to prevent any potential for arbitrary code execution if formula definitions become complex.
    // eslint-disable-next-line no-new-func
    const result = new Function(`return ${expression}`)();
    return Number.isNaN(result) ? null : result;
  } catch (error) {
    console.error(`Error evaluating formula "${formula}":`, error);
    return null;
  }
}

/**
 * --- The Formula Calculator Registry ---
 * This object is the heart of the formula engine's extensibility.
 * To add a new formula, add a new key-value pair to this object.
 *
 * @key The name of the formula. This can be:
 *   1. A function name (e.g., 'FALLBACK'). The engine will match `FALLBACK(...)`.
 *   2. An exact string match (e.g., 'SUM(ABOVE)').
 *   3. A special internal key (e.g., 'INTRA_ROW').
 *
 * @value A function that performs the calculation.
 *   - It receives the full formula string and a context object.
 *   - The context object contains all possible data the formula might need:
 *     - `row`: The current row's data (for intra-row calculations).
 *     - `rowIndex`, `colId`, `table`: The cell's coordinates and the entire table (for positional calculations).
 *     - `formData`: The main form's data (for external lookups).
 *   - The function should return the calculated value (string | number) or `null`.
 *
 * @example Adding a new 'AVERAGE(ABOVE)' formula:
 * ```ts
 * 'AVG(ABOVE)': (formula, { rowIndex, colId, table }) => {
 *   if (rowIndex === undefined || !colId || !table || rowIndex === 0) return null;
 *   let sum = 0;
 *   for (let i = 0; i < rowIndex; i++) {
 *     sum += Number.parseFloat(table[i][colId] as string) || 0;
 *   }
 *   return sum / rowIndex;
 * },
 * ```
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
  /**
   * @description Handles intra-row formulas like "{quantity} * {price}".
   * It replaces column IDs with their numeric values from the same row and evaluates the expression.
   * @syntax "{colId1} * {colId2}"
   */
  INTRA_ROW: (formula, { row }) => {
    return evaluateRowFormula(formula, row || {});
  },

  /**
   * @description Calculates the sum of all numeric values in the same column above the current row.
   * @syntax "SUM(ABOVE)"
   */
  'SUM(ABOVE)': (formula, { rowIndex, colId, table }) => {
    if (rowIndex === undefined || !colId || !table) return null;
    let sum = 0;
    for (let i = 0; i < rowIndex; i++) {
      sum += Number.parseFloat(table[i][colId] as string) || 0;
    }
    return sum;
  },

  /**
   * @description Parses a list of external field IDs and returns the value of the first one that exists and is not empty.
   * @syntax "FALLBACK(fieldId1, fieldId2, ...)"
   */
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
        // Return the first valid value found
        return value;
      }
    }
    return null;
  },
};

/**
 * Processes a table of data containing formula definitions by iteratively calculating values.
 * @param rawData The raw data including user input and { formula: "..." } objects.
 * @param formData The main form data object for external field lookups.
 * @returns A new table with all formulas calculated.
 */
function processFormulas(
  rawData: TableData,
  formData: Record<string, any>,
): TableData {
  if (!Array.isArray(rawData) || rawData.length === 0) {
    return [];
  }
  // Start with a deep copy to avoid mutating the original raw data during calculation.
  // eslint-disable-next-line unicorn/prefer-structured-clone
  const displayData = JSON.parse(JSON.stringify(rawData));

  const MAX_PASSES = 5; // Prevent infinite loops in case of circular dependencies

  for (let pass = 0; pass < MAX_PASSES; pass++) {
    let hasChanged = false;

    for (let rowIndex = 0; rowIndex < displayData.length; rowIndex++) {
      const row = displayData[rowIndex];
      for (const colId in row) {
        const cellValue = row[colId];
        // Check if the raw data cell has a formula. We check the raw data, not the display data.
        const rawCell = rawData[rowIndex]?.[colId];
        if (
          typeof rawCell === 'object' &&
          rawCell !== null &&
          'formula' in rawCell
        ) {
          const formulaStr = (rawCell as { formula: string }).formula;
          let result: number | string | null = null;

          const formulaType = formulaStr.split('(')[0];

          // Check for registered keyword formulas first
          if (formulaCalculators[formulaStr]) {
            // Exact match like 'SUM(ABOVE)'
            result = formulaCalculators[formulaStr](formulaStr, {
              rowIndex,
              colId,
              table: displayData,
              formData,
            });
          } else if (formulaCalculators[formulaType]) {
            // Match function type like 'FALLBACK'
            result = formulaCalculators[formulaType](formulaStr, { formData });
          }
          // Otherwise, assume it's an intra-row formula
          else if (/\{\w+\}/.test(formulaStr)) {
            result = formulaCalculators.INTRA_ROW(formulaStr, { row });
          }

          // If a calculation was made and the value is different, update the cell value
          if (cellValue !== result) {
            displayData[rowIndex][colId] = result;
            hasChanged = true;
          }
        }
      }
    }
    // If a full pass completes with no changes, the table is stable.
    if (!hasChanged) break;
  }

  return displayData;
}

/**
 * A Vue composable that provides a reactive, calculated table based on raw data with formulas.
 * @param rawTableData A Ref to the source table data, which may contain formula objects.
 * @param formData A Ref to the main form data for external lookups.
 * @returns An object containing `displayTableData`, a computed property with all formulas resolved.
 */
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
