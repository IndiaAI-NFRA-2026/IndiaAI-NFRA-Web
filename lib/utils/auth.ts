import { USER_ROLE } from '@/enums/auth';

/**
 * Interface for token response (used by both login and refresh)
 */
export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  user: {
    id: string;
    username: string;
    email: string;
    full_name: string | null;
    is_active: boolean;
    created_at: string;
    is_superuser: boolean;
    is_upload_first: boolean;
    first_change_password: boolean;
    role: USER_ROLE;
  };
}

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user';
const TOKEN_EXPIRES_AT_KEY = 'token_expires_at';

/**
 * Save authentication tokens to localStorage.
 */
export function saveAuthTokens(response: TokenResponse): void {
  if (globalThis.window === undefined) return;

  // Save access token to localStorage (for Authorization header)
  globalThis.window.localStorage.setItem(ACCESS_TOKEN_KEY, response.access_token);

  // Save refresh token to localStorage
  globalThis.window.localStorage.setItem(REFRESH_TOKEN_KEY, response.refresh_token);

  // Save user info to localStorage
  globalThis.window.localStorage.setItem(USER_KEY, JSON.stringify(response.user));

  // Calculate and save token expiration time
  const expiresAt = Date.now() + response.expires_in * 1000;
  globalThis.window.localStorage.setItem(TOKEN_EXPIRES_AT_KEY, expiresAt.toString());
}

/**
 * Clear all authentication tokens from localStorage
 */
export function clearAuthTokens(): void {
  if (globalThis.window === undefined) return;

  globalThis.window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  globalThis.window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  globalThis.window.localStorage.removeItem(USER_KEY);
  globalThis.window.localStorage.removeItem(TOKEN_EXPIRES_AT_KEY);
}

/**
 * Get access token from localStorage
 */
export function getAccessToken(): string | null {
  if (globalThis.window === undefined) return null;
  return globalThis.window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

/**
 * Get refresh token from localStorage
 */
export function getRefreshToken(): string | null {
  if (globalThis.window === undefined) return null;
  return globalThis.window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * Get user info from localStorage
 */
export function getUserFromStorage(): TokenResponse['user'] | null {
  if (globalThis.window === undefined) return null;
  const userStr = globalThis.window.localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

/**
 * Check if access token is expired or about to expire
 */
export function isTokenExpired(): boolean {
  if (globalThis.window === undefined) return true;
  const expiresAtStr = globalThis.window.localStorage.getItem(TOKEN_EXPIRES_AT_KEY);
  if (!expiresAtStr) return true;

  const expiresAt = Number.parseInt(expiresAtStr, 10);
  // Consider expired if less than 1 minute remaining
  return Date.now() >= expiresAt - 60000;
}

/**
 * Refresh access token using refresh token
 * Note: This is a placeholder - actual refresh logic should be implemented in useRefreshToken hook
 */
export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearAuthTokens();
    return null;
  }
  // Actual refresh should be handled by useRefreshToken hook
  return getAccessToken();
}
