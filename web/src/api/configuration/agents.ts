import { requestClient } from '#/api/request';

export interface Agent {
  id: string;
  name: string;
  description: string;
  type:
    | 'tax-advisor'
    | 'document-analyzer'
    | 'compliance-checker'
    | 'general-assistant';
  status: 'active' | 'inactive' | 'draft';
  rules: string[];
  guidelines: string[];
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// Mock data for development - Based on workflow specialists from AIChatAssistant.vue
const mockAgents: Agent[] = [
  {
    id: '1',
    name: 'Client Selection Specialist',
    description: 'Expert in client onboarding and selection for tax filing',
    type: 'general-assistant',
    status: 'active',
    rules: [
      'Verify client identity and business registration details',
      'Validate client eligibility for specific tax filing categories',
      'Ensure all required client documentation is complete',
      'Check for any outstanding compliance issues or penalties',
      'Confirm client authorization for tax filing representation',
    ],
    guidelines: [
      'Follow KYC (Know Your Customer) procedures thoroughly',
      'Maintain client confidentiality at all times',
      'Document all client interactions and decisions',
      'Escalate complex cases to senior tax advisors',
      'Provide clear explanations of the tax filing process',
    ],
    model: 'gpt-4',
    temperature: 0.3,
    maxTokens: 1500,
    systemPrompt:
      'You are a client selection specialist focused on proper client onboarding and validation for tax filing services.',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
    createdBy: 'admin',
  },
  {
    id: '2',
    name: 'Period Configuration Expert',
    description: 'Specialist in accounting period setup and validation',
    type: 'general-assistant',
    status: 'active',
    rules: [
      'Validate accounting period dates against business registration',
      'Ensure compliance with Malaysian financial year requirements',
      'Check for any period changes that require LHDN notification',
      'Verify consistency with previous year filings',
      "Confirm alignment with company's financial reporting calendar",
    ],
    guidelines: [
      "Always verify the legal entity's financial year end",
      'Consider impact of period changes on tax calculations',
      'Document any deviations from standard 12-month periods',
      'Ensure proper transition handling for period changes',
      'Validate against statutory filing deadlines',
    ],
    model: 'gpt-4',
    temperature: 0.2,
    maxTokens: 1200,
    systemPrompt:
      'You are an accounting period configuration expert ensuring proper setup and compliance with Malaysian tax regulations.',
    createdAt: '2024-01-16T09:15:00Z',
    updatedAt: '2024-01-21T11:20:00Z',
    createdBy: 'admin',
  },
  {
    id: '3',
    name: 'Document Upload Specialist',
    description: 'Expert in secure document upload and file management',
    type: 'general-assistant',
    status: 'active',
    rules: [
      'Validate file formats and sizes before upload',
      'Ensure document security and encryption during transfer',
      'Verify document completeness and readability',
      'Maintain audit trail for all uploaded documents',
      'Check for duplicate or corrupted files',
    ],
    guidelines: [
      'Support multiple file formats (PDF, JPG, PNG, Excel)',
      'Provide clear upload progress and status feedback',
      'Implement virus scanning for all uploaded files',
      'Organize documents by category and date',
      'Enable batch upload for efficiency',
    ],
    model: 'gpt-3.5-turbo',
    temperature: 0.1,
    maxTokens: 1000,
    systemPrompt:
      'You are a document upload specialist ensuring secure and efficient file management for tax documentation.',
    createdAt: '2024-01-17T14:45:00Z',
    updatedAt: '2024-01-22T16:10:00Z',
    createdBy: 'admin',
  },
  {
    id: '4',
    name: 'Document Classification Expert',
    description:
      'Specialist in automated document classification and OCR processing',
    type: 'document-analyzer',
    status: 'active',
    rules: [
      'Accurately classify documents by type and purpose',
      'Apply OCR technology to extract text from images',
      'Validate extracted data against expected formats',
      'Flag documents requiring manual review',
      'Maintain classification accuracy above 95%',
    ],
    guidelines: [
      'Use machine learning models for document categorization',
      'Implement confidence scoring for classifications',
      'Handle multiple languages (English, Malay, Chinese)',
      'Provide fallback options for unclear documents',
      'Continuously improve classification algorithms',
    ],
    model: 'gpt-4',
    temperature: 0.1,
    maxTokens: 1800,
    systemPrompt:
      'You are a document classification expert using AI to categorize and process tax-related documents.',
    createdAt: '2024-01-18T08:30:00Z',
    updatedAt: '2024-01-23T10:45:00Z',
    createdBy: 'admin',
  },
  {
    id: '5',
    name: 'Data Extraction Specialist',
    description:
      'Expert in extracting and validating financial information from documents',
    type: 'document-analyzer',
    status: 'active',
    rules: [
      'Extract financial data with high precision',
      'Validate extracted amounts against document totals',
      'Identify and flag inconsistencies or errors',
      'Ensure proper currency and decimal handling',
      'Cross-reference data across multiple documents',
    ],
    guidelines: [
      'Use advanced OCR and pattern recognition',
      'Implement data validation rules and checks',
      'Handle various document formats and layouts',
      'Provide confidence scores for extracted data',
      'Enable manual correction and verification',
    ],
    model: 'gpt-4',
    temperature: 0.05,
    maxTokens: 2000,
    systemPrompt:
      'You are a data extraction specialist focused on accurate financial information extraction from tax documents.',
    createdAt: '2024-01-19T11:20:00Z',
    updatedAt: '2024-01-24T13:35:00Z',
    createdBy: 'admin',
  },
  {
    id: '6',
    name: 'Expense Review Expert',
    description:
      'Specialist in reviewing and validating business expenses for tax purposes',
    type: 'tax-advisor',
    status: 'active',
    rules: [
      'Categorize expenses according to Malaysian tax law',
      'Identify deductible vs non-deductible expenses',
      'Validate expense claims with supporting documentation',
      'Apply appropriate expense limits and restrictions',
      'Flag unusual or suspicious expense patterns',
    ],
    guidelines: [
      'Reference latest LHDN guidelines for expense categories',
      'Consider business purpose and necessity tests',
      'Apply proportional deductions for mixed-use expenses',
      'Ensure proper documentation standards are met',
      'Provide clear explanations for expense treatments',
    ],
    model: 'gpt-4',
    temperature: 0.2,
    maxTokens: 1800,
    systemPrompt:
      'You are an expense review expert specializing in Malaysian business tax deductions and compliance.',
    createdAt: '2024-01-20T15:10:00Z',
    updatedAt: '2024-01-25T09:25:00Z',
    createdBy: 'admin',
  },
  {
    id: '7',
    name: 'Income Extraction Specialist',
    description:
      'Expert in extracting and validating dividend, interest, and rental income for tax purposes',
    type: 'document-analyzer',
    status: 'active',
    rules: [
      'Identify all sources of taxable income accurately',
      'Extract dividend, interest, and rental income details',
      'Validate income amounts against source documents',
      'Apply appropriate tax treatments for different income types',
      'Ensure compliance with withholding tax requirements',
    ],
    guidelines: [
      'Cross-reference with bank statements and certificates',
      'Handle foreign income and currency conversions',
      'Apply correct tax rates for different income categories',
      'Consider tax exemptions and reliefs available',
      'Maintain detailed records for audit purposes',
    ],
    model: 'gpt-4',
    temperature: 0.15,
    maxTokens: 1600,
    systemPrompt:
      'You are an income extraction specialist focused on accurate identification and processing of various income types.',
    createdAt: '2024-01-21T12:40:00Z',
    updatedAt: '2024-01-26T14:55:00Z',
    createdBy: 'admin',
  },
  {
    id: '8',
    name: 'Capital Allowance Specialist',
    description:
      'Expert in managing asset schedules and applying correct capital allowances for tax purposes',
    type: 'tax-advisor',
    status: 'active',
    rules: [
      'Maintain accurate fixed asset registers',
      'Apply correct capital allowance rates by asset category',
      'Handle asset additions, disposals, and transfers properly',
      'Calculate balancing adjustments for asset disposals',
      'Ensure compliance with capital allowance regulations',
    ],
    guidelines: [
      'Reference Schedule 3 of Income Tax Act 1967',
      'Consider accelerated capital allowances where applicable',
      'Handle industrial building allowances separately',
      'Maintain detailed asset movement records',
      'Apply pro-rata calculations for partial year assets',
    ],
    model: 'gpt-4',
    temperature: 0.1,
    maxTokens: 1700,
    systemPrompt:
      'You are a capital allowance specialist expert in Malaysian tax law for asset depreciation and allowances.',
    createdAt: '2024-01-22T10:15:00Z',
    updatedAt: '2024-01-27T12:30:00Z',
    createdBy: 'admin',
  },
  {
    id: '9',
    name: 'Tax Calculation Specialist',
    description:
      'Expert in Malaysian corporate tax calculations and compliance',
    type: 'tax-advisor',
    status: 'active',
    rules: [
      'Apply correct corporate tax rates based on company size and income',
      'Calculate tax reliefs and incentives accurately',
      'Handle installment payment calculations',
      'Ensure proper treatment of brought forward losses',
      'Validate final tax computations against statutory requirements',
    ],
    guidelines: [
      'Use latest tax rates and thresholds from MOF',
      'Consider SME tax incentives and reliefs',
      'Apply correct treatment for different business sectors',
      'Handle group relief and consolidation where applicable',
      'Ensure accuracy in estimated tax payment calculations',
    ],
    model: 'gpt-4',
    temperature: 0.05,
    maxTokens: 2200,
    systemPrompt:
      'You are a tax calculation specialist with deep expertise in Malaysian corporate tax computations and compliance.',
    createdAt: '2024-01-23T09:30:00Z',
    updatedAt: '2024-01-28T11:45:00Z',
    createdBy: 'admin',
  },
  {
    id: '10',
    name: 'Quality Assurance Expert',
    description:
      'Specialist in final review and quality assurance of tax returns',
    type: 'general-assistant',
    status: 'active',
    rules: [
      'Perform comprehensive review of all tax return sections',
      'Verify mathematical accuracy of all calculations',
      'Ensure consistency across all forms and schedules',
      'Check compliance with filing requirements and deadlines',
      'Validate supporting documentation completeness',
    ],
    guidelines: [
      'Use systematic checklists for review processes',
      'Perform independent recalculation of key figures',
      'Review for common errors and omissions',
      'Ensure proper authorization and sign-off procedures',
      'Document all review findings and resolutions',
    ],
    model: 'gpt-4',
    temperature: 0.2,
    maxTokens: 1500,
    systemPrompt:
      'You are a quality assurance expert ensuring accuracy and compliance in tax return preparation.',
    createdAt: '2024-01-24T13:20:00Z',
    updatedAt: '2024-01-29T15:10:00Z',
    createdBy: 'admin',
  },
  {
    id: '11',
    name: 'Submission Specialist',
    description:
      'Expert in final tax return preparation and submission to authorities',
    type: 'general-assistant',
    status: 'active',
    rules: [
      'Ensure all forms are properly completed and signed',
      'Validate submission deadlines and requirements',
      'Handle electronic filing procedures correctly',
      'Maintain submission records and acknowledgments',
      'Follow up on submission status and confirmations',
    ],
    guidelines: [
      'Use official LHDN e-filing systems and procedures',
      'Verify digital signatures and authentication',
      'Handle payment submissions for tax liabilities',
      'Maintain backup copies of all submitted documents',
      'Provide clients with submission confirmations and receipts',
    ],
    model: 'gpt-3.5-turbo',
    temperature: 0.3,
    maxTokens: 1200,
    systemPrompt:
      'You are a submission specialist expert in tax return filing procedures and compliance with LHDN requirements.',
    createdAt: '2024-01-25T16:45:00Z',
    updatedAt: '2024-01-30T10:20:00Z',
    createdBy: 'admin',
  },
  {
    id: '12',
    name: 'AI Tax Assistant',
    description: 'General AI assistant for tax filing guidance and support',
    type: 'compliance-checker',
    status: 'active',
    rules: [
      'Provide accurate information on Malaysian tax regulations',
      'Guide users through tax filing workflows step-by-step',
      'Identify potential compliance issues and risks',
      'Offer general tax planning advice and strategies',
      'Escalate complex issues to specialized agents',
    ],
    guidelines: [
      'Maintain up-to-date knowledge of tax law changes',
      'Provide clear and understandable explanations',
      'Use examples and scenarios to illustrate concepts',
      'Encourage proper documentation and record keeping',
      'Promote proactive tax compliance and planning',
    ],
    model: 'gpt-4',
    temperature: 0.4,
    maxTokens: 1800,
    systemPrompt:
      'You are a general AI tax assistant providing comprehensive guidance on Malaysian tax matters and compliance.',
    createdAt: '2024-01-26T08:00:00Z',
    updatedAt: '2024-01-31T12:15:00Z',
    createdBy: 'admin',
  },
];

export interface CreateAgentRequest {
  name: string;
  description: string;
  type: Agent['type'];
  rules: string[];
  guidelines: string[];
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
}

export interface UpdateAgentRequest extends Partial<CreateAgentRequest> {
  status?: Agent['status'];
}

export interface AgentListResponse {
  agents: Agent[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Get all agents with pagination
 */
export async function getAgents(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  type?: Agent['type'];
  status?: Agent['status'];
}): Promise<AgentListResponse> {
  try {
    let filteredAgents = [...mockAgents];

    // Apply filters if provided
    if (params?.search) {
      const search = params.search.toLowerCase();
      filteredAgents = filteredAgents.filter(
        (agent) =>
          agent.name.toLowerCase().includes(search) ||
          agent.description.toLowerCase().includes(search),
      );
    }

    if (params?.type) {
      filteredAgents = filteredAgents.filter(
        (agent) => agent.type === params.type,
      );
    }

    if (params?.status) {
      filteredAgents = filteredAgents.filter(
        (agent) => agent.status === params.status,
      );
    }

    return {
      agents: filteredAgents,
      total: filteredAgents.length,
      page: params?.page || 1,
      pageSize: params?.pageSize || 10,
    };
  } catch (error) {
    console.warn('API not available, using mock data:', error);
    // Return mock data when API is not available
  }
}

/**
 * Get agent by ID
 */
export async function getAgent(id: string): Promise<Agent> {
  try {
    return await requestClient.get(`/api/configuration/agents/${id}`);
  } catch (error) {
    console.warn('API not available, using mock data:', error);
    const agent = mockAgents.find((a) => a.id === id);
    if (!agent) {
      throw new Error(`Agent with id ${id} not found`);
    }
    return agent;
  }
}

/**
 * Create new agent
 */
export async function createAgent(data: CreateAgentRequest): Promise<Agent> {
  try {
    return await requestClient.post('/api/configuration/agents', data);
  } catch (error) {
    console.warn('API not available, using mock data:', error);
    const newAgent: Agent = {
      id: Date.now().toString(),
      ...data,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'user',
    };
    mockAgents.push(newAgent);
    return newAgent;
  }
}

/**
 * Update agent
 */
export async function updateAgent(
  id: string,
  data: UpdateAgentRequest,
): Promise<Agent> {
  try {
    return await requestClient.put(`/api/configuration/agents/${id}`, data);
  } catch (error) {
    console.warn('API not available, using mock data:', error);
    const agentIndex = mockAgents.findIndex((a) => a.id === id);
    if (agentIndex === -1) {
      throw new Error(`Agent with id ${id} not found`);
    }
    const updatedAgent = {
      ...mockAgents[agentIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    mockAgents[agentIndex] = updatedAgent;
    return updatedAgent;
  }
}

/**
 * Delete agent
 */
export async function deleteAgent(id: string): Promise<void> {
  try {
    return await requestClient.delete(`/api/configuration/agents/${id}`);
  } catch (error) {
    console.warn('API not available, using mock data:', error);
    const agentIndex = mockAgents.findIndex((a) => a.id === id);
    if (agentIndex === -1) {
      throw new Error(`Agent with id ${id} not found`);
    }
    mockAgents.splice(agentIndex, 1);
  }
}

/**
 * Test agent configuration
 */
export async function testAgent(
  id: string,
  testMessage: string,
): Promise<{ response: string; success: boolean }> {
  try {
    return await requestClient.post(`/api/configuration/agents/${id}/test`, {
      message: testMessage,
    });
  } catch (error) {
    console.warn('API not available, using mock data:', error);
    const agent = mockAgents.find((a) => a.id === id);
    if (!agent) {
      throw new Error(`Agent with id ${id} not found`);
    }
    return {
      response: `Mock response from ${agent.name}: I understand your message "${testMessage}". This is a test response based on my configuration.`,
      success: true,
    };
  }
}

/**
 * Duplicate agent
 */
export async function duplicateAgent(id: string, name: string): Promise<Agent> {
  try {
    return await requestClient.post(
      `/api/configuration/agents/${id}/duplicate`,
      { name },
    );
  } catch (error) {
    console.warn('API not available, using mock data:', error);
    const originalAgent = mockAgents.find((a) => a.id === id);
    if (!originalAgent) {
      throw new Error(`Agent with id ${id} not found`);
    }
    const duplicatedAgent: Agent = {
      ...originalAgent,
      id: Date.now().toString(),
      name,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'user',
    };
    mockAgents.push(duplicatedAgent);
    return duplicatedAgent;
  }
}
