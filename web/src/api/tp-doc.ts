export namespace TPDocApi {
  export interface TPDoc {
    client: string;
    createdTime: string;
    deadline: string;
    description?: string;
    fy: string;
    id: string;
    lastUpdated: string;
    progress: number;
    status: 'Approved' | 'Draft' | 'Rejected' | 'Submitted';
    team: string[];
    tpType: 'Full' | 'Min';
    updatedTime: string;
  }

  export interface GetTPDocListParams {
    client?: string;
    fy?: string;
    page?: number;
    pageSize?: number;
    status?: 'Approved' | 'Draft' | 'Rejected' | 'Submitted';
    tpType?: 'Full' | 'Min';
  }

  export interface CreateTPDocParams {
    client: string;
    deadline: string;
    description?: string;
    fy: string;
    progress: number;
    status: 'Approved' | 'Draft' | 'Rejected' | 'Submitted';
    team: string[];
    tpType: 'Full' | 'Min';
  }

  export interface UpdateTPDocParams {
    client?: string;
    deadline?: string;
    description?: string;
    fy?: string;
    progress?: number;
    status?: 'Approved' | 'Draft' | 'Rejected' | 'Submitted';
    team?: string[];
    tpType?: 'Full' | 'Min';
  }
}

// Mock data for development
const mockTPDocs: TPDocApi.TPDoc[] = [
  {
    id: '1',
    client: 'One Plus Sdn Bhd',
    fy: '30 Jun 2024',
    tpType: 'Full',
    team: ['John', 'Jane', 'Bob', 'Alice'],
    progress: 78,
    deadline: '31 Dec 2024, 12:00 PM',
    lastUpdated: '14 Apr 2024, 8:43 PM',
    status: 'Approved',
    createdTime: '2024-01-01T00:00:00Z',
    updatedTime: '2024-04-14T20:43:00Z',
    description: 'Transfer pricing documentation for One Plus Sdn Bhd',
  },
  {
    id: '2',
    client: 'One Plus Sdn Bhd',
    fy: '30 Jun 2023',
    tpType: 'Full',
    team: ['John', 'Jane', 'Bob'],
    progress: 100,
    deadline: '31 Dec 2023, 12:00 PM',
    lastUpdated: '15 Dec 2023, 4:30 PM',
    status: 'Approved',
    createdTime: '2023-01-01T00:00:00Z',
    updatedTime: '2023-12-15T16:30:00Z',
    description: 'Previous year TP documentation - Completed',
  },
  {
    id: '3',
    client: 'HJ Sdn Bhd',
    fy: '30 Nov 2024',
    tpType: 'Min',
    team: ['Sarah', 'Mike', 'David'],
    progress: 45,
    deadline: '31 Jan 2025, 5:00 PM',
    lastUpdated: '20 Dec 2024, 2:15 PM',
    status: 'Submitted',
    createdTime: '2024-10-01T00:00:00Z',
    updatedTime: '2024-12-20T14:15:00Z',
    description: 'Minimal TP documentation for HJ Sdn Bhd',
  },
  {
    id: '4',
    client: 'CUBE Sdn Bhd',
    fy: '31 Dec 2024',
    tpType: 'Min',
    team: ['Emma', 'Lucas'],
    progress: 25,
    deadline: '28 Feb 2025, 12:00 PM',
    lastUpdated: '18 Dec 2024, 10:30 AM',
    status: 'Draft',
    createdTime: '2024-11-01T00:00:00Z',
    updatedTime: '2024-12-18T10:30:00Z',
    description: 'Draft TP documentation for CUBE Sdn Bhd',
  },
  {
    id: '5',
    client: 'Tech Solutions Sdn Bhd',
    fy: '31 Mar 2024',
    tpType: 'Full',
    team: ['Alice', 'Charlie', 'Diana'],
    progress: 90,
    deadline: '15 Jan 2025, 5:00 PM',
    lastUpdated: '20 Dec 2024, 3:30 PM',
    status: 'Submitted',
    createdTime: '2024-02-01T00:00:00Z',
    updatedTime: '2024-12-20T15:30:00Z',
    description: 'Comprehensive TP documentation for Tech Solutions',
  },
  {
    id: '6',
    client: 'Global Manufacturing Sdn Bhd',
    fy: '31 Dec 2023',
    tpType: 'Full',
    team: ['Robert', 'Lisa', 'Kevin', 'Maria', 'Tom'],
    progress: 100,
    deadline: '31 Mar 2024, 6:00 PM',
    lastUpdated: '25 Mar 2024, 11:45 AM',
    status: 'Approved',
    createdTime: '2023-10-01T00:00:00Z',
    updatedTime: '2024-03-25T11:45:00Z',
    description:
      'Complex multinational TP documentation with multiple entities',
  },
  {
    id: '7',
    client: 'Digital Services Sdn Bhd',
    fy: '30 Jun 2024',
    tpType: 'Min',
    team: ['Nina', 'Oscar'],
    progress: 15,
    deadline: '30 Apr 2025, 3:00 PM',
    lastUpdated: '22 Dec 2024, 9:20 AM',
    status: 'Draft',
    createdTime: '2024-12-01T00:00:00Z',
    updatedTime: '2024-12-22T09:20:00Z',
    description: 'Initial draft for digital services TP documentation',
  },
  {
    id: '8',
    client: 'Retail Chain Sdn Bhd',
    fy: '31 Dec 2024',
    tpType: 'Full',
    team: ['Peter', 'Quinn', 'Rachel'],
    progress: 65,
    deadline: '31 May 2025, 4:00 PM',
    lastUpdated: '21 Dec 2024, 7:15 PM',
    status: 'Submitted',
    createdTime: '2024-08-01T00:00:00Z',
    updatedTime: '2024-12-21T19:15:00Z',
    description:
      'Retail operations TP documentation with distribution analysis',
  },
  {
    id: '9',
    client: 'Financial Holdings Sdn Bhd',
    fy: '31 Mar 2025',
    tpType: 'Full',
    team: ['Steve', 'Tina'],
    progress: 35,
    deadline: '30 Jun 2025, 12:00 PM',
    lastUpdated: '19 Dec 2024, 1:45 PM',
    status: 'Draft',
    createdTime: '2024-11-15T00:00:00Z',
    updatedTime: '2024-12-19T13:45:00Z',
    description:
      'Financial services TP documentation with regulatory compliance focus',
  },
  {
    id: '10',
    client: 'Energy Corp Sdn Bhd',
    fy: '30 Sep 2024',
    tpType: 'Min',
    team: ['Uma', 'Victor', 'Wendy'],
    progress: 80,
    deadline: '31 Jan 2025, 2:00 PM',
    lastUpdated: '23 Dec 2024, 4:50 PM',
    status: 'Rejected',
    createdTime: '2024-07-01T00:00:00Z',
    updatedTime: '2024-12-23T16:50:00Z',
    description:
      'Energy sector TP documentation - requires revision per tax authority feedback',
  },
  {
    id: '11',
    client: 'Healthcare Solutions Sdn Bhd',
    fy: '31 Dec 2024',
    tpType: 'Full',
    team: ['Xavier', 'Yara', 'Zoe', 'Adam'],
    progress: 55,
    deadline: '15 Mar 2025, 11:00 AM',
    lastUpdated: '24 Dec 2024, 6:30 PM',
    status: 'Draft',
    createdTime: '2024-09-01T00:00:00Z',
    updatedTime: '2024-12-24T18:30:00Z',
    description:
      'Healthcare industry TP documentation with IP licensing components',
  },
  {
    id: '12',
    client: 'Logistics Express Sdn Bhd',
    fy: '28 Feb 2024',
    tpType: 'Min',
    team: ['Ben', 'Cathy'],
    progress: 100,
    deadline: '31 May 2024, 5:30 PM',
    lastUpdated: '28 May 2024, 3:20 PM',
    status: 'Approved',
    createdTime: '2024-01-15T00:00:00Z',
    updatedTime: '2024-05-28T15:20:00Z',
    description:
      'Logistics and transportation TP documentation - Successfully completed',
  },
];

