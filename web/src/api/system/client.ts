export namespace SystemClientApi {
  export interface SystemClient {
    address: string;
    city: string;
    company: string;
    contactNumber: string;
    country: string;
    createdTime: string;
    description?: string;
    email: string;
    id: string;
    image?: string;
    industry: string;
    lastContactTime?: string;
    lastModifiedTime: string;
    name: string;
    status: 'ACTIVE' | 'INACTIVE';
    website?: string;
  }

  export interface GetClientListParams {
    city?: string;
    company?: string;
    country?: string;
    email?: string;
    industry?: string;
    name?: string;
    page?: number;
    pageSize?: number;
    status?: string;
  }

  export interface CreateClientParams {
    address: string;
    city: string;
    company: string;
    contactNumber: string;
    country: string;
    description?: string;
    email: string;
    image?: string;
    industry: string;
    name: string;
    status?: 'ACTIVE' | 'INACTIVE';
    website?: string;
  }

  export interface UpdateClientParams {
    address?: string;
    city?: string;
    company?: string;
    contactNumber?: string;
    country?: string;
    description?: string;
    email?: string;
    image?: string;
    industry?: string;
    name?: string;
    status?: 'ACTIVE' | 'INACTIVE';
    website?: string;
  }
}

// Mock data for development
const mockClients: SystemClientApi.SystemClient[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@techcorp.com',
    contactNumber: '+1 (555) 123-4567',
    company: 'TechCorp Solutions',
    industry: 'Technology',
    website: 'https://techcorp.com',
    address: '123 Tech Street, Suite 400',
    city: 'San Francisco',
    country: 'United States',
    image:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    description:
      'Leading technology solutions provider specializing in enterprise software development and cloud infrastructure.',
    status: 'ACTIVE',
    createdTime: '2024-01-15 09:30:00',
    lastModifiedTime: '2024-11-20 14:22:00',
    lastContactTime: '2024-11-18 16:45:00',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@healthplus.com',
    contactNumber: '+1 (555) 987-6543',
    company: 'HealthPlus Medical Center',
    industry: 'Healthcare',
    website: 'https://healthplus.com',
    address: '456 Medical Center Blvd, Floor 12',
    city: 'New York',
    country: 'United States',
    image:
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    description:
      'Comprehensive healthcare services with focus on patient-centered care and innovative medical technologies.',
    status: 'ACTIVE',
    createdTime: '2024-01-10 11:15:00',
    lastModifiedTime: '2024-11-19 10:30:00',
    lastContactTime: '2024-11-17 14:20:00',
  },
  {
    id: '3',
    name: 'Michael Chen',
    email: 'michael.chen@financegroup.com',
    contactNumber: '+1 (555) 456-7890',
    company: 'Global Finance Group Ltd',
    industry: 'Finance',
    website: 'https://globalfinancegroup.com',
    address: '789 Wall Street, 25th Floor',
    city: 'New York',
    country: 'United States',
    image:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    description:
      'Investment and financial advisory services for corporate clients with expertise in international markets.',
    status: 'ACTIVE',
    createdTime: '2024-01-05 14:20:00',
    lastModifiedTime: '2024-11-16 09:15:00',
    lastContactTime: '2024-11-15 13:45:00',
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily.davis@retailworld.com',
    contactNumber: '+1 (555) 321-0987',
    company: 'Retail World Inc',
    industry: 'Retail',
    website: 'https://retailworld.com',
    address: '321 Commerce Ave, Building B',
    city: 'Chicago',
    country: 'United States',
    image:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    description:
      'Multi-channel retail solutions and e-commerce platform development with omnichannel integration.',
    status: 'INACTIVE',
    createdTime: '2024-01-08 16:30:00',
    lastModifiedTime: '2024-10-16 11:20:00',
    lastContactTime: '2024-10-14 15:10:00',
  },
  {
    id: '5',
    name: 'David Rodriguez',
    email: 'david.rodriguez@manufacturing.com',
    contactNumber: '+1 (555) 789-0123',
    company: 'Advanced Manufacturing Solutions',
    industry: 'Manufacturing',
    website: 'https://advancedmfg.com',
    address: '555 Industrial Park Dr',
    city: 'Detroit',
    country: 'United States',
    image:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    description:
      'Precision manufacturing and automation solutions for automotive and aerospace industries.',
    status: 'ACTIVE',
    createdTime: '2024-02-12 08:45:00',
    lastModifiedTime: '2024-11-14 16:30:00',
    lastContactTime: '2024-11-12 11:15:00',
  },
  {
    id: '6',
    name: 'Lisa Wang',
    email: 'lisa.wang@edutech.com',
    contactNumber: '+1 (555) 654-3210',
    company: 'EduTech Innovations',
    industry: 'Education',
    website: 'https://edutech-innovations.com',
    address: '888 University Ave, Campus Center',
    city: 'Boston',
    country: 'United States',
    image:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    description:
      'Educational technology solutions and digital learning platforms for K-12 and higher education.',
    status: 'ACTIVE',
    createdTime: '2024-02-20 13:20:00',
    lastModifiedTime: '2024-11-13 09:45:00',
    lastContactTime: '2024-11-11 15:30:00',
  },
  {
    id: '7',
    name: 'James Thompson',
    email: 'james.thompson@realestate.com',
    contactNumber: '+1 (555) 147-2580',
    company: 'Premier Real Estate Group',
    industry: 'Real Estate',
    website: 'https://premierrealestate.com',
    address: '999 Property Lane, Tower 1',
    city: 'Los Angeles',
    country: 'United States',
    image:
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face',
    description:
      'Commercial and residential real estate development with sustainable building practices.',
    status: 'ACTIVE',
    createdTime: '2024-03-05 10:15:00',
    lastModifiedTime: '2024-11-10 14:20:00',
    lastContactTime: '2024-11-08 12:45:00',
  },
  {
    id: '8',
    name: 'Maria Garcia',
    email: 'maria.garcia@consulting.com',
    contactNumber: '+1 (555) 369-1470',
    company: 'Strategic Consulting Partners',
    industry: 'Consulting',
    website: 'https://strategicconsulting.com',
    address: '777 Business Plaza, Executive Suite',
    city: 'Atlanta',
    country: 'United States',
    image:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face',
    description:
      'Management consulting and business transformation services for Fortune 500 companies.',
    status: 'ACTIVE',
    createdTime: '2024-03-18 15:40:00',
    lastModifiedTime: '2024-11-09 11:30:00',
    lastContactTime: '2024-11-07 16:20:00',
  },
  {
    id: '9',
    name: 'Robert Kim',
    email: 'robert.kim@mediagroup.com',
    contactNumber: '+1 (555) 258-1470',
    company: 'Digital Media Entertainment',
    industry: 'Media & Entertainment',
    website: 'https://digitalmedia.com',
    address: '333 Entertainment Blvd, Studio Complex',
    city: 'Los Angeles',
    country: 'United States',
    image:
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face',
    description:
      'Digital content creation and distribution platform for streaming and social media.',
    status: 'ACTIVE',
    createdTime: '2024-04-02 12:25:00',
    lastModifiedTime: '2024-11-06 13:15:00',
    lastContactTime: '2024-11-04 10:50:00',
  },
  {
    id: '10',
    name: 'Jennifer Lee',
    email: 'jennifer.lee@globaltech.sg',
    contactNumber: '+65 6123-4567',
    company: 'Global Tech Solutions Pte Ltd',
    industry: 'Technology',
    website: 'https://globaltech.sg',
    address: '1 Marina Bay Financial Centre, Level 30',
    city: 'Singapore',
    country: 'Singapore',
    image:
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face',
    description:
      'Regional technology hub providing AI and machine learning solutions across Asia-Pacific.',
    status: 'ACTIVE',
    createdTime: '2024-04-15 09:10:00',
    lastModifiedTime: '2024-11-05 15:45:00',
    lastContactTime: '2024-11-03 14:30:00',
  },
  {
    id: '11',
    name: 'Ahmed Hassan',
    email: 'ahmed.hassan@construction.ae',
    contactNumber: '+971 4-123-4567',
    company: 'Emirates Construction Group',
    industry: 'Other',
    website: 'https://emiratesconstruction.ae',
    address: 'Sheikh Zayed Road, Business Bay',
    city: 'Dubai',
    country: 'United Arab Emirates',
    image:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
    description:
      'Large-scale construction and infrastructure development projects in the Middle East region.',
    status: 'ACTIVE',
    createdTime: '2024-05-08 11:30:00',
    lastModifiedTime: '2024-11-02 12:20:00',
    lastContactTime: '2024-10-31 09:15:00',
  },
  {
    id: '12',
    name: 'Sophie Martin',
    email: 'sophie.martin@pharma.fr',
    contactNumber: '+33 1-23-45-67-89',
    company: 'BioPharm Research Institute',
    industry: 'Healthcare',
    website: 'https://biopharma.fr',
    address: '15 Avenue des Champs-Élysées',
    city: 'Paris',
    country: 'France',
    image:
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
    description:
      'Pharmaceutical research and development with focus on innovative drug discovery and clinical trials.',
    status: 'INACTIVE',
    createdTime: '2024-05-22 14:45:00',
    lastModifiedTime: '2024-09-15 16:30:00',
    lastContactTime: '2024-09-10 11:20:00',
  },
];

