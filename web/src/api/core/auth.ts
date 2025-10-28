export namespace AuthApi {
  /** 登录接口参数 */
  export interface LoginParams {
    password?: string;
    username?: string;
  }

  /** 登录接口返回值 */
  export interface LoginResult {
    accessToken: string;
  }

  export interface RefreshTokenResult {
    data: string;
    status: number;
  }
}

/**
 * 登录
 */
export async function loginApi(data: AuthApi.LoginParams) {
  // HARDCODED DATA: Return mock login data
  console.log('Mock login with data:', data);
  return {
    accessToken: 'mock-access-token-12345',
  };
}

/**
 * 刷新accessToken
 */
export async function refreshTokenApi() {
  // HARDCODED DATA: Return mock refresh token data
  console.log('Mock refresh token');
  return {
    data: 'mock-refreshed-token-67890',
    status: 200,
  };
}

/**
 * 退出登录
 */
export async function logoutApi() {
  // HARDCODED DATA: Mock logout
  console.log('Mock logout');
  return { success: true };
}

/**
 * 获取用户权限码
 */
export async function getAccessCodesApi() {
  // HARDCODED DATA: Return mock access codes
  return [
    'system:user:list',
    'system:user:create',
    'system:user:update',
    'system:user:delete',
    'system:role:list',
    'system:menu:list',
  ];
}
