export namespace AnalysisApi {
  /** Tax analysis options */
  export interface TaxAnalysisOptions {
    description: string;
    amount: number;
    itemType?: 'expense' | 'income';
  }

  /** Alternative treatment option */
  export interface AlternativeTreatment {
    treatment: string;
    description: string;
    confidence: number;
  }

  /** Section 39 eligibility data */
  export interface Section39Data {
    eligible: boolean;
    confidence: number;
    reason: string;
    detailedReason: string;
    legalBasis: string;
    ruleReferences: string[];
    recommendations: string[];
  }

  /** AI analysis result */
  export interface AIAnalysisResult {
    classification: string;
    confidence: number;
    riskLevel: 'low' | 'medium' | 'high';
    recommendations: string[];
    alternatives: AlternativeTreatment[];
    documentation: string[];
    reasoning: string;
    section39?: Section39Data;
  }

  /** Financial items breakdown */
  export interface FinancialItems {
    intangibleAssets: number;
    currentAssets: number;
    nonCurrentAssets: number;
    currentLiabilities: number;
    nonCurrentLiabilities: number;
    capital: number;
  }

  /** Balance sheet analysis options */
  export interface BalanceSheetAnalysisOptions {
    totalAssets: number;
    totalLiabilitiesAndCapital: number;
    balanceDiscrepancy: number;
    financialItems: FinancialItems;
    companyName?: string;
    periodTo?: string;
  }

  /** Potential cause of discrepancy */
  export interface PotentialCause {
    cause: string;
    likelihood: number;
    description: string;
  }

  /** Correction suggestion */
  export interface CorrectionSuggestion {
    step: string;
    priority: 'high' | 'medium' | 'low';
    description: string;
  }

  /** Balance sheet analysis result */
  export interface BalanceSheetAnalysisResult {
    analysis: string;
    confidence: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    recommendations: string[];
    potentialCauses: PotentialCause[];
    correctionSuggestions: CorrectionSuggestion[];
    complianceNotes: string[];
    reasoning: string;
  }

  /** Section 39 eligibility request */
  export interface Section39EligibilityRequest {
    expenseDescription: string;
    expenseAmount: number;
  }

  /** Expense details */
  export interface ExpenseDetails {
    description: string;
    amount: number;
    category: string;
    currency: string;
    date: string;
  }

  /** Vector rule from database */
  export interface VectorRule {
    title: string;
    content: string;
    similarity: number;
    relevanceScore: string;
    usedInAnalysis: boolean;
  }

  /** Analysis metadata */
  export interface AnalysisMetadata {
    ragEnabled: boolean;
    vectorSearchThreshold: number;
    rulesAnalyzed: number;
    aiModel: string;
    embeddingModel: string;
    processingTime: number;
    usedRuleBased: boolean;
  }

  /** Section 39 response data */
  export interface Section39ResponseData {
    eligible: boolean;
    confidence: number;
    reason: string;
    detailedReason: string;
    ruleReferences: string[];
    rulesUsed: string[];
    legalBasis: string;
    recommendations: string[];
    expenses: ExpenseDetails;
    expenseDescription: string;
    vectorSearchResults: number;
    rulesFromVectorDB: VectorRule[];
    analysisMetadata: AnalysisMetadata;
    processedAt: string;
    processingTime: number;
  }

  /** Section 39 eligibility response */
  export interface Section39EligibilityResponse {
    success: boolean;
    message: string;
    data: Section39ResponseData;
  }
}

/**
 * Perform AI analysis for tax items
 * @param options Tax analysis options
 * @returns Promise with analysis result
 */
