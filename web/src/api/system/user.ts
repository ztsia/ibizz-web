export namespace SystemUserApi {
  export interface SystemUser {
    contactNumber: string;
    createdTime: string;
    email: string;
    id: string;
    lastLoginTime: string;
    lastModifiedTime: string;
    name: string;
    role: string;
    status: 'ACTIVE' | 'INACTIVE';
  }

  export interface GetUserListParams {
    contactNumber?: string;
    email?: string;
    name?: string;
    page?: number;
    pageSize?: number;
    role?: string;
    status?: string;
  }

  export interface CreateUserParams {
    contactNumber?: string;
    email: string;
    name: string;
    role: string;
    status?: 'ACTIVE' | 'INACTIVE';
  }

  export interface UpdateUserParams {
    contactNumber?: string;
    email?: string;
    name?: string;
    role?: string;
    status?: 'ACTIVE' | 'INACTIVE';
  }
}

// Mock data for development
const mockUsers: SystemUserApi.SystemUser[] = [
  {
    id: '1',
    name: 'Shelley Ho',
    email: 'shelley.ho@gentech.ai.com',
    contactNumber: '+60 12-345 6789',
    role: 'Agency Admin',
    status: 'ACTIVE',
    lastLoginTime: '2024-12-15 10:42:38',
    createdTime: '2024-01-15 09:30:00',
    lastModifiedTime: '2024-12-15 10:40:43',
  },
  {
    id: '2',
    name: 'Marcus Chen',
    email: 'marcus.chen@company.com',
    contactNumber: '+60 11-987 6543',
    role: 'Candidate Holder',
    status: 'ACTIVE',
    lastLoginTime: '2024-12-14 15:35:26',
    createdTime: '2024-02-20 14:20:00',
    lastModifiedTime: '2024-12-14 15:23:28',
  },
  {
    id: '3',
    name: 'Sharon Williams',
    email: 'sharon.williams@enterprise.com',
    contactNumber: '+60 13-456 7890',
    role: 'Agency Admin',
    status: 'ACTIVE',
    lastLoginTime: '2024-12-13 16:21:11',
    createdTime: '2024-01-10 11:45:00',
    lastModifiedTime: '2024-12-13 16:20:00',
  },
  {
    id: '4',
    name: 'David Rodriguez',
    email: 'david.rodriguez@clientcorp.com',
    contactNumber: '+60 14-789 0123',
    role: 'Client Holder',
    status: 'ACTIVE',
    lastLoginTime: '2024-12-12 17:57:09',
    createdTime: '2024-03-05 08:15:00',
    lastModifiedTime: '2024-12-12 17:41:50',
  },
  {
    id: '5',
    name: 'Emily Johnson',
    email: 'emily.johnson@talentfirm.com',
    contactNumber: '+60 15-234 5678',
    role: 'Candidate Holder',
    status: 'ACTIVE',
    lastLoginTime: '2024-12-11 17:57:53',
    createdTime: '2024-03-12 10:30:00',
    lastModifiedTime: '2024-12-11 17:41:56',
  },
  {
    id: '6',
    name: 'Sarah Thompson',
    email: 'sarah.thompson@recruitment.com',
    contactNumber: '+60 16-345 6789',
    role: 'Candidate Holder',
    status: 'ACTIVE',
    lastLoginTime: '2024-12-10 14:30:00',
    createdTime: '2024-04-18 13:20:00',
    lastModifiedTime: '2024-12-10 14:25:00',
  },
  {
    id: '7',
    name: 'Michael Brown',
    email: 'michael.brown@staffing.com',
    contactNumber: '+60 17-456 7890',
    role: 'Candidate Holder',
    status: 'ACTIVE',
    lastLoginTime: '2024-12-09 16:45:00',
    createdTime: '2024-05-22 15:10:00',
    lastModifiedTime: '2024-12-09 16:40:00',
  },
  {
    id: '8',
    name: 'Jessica Davis',
    email: 'jessica.davis@hrservices.com',
    contactNumber: '+60 18-567 8901',
    role: 'Candidate Holder',
    status: 'INACTIVE',
    lastLoginTime: '2024-11-25 14:53:10',
    createdTime: '2024-06-08 12:00:00',
    lastModifiedTime: '2024-11-30 09:15:00',
  },
  {
    id: '9',
    name: 'Chen Hui Yee',
    email: 'chen.huiyee@businesscorp.com',
    contactNumber: '+60 19-678 9012',
    role: 'Client Holder',
    status: 'ACTIVE',
    lastLoginTime: '2024-12-08 14:07:41',
    createdTime: '2024-07-15 16:30:00',
    lastModifiedTime: '2024-12-08 14:05:00',
  },
  {
    id: '10',
    name: 'Robert Wilson',
    email: 'robert.wilson@talentpool.com',
    contactNumber: '+60 10-789 0123',
    role: 'Candidate Holder',
    status: 'ACTIVE',
    lastLoginTime: '2024-12-07 16:04:08',
    createdTime: '2024-08-20 11:25:00',
    lastModifiedTime: '2024-12-07 16:00:00',
  },
  {
    id: '11',
    name: 'Amanda Lee',
    email: 'amanda.lee@executive.com',
    contactNumber: '+60 12-890 1234',
    role: 'Agency Admin',
    status: 'ACTIVE',
    lastLoginTime: '2024-12-06 13:20:15',
    createdTime: '2024-09-10 14:45:00',
    lastModifiedTime: '2024-12-06 13:15:00',
  },
  {
    id: '12',
    name: 'Kevin Zhang',
    email: 'kevin.zhang@clientsolutions.com',
    contactNumber: '+60 13-901 2345',
    role: 'Client Holder',
    status: 'INACTIVE',
    lastLoginTime: '2024-11-20 10:30:00',
    createdTime: '2024-10-05 09:00:00',
    lastModifiedTime: '2024-11-25 08:45:00',
  },
];