/**
 * Get TP Doc list with pagination and filtering
 */
export async function getTPDocList(
  params: TPDocApi.GetTPDocListParams = {},
): Promise<{ items: TPDocApi.TPDoc[]; total: number }> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  let filteredDocs = [...mockTPDocs];

  // Apply filters
  if (params.client) {
    filteredDocs = filteredDocs.filter((doc) =>
      doc.client.toLowerCase().includes((params.client || '').toLowerCase()),
    );
  }

  if (params.fy) {
    filteredDocs = filteredDocs.filter((doc) =>
      doc.fy.includes(params.fy || ''),
    );
  }

  if (params.tpType) {
    filteredDocs = filteredDocs.filter((doc) => doc.tpType === params.tpType);
  }

  if (params.status) {
    filteredDocs = filteredDocs.filter((doc) => doc.status === params.status);
  }

  // Apply pagination
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedDocs = filteredDocs.slice(startIndex, endIndex);

  return {
    items: paginatedDocs,
    total: filteredDocs.length,
  };
}

/**
 * Create a new TP Doc
 */
export async function createTPDoc(
  params: TPDocApi.CreateTPDocParams,
): Promise<{ data: TPDocApi.TPDoc; success: boolean }> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const newDoc: TPDocApi.TPDoc = {
    id: Date.now().toString(),
    ...params,
    lastUpdated: new Date().toLocaleString(),
    createdTime: new Date().toISOString(),
    updatedTime: new Date().toISOString(),
  };

  // Add to mock data
  mockTPDocs.unshift(newDoc);

  return {
    success: true,
    data: newDoc,
  };
}

/**
 * Update an existing TP Doc
 */
export async function updateTPDoc(
  id: string,
  params: TPDocApi.UpdateTPDocParams,
): Promise<{ data: TPDocApi.TPDoc; success: boolean }> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const docIndex = mockTPDocs.findIndex((doc) => doc.id === id);
  if (docIndex === -1) {
    throw new Error('TP Doc not found');
  }

  const updatedDoc = {
    ...mockTPDocs[docIndex],
    ...params,
    lastUpdated: new Date().toLocaleString(),
    updatedTime: new Date().toISOString(),
  };

  mockTPDocs[docIndex] = updatedDoc;

  return {
    success: true,
    data: updatedDoc,
  };
}

/**
 * Delete a TP Doc
 */
export async function deleteTPDoc(id: string): Promise<{ success: boolean }> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const docIndex = mockTPDocs.findIndex((doc) => doc.id === id);
  if (docIndex === -1) {
    throw new Error('TP Doc not found');
  }

  mockTPDocs.splice(docIndex, 1);

  return {
    success: true,
  };
}

/**
 * Get a single TP Doc by ID
 */
export async function getTPDocById(
  id: string,
): Promise<{ data: TPDocApi.TPDoc; success: boolean }> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const doc = mockTPDocs.find((doc) => doc.id === id);
  if (!doc) {
    throw new Error('TP Doc not found');
  }

  return {
    success: true,
    data: doc,
  };
}