export async function performTaxAnalysisApi(
  options: AnalysisApi.TaxAnalysisOptions,
): Promise<AnalysisApi.AIAnalysisResult> {
  const aiServiceUrl =
    import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:3001/api/ai';

  try {
    const response = await fetch(`${aiServiceUrl}/analysis/tax`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('Error performing tax analysis:', error);

    // Fallback analysis
    const { description, itemType = 'expense' } = options;
    return {
      classification: getItemStatus(description, itemType),
      confidence: 60,
      riskLevel: 'medium',
      recommendations: [
        'Manual review recommended',
        'Consult tax advisor for complex items',
      ],
      alternatives: [],
      documentation: ['Supporting documents required'],
      reasoning:
        'Static analysis based on predefined rules. AI analysis unavailable.',
    };
  }
}

/**
 * Analyze balance sheet discrepancies using AI
 * @param options Balance sheet analysis options
 * @returns Promise with analysis result
 */
export async function analyzeBalanceSheetApi(
  options: AnalysisApi.BalanceSheetAnalysisOptions,
): Promise<AnalysisApi.BalanceSheetAnalysisResult> {
  const aiServiceUrl =
    import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:3001/api/ai';

  try {
    const response = await fetch(`${aiServiceUrl}/analysis/balance-sheet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('Error analyzing balance sheet:', error);

    // Fallback analysis
    const { balanceDiscrepancy } = options;
    const discrepancyAmount = Math.abs(balanceDiscrepancy);

    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (discrepancyAmount > 100_000) riskLevel = 'critical';
    else if (discrepancyAmount > 50_000) riskLevel = 'high';
    else if (discrepancyAmount > 10_000) riskLevel = 'medium';

    return {
      analysis: `Balance sheet shows a discrepancy of $${discrepancyAmount.toLocaleString()}. This requires immediate attention to ensure accurate financial reporting.`,
      confidence: 60,
      riskLevel,
      recommendations: [
        'Review all journal entries for the current period',
        'Verify asset and liability classifications',
        'Check for unrecorded transactions',
        'Reconcile all balance sheet accounts',
        'Consult with accounting advisor if discrepancy persists',
      ],
      potentialCauses: [
        {
          cause: 'Data entry errors',
          likelihood: 80,
          description: 'Incorrect amounts or misclassified transactions',
        },
        {
          cause: 'Missing transactions',
          likelihood: 60,
          description: 'Unrecorded assets, liabilities, or equity transactions',
        },
        {
          cause: 'Classification errors',
          likelihood: 50,
          description:
            'Items incorrectly categorized between asset and liability sections',
        },
      ],
      correctionSuggestions: [
        {
          step: 'Perform detailed account reconciliation',
          priority: 'high',
          description:
            'Review each balance sheet account for accuracy and completeness',
        },
        {
          step: 'Check trial balance totals',
          priority: 'high',
          description:
            'Ensure debits equal credits in the underlying trial balance',
        },
        {
          step: 'Review period-end adjustments',
          priority: 'medium',
          description:
            'Verify all accruals and deferrals are properly recorded',
        },
      ],
      complianceNotes: [
        'Ensure compliance with Malaysian Financial Reporting Standards (MFRS)',
        'Balance sheet must balance for regulatory filing requirements',
        'Document all corrections for audit trail purposes',
      ],
      reasoning:
        'Static analysis based on discrepancy amount and common accounting principles',
    };
  }
}

/**
 * Check Section 39 eligibility using external API
 * @param request Section 39 eligibility request
 * @returns Promise with eligibility response
 */
export async function checkSection39EligibilityApi(
  request: AnalysisApi.Section39EligibilityRequest,
): Promise<AnalysisApi.Section39EligibilityResponse> {
  const aiServiceUrl =
    import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:3001/api/ai';

  try {
    const response = await fetch(`${aiServiceUrl}/analysis/section39`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking Section 39 eligibility:', error);
    throw new Error('Failed to check Section 39 eligibility');
  }
}

/**
 * Helper function to get item status for tax purposes
 * @param itemName Item name
 * @param itemType Item type
 * @returns Item status
 */
function getItemStatus(
  itemName: string,
  itemType: 'expense' | 'income' = 'expense',
): string {
  const allowability = getItemAllowability(itemName, itemType);

  if (itemType === 'income') {
    return allowability === 'taxable'
      ? 'taxable'
      : (allowability === 'exempt'
        ? 'exempt'
        : 'partial');
  }

  return allowability === 'allowed'
    ? 'deductible'
    : (allowability === 'disallowed'
      ? 'non-deductible'
      : 'partial');
}

/**
 * Helper function to get item allowability for tax purposes
 * @param itemName Item name
 * @param itemType Item type
 * @returns Allowability status
 */
function getItemAllowability(
  itemName: string,
  itemType: 'expense' | 'income' = 'expense',
): string {
  const name = itemName.toUpperCase();

  if (itemType === 'income') {
    if (
      name.includes('INSURANCE CLAIM') ||
      name.includes('SALE OF SCRAP') ||
      name.includes('RENTAL INCOME') ||
      name.includes('INTEREST RECEIVED') ||
      name.includes('DIVIDEND RECEIVED')
    ) {
      return 'taxable';
    }
    if (
      name.includes('GAIN ON DISPOSAL') ||
      name.includes('CAPITAL GAIN') ||
      name.includes('COMPENSATION')
    ) {
      return 'partial';
    }
    if (name.includes('EXEMPT DIVIDEND') || name.includes('LIFE INSURANCE')) {
      return 'exempt';
    }
    return 'taxable';
  }

  // Expense analysis
  if (
    name.includes('AUDIT') ||
    name.includes('PROFESSIONAL') ||
    name.includes('BANK CHARGES') ||
    name.includes('INSURANCE') ||
    name.includes('RENT') ||
    name.includes('UTILITIES') ||
    name.includes('SALARIES') ||
    name.includes('WAGES') ||
    name.includes('OFFICE SUPPLIES')
  ) {
    return 'allowed';
  }
  if (
    name.includes('ENTERTAINMENT') ||
    name.includes('PENALTY') ||
    name.includes('FINE') ||
    name.includes('DONATION') ||
    name.includes('GIFT')
  ) {
    return 'disallowed';
  }
  if (
    name.includes('DEPRECIATION') ||
    name.includes('ADVERTISING') ||
    name.includes('TRAINING')
  ) {
    return 'partial';
  }
  return 'allowed';
}