/**
 * Get user list with pagination and filtering
 */
export async function getUserList(
  params: SystemUserApi.GetUserListParams = {},
): Promise<{ items: SystemUserApi.SystemUser[]; total: number }> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  let filteredUsers = [...mockUsers];

  // Apply filters
  if (params.name) {
    filteredUsers = filteredUsers.filter((user) =>
      user.name.toLowerCase().includes((params.name || '').toLowerCase()),
    );
  }

  if (params.email) {
    filteredUsers = filteredUsers.filter((user) =>
      user.email.toLowerCase().includes((params.email || '').toLowerCase()),
    );
  }

  if (params.contactNumber) {
    filteredUsers = filteredUsers.filter((user) =>
      user.contactNumber
        .toLowerCase()
        .includes((params.contactNumber || '').toLowerCase()),
    );
  }

  if (params.role) {
    filteredUsers = filteredUsers.filter((user) => user.role === params.role);
  }

  if (params.status) {
    filteredUsers = filteredUsers.filter(
      (user) => user.status === params.status,
    );
  }

  // Apply pagination
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  return {
    items: filteredUsers.slice(startIndex, endIndex),
    total: filteredUsers.length,
  };
}

/**
 * Create a new user
 */
export async function createUser(
  params: SystemUserApi.CreateUserParams,
): Promise<SystemUserApi.SystemUser> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const newUser: SystemUserApi.SystemUser = {
    id: Date.now().toString(),
    name: params.name,
    email: params.email,
    contactNumber: params.contactNumber || 'N/A',
    role: params.role,
    status: params.status || 'ACTIVE',
    lastLoginTime: 'N/A',
    createdTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
    lastModifiedTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
  };

  mockUsers.push(newUser);
  return newUser;
}

/**
 * Update an existing user
 */
export async function updateUser(
  id: string,
  params: SystemUserApi.UpdateUserParams,
): Promise<SystemUserApi.SystemUser> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const userIndex = mockUsers.findIndex((user) => user.id === id);
  if (userIndex === -1) {
    throw new Error('User not found');
  }

  const updatedUser: SystemUserApi.SystemUser = {
    ...mockUsers[userIndex],
    ...params,
    contactNumber: params.contactNumber ?? mockUsers[userIndex].contactNumber,
    lastModifiedTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
  };

  mockUsers[userIndex] = updatedUser;
  return updatedUser;
}

/**
 * Delete a user
 */
export async function deleteUser(id: string): Promise<void> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const userIndex = mockUsers.findIndex((user) => user.id === id);
  if (userIndex === -1) {
    throw new Error('User not found');
  }

  mockUsers.splice(userIndex, 1);
}

/**
 * Get user by ID
 */
export async function getUserById(
  id: string,
): Promise<SystemUserApi.SystemUser> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const user = mockUsers.find((user) => user.id === id);
  if (!user) {
    throw new Error('User not found');
  }

  return user;
}

/**
 * Reset user password
 */
export async function resetUserPassword(id: string): Promise<void> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const user = mockUsers.find((user) => user.id === id);
  if (!user) {
    throw new Error('User not found');
  }
}
