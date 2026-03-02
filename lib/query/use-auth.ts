'use client';

import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { apiFetch, refreshAccessTokenInternal } from '@/lib/api';
import { saveAuthTokens, clearAuthTokens, getAccessToken, getRefreshToken } from '@/lib/utils/auth';
import { getDefaultRouteForUser } from '@/lib/auth/rbac';
import type {
  LoginRequest,
  LoginResponse,
  SSORedirectResponse,
  MeResponse,
  RefreshTokenResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  CheckSessionResponse,
} from '@/types/auth';
import { USER_ROLE } from '@/enums/auth';

export type { LoginRequest, User, LoginResponse, MeResponse } from '@/types/auth';

export const authKeys = {
  all: ['auth'] as const,
  login: () => [...authKeys.all, 'login'] as const,
  me: () => [...authKeys.all, 'me'] as const,
  refresh: () => [...authKeys.all, 'refresh'] as const,
  forgotPassword: () => [...authKeys.all, 'forgotPassword'] as const,
  resetPassword: () => [...authKeys.all, 'resetPassword'] as const,
  changePassword: () => [...authKeys.all, 'changePassword'] as const,
  checkSession: () => [...authKeys.all, 'checkSession'] as const,
};

async function loginUser(data: LoginRequest): Promise<LoginResponse | SSORedirectResponse> {
  return apiFetch<LoginResponse | SSORedirectResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

async function getMe(): Promise<MeResponse> {
  return apiFetch<MeResponse>('/auth/me');
}

async function refreshToken(): Promise<RefreshTokenResponse> {
  const refreshTokenValue = getRefreshToken();
  if (!refreshTokenValue) {
    throw new Error('No refresh token available');
  }

  // Reuse refreshAccessTokenInternal() to avoid code duplication
  // It handles correct BE endpoint construction and prevents multiple simultaneous refresh calls
  const tokenResponse = await refreshAccessTokenInternal();

  if (!tokenResponse) {
    throw new Error('Failed to refresh token');
  }

  // TokenResponse and RefreshTokenResponse have the same structure
  return tokenResponse as RefreshTokenResponse;
}

async function logoutUser(): Promise<void> {
  return apiFetch<void>('/auth/logout', {
    method: 'POST',
  });
}

async function forgotPassword(data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
  return apiFetch<ForgotPasswordResponse>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

async function resetPassword(data: ResetPasswordRequest): Promise<ResetPasswordResponse> {
  return apiFetch<ResetPasswordResponse>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

async function changePassword(data: ChangePasswordRequest, accessToken: string): Promise<ChangePasswordResponse> {
  return apiFetch<ChangePasswordResponse>('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

async function checkSession(): Promise<CheckSessionResponse> {
  return apiFetch<CheckSessionResponse>('/auth/check-session', {
    method: 'GET',
  });
}

// Helper function to handle SSO redirect
function handleSSORedirect(ssoResponse: SSORedirectResponse) {
  if (ssoResponse.method === 'GET') {
    // For GET requests, redirect using globalThis.location
    globalThis.location.href = ssoResponse.redirect_url;
  } else if (ssoResponse.method === 'POST') {
    // For POST requests, create and submit a form
    const form = globalThis.document.createElement('form');
    form.method = 'POST';
    form.action = ssoResponse.redirect_url;

    // Add form data if provided
    if (ssoResponse.data) {
      for (const [key, value] of Object.entries(ssoResponse.data)) {
        const input = globalThis.document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = typeof value === 'string' ? value : JSON.stringify(value);
        form.appendChild(input);
      }
    }

    globalThis.document.body.appendChild(form);
    form.submit();
  }
}

// Helper function to handle first password change
function handleFirstPasswordChange(loginResponse: LoginResponse, router: ReturnType<typeof useRouter>) {
  // Don't save tokens, redirect to reset password page with access_token as token
  router.push(`/reset-password?token=${encodeURIComponent(loginResponse.access_token)}&type=first-change`);
}

// Helper function to handle regular login
function handleRegularLogin(
  loginResponse: LoginResponse,
  queryClient: ReturnType<typeof useQueryClient>,
  router: ReturnType<typeof useRouter>
) {
  // Save tokens
  saveAuthTokens(loginResponse);
  queryClient.invalidateQueries({ queryKey: authKeys.me() });

  // Redirect to default route based on user role
  const defaultRoute = getDefaultRouteForUser(loginResponse.user.role as USER_ROLE);
  router.push(defaultRoute);
}

export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (response) => {
      // Handle SSO redirect
      if ('sso_redirect' in response && response.sso_redirect) {
        handleSSORedirect(response);
        return;
      }

      // Regular login response
      const loginResponse = response as LoginResponse;

      // Check if user needs to change password for the first time
      if (loginResponse.user.first_change_password === false) {
        handleFirstPasswordChange(loginResponse, router);
        return;
      }

      // Handle regular login
      handleRegularLogin(loginResponse, queryClient, router);
    },
  });
}

export function useMe() {
  const accessToken = getAccessToken();

  return useQuery({
    queryKey: authKeys.me(),
    queryFn: getMe,
    enabled: !!accessToken,
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useRefreshToken() {
  const router = useRouter();

  return useMutation({
    mutationFn: refreshToken,
    onSuccess: (response) => {
      saveAuthTokens(response);
    },
    onError: () => {
      clearAuthTokens();
      router.push('/login');
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      clearAuthTokens();
      queryClient.clear();
      router.push('/login');
    },
    onError: () => {
      clearAuthTokens();
      queryClient.clear();
      router.push('/login');
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: forgotPassword,
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: resetPassword,
  });
}

export function useChangePassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, accessToken }: { data: ChangePasswordRequest; accessToken: string }) => changePassword(data, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
    },
  });
}

/**
 * Hook to check session validity periodically
 * Used for single session enforcement - if session is invalid, automatically logout
 */
export function useCheckSession(enabled: boolean = true) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const accessToken = getAccessToken();

  const { data, isError } = useQuery({
    queryKey: authKeys.checkSession(),
    queryFn: checkSession,
    enabled: enabled && !!accessToken,
    refetchInterval: 3000, // Check every 3 seconds
    retry: false,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (!enabled || !accessToken) return;

    // If session is invalid or user is inactive, logout user
    if (data && (!data.is_valid || !data.is_active)) {
      clearAuthTokens();
      queryClient.clear();
      router.push('/login');
    }

    // If check fails (401, etc.), session is invalid - logout
    if (isError) {
      clearAuthTokens();
      queryClient.clear();
      router.push('/login');
    }
  }, [data, isError, enabled, accessToken, queryClient, router]);

  return { data, isError };
}