/**
 * Get client list with pagination and filtering
 */
export async function getClientList(
  params: SystemClientApi.GetClientListParams = {},
): Promise<{ items: SystemClientApi.SystemClient[]; total: number }> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  let filteredClients = [...mockClients];

  // Apply filters
  if (params.name) {
    filteredClients = filteredClients.filter((client) =>
      client.name.toLowerCase().includes((params.name || '').toLowerCase()),
    );
  }

  if (params.email) {
    filteredClients = filteredClients.filter((client) =>
      client.email.toLowerCase().includes((params.email || '').toLowerCase()),
    );
  }

  if (params.company) {
    filteredClients = filteredClients.filter((client) =>
      client.company
        .toLowerCase()
        .includes((params.company || '').toLowerCase()),
    );
  }

  if (params.industry) {
    filteredClients = filteredClients.filter(
      (client) => client.industry === params.industry,
    );
  }

  if (params.city) {
    filteredClients = filteredClients.filter((client) =>
      client.city.toLowerCase().includes((params.city || '').toLowerCase()),
    );
  }

  if (params.country) {
    filteredClients = filteredClients.filter((client) =>
      client.country
        .toLowerCase()
        .includes((params.country || '').toLowerCase()),
    );
  }

  if (params.status) {
    filteredClients = filteredClients.filter(
      (client) => client.status === params.status,
    );
  }

  // Apply pagination
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  return {
    items: filteredClients.slice(startIndex, endIndex),
    total: filteredClients.length,
  };
}

