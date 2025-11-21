// web/src/views/system/form_c/composables/useFormulaEngine.ts

import { computed } from 'vue';
import type { Ref } from 'vue';

// Define types for clarity
export type CellValue = string | number | null | { formula: string };
export type RowData = Record<string, CellValue>;
export type TableData = RowData[];

// --- Formula Calculator Registry ---
// To expand, add a new calculator function here.
const formulaCalculators: Record<
  string,
  (
    formula: string,
    context: {
      row?: RowData;
      rowIndex?: number;
      colId?: string;
      table?: TableData;
    },
  ) => number | null
> = {
  /**
   * Handles intra-row formulas like "{quantity} * {price}".
   * It replaces column IDs with their numeric values and evaluates the expression.
   */
  INTRA_ROW: (formula, { row }) => {
    if (!row) return null;

    let expression = formula;
    const colIds = formula.match(/\{\w+\}/g) || [];

    for (const placeholder of colIds) {
      const colId = placeholder.slice(1, placeholder.length - 1);
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
  },

  /**
   * Calculates the sum of all numeric values in the same column above the current row.
   */
  'SUM(ABOVE)': (formula, { rowIndex, colId, table }) => {
    if (rowIndex === undefined || !colId || !table) return null;
    let sum = 0;
    for (let i = 0; i < rowIndex; i++) {
      sum += Number.parseFloat(table[i][colId] as string) || 0;
    }
    return sum;
  },
};

/**
 * Processes a table of data containing formula definitions.
 * @param rawData The raw data including user input and { formula: "..." } objects.
 * @returns A new table with all formulas calculated.
 */
function processFormulas(rawData: TableData): TableData {
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
          let result: number | null = null;

          // Check for registered keyword formulas first
          if (formulaCalculators[formulaStr]) {
            result = formulaCalculators[formulaStr](formulaStr, {
              rowIndex,
              colId,
              table: displayData,
            });
          }
          // Otherwise, assume it's an intra-row formula
          else if (/\{\w+\}/.test(formulaStr)) {
            result = formulaCalculators.INTRA_ROW(formulaStr, { row });
          }

          // If a calculation was made and the value is different, update the cell value
          if (result !== null && cellValue !== result) {
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
 * @returns An object containing `displayTableData`, a computed property with all formulas resolved.
 */
export function useFormulaEngine(rawTableData: Ref<TableData>) {
  const displayTableData = computed(() => {
    return processFormulas(rawTableData.value);
  });

  return {
    displayTableData,
  };
}
