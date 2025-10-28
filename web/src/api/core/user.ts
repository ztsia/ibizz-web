import type { UserInfo } from '@vben/types';

/**
 * 获取用户信息
 */
export async function getUserInfoApi() {
  // HARDCODED DATA: Return mock user information
  return {
    userId: '1',
    username: 'admin',
    realName: 'Admin User',
    avatar: '',
    desc: 'System Administrator',
    homePath: '/dashboard',
    roles: [
      {
        roleName: 'Super Admin',
        value: 'super_admin',
      },
    ],
    token: 'mock-token-12345',
  } as UserInfo;
}