/**
 * Create a new client
 */
export async function createClient(
  params: SystemClientApi.CreateClientParams,
): Promise<SystemClientApi.SystemClient> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const newClient: SystemClientApi.SystemClient = {
    id: Date.now().toString(),
    name: params.name,
    email: params.email,
    contactNumber: params.contactNumber,
    company: params.company,
    industry: params.industry,
    website: params.website,
    address: params.address,
    city: params.city,
    country: params.country,
    image: params.image,
    description: params.description,
    status: params.status || 'ACTIVE',
    createdTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
    lastModifiedTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
  };

  mockClients.push(newClient);
  return newClient;
}

/**
 * Update an existing client
 */
export async function updateClient(
  id: string,
  params: SystemClientApi.UpdateClientParams,
): Promise<SystemClientApi.SystemClient> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const clientIndex = mockClients.findIndex((client) => client.id === id);
  if (clientIndex === -1) {
    throw new Error('Client not found');
  }

  const updatedClient: SystemClientApi.SystemClient = {
    ...mockClients[clientIndex],
    ...params,
    lastModifiedTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
  };

  mockClients[clientIndex] = updatedClient;
  return updatedClient;
}

/**
 * Delete a client
 */
export async function deleteClient(id: string): Promise<void> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const clientIndex = mockClients.findIndex((client) => client.id === id);
  if (clientIndex === -1) {
    throw new Error('Client not found');
  }

  mockClients.splice(clientIndex, 1);
}

/**
 * Get client by ID
 */
export async function getClientById(
  id: string,
): Promise<SystemClientApi.SystemClient> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const client = mockClients.find((client) => client.id === id);
  if (!client) {
    throw new Error('Client not found');
  }

  return client;
}
