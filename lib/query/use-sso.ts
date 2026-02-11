'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import {
  URL_SSO_PROTOCOLS,
  URL_SSO_CONFIG,
  URL_SSO_CREATE_CONFIG,
  URL_SSO_UPDATE_CONFIG,
  URL_SSO_DELETE_CONFIG,
  URL_SSO_TEST_CONNECTION,
} from '@/constants/endpoints';
import type { SSOConfigResponse, SSOAvailableProtocolsResponse, SSOConfigCreateRequest, SSOConfigUpdateRequest } from '@/types/sso';

export const ssoKeys = {
  all: ['sso'] as const,
  protocols: () => [...ssoKeys.all, 'protocols'] as const,
  config: (institutionalId: string) => [...ssoKeys.all, 'config', institutionalId] as const,
};

async function fetchAvailableProtocols(): Promise<SSOAvailableProtocolsResponse> {
  return apiFetch<SSOAvailableProtocolsResponse>(URL_SSO_PROTOCOLS);
}

async function fetchSSOConfig(institutionalId: string): Promise<SSOConfigResponse> {
  return apiFetch<SSOConfigResponse>(URL_SSO_CONFIG(institutionalId));
}

async function createSSOConfig(data: SSOConfigCreateRequest): Promise<SSOConfigResponse> {
  // Backend gets institutional_id from current_user, so we don't send it
  return apiFetch<SSOConfigResponse>(URL_SSO_CREATE_CONFIG, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

async function updateSSOConfig(data: SSOConfigUpdateRequest): Promise<SSOConfigResponse> {
  // Backend gets institutional_id from current_user, so we don't send it
  return apiFetch<SSOConfigResponse>(URL_SSO_UPDATE_CONFIG, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

async function deleteSSOConfig(): Promise<{ message: string }> {
  // Backend gets institutional_id from current_user
  return apiFetch<{ message: string }>(URL_SSO_DELETE_CONFIG, {
    method: 'DELETE',
  });
}

async function testSSOConnection(institutionalId: string): Promise<{ success: boolean; message?: string; error?: string }> {
  return apiFetch<{ success: boolean; message?: string; error?: string }>(URL_SSO_TEST_CONNECTION(institutionalId), {
    method: 'GET',
  });
}

/**
 * Hook to fetch available SSO protocols
 */
export function useSSOProtocols() {
  return useQuery({
    queryKey: ssoKeys.protocols(),
    queryFn: fetchAvailableProtocols,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch SSO configuration for an institution
 */
export function useSSOConfig(institutionalId: string | null | undefined, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ssoKeys.config(institutionalId!),
    queryFn: () => fetchSSOConfig(institutionalId!),
    enabled: (options?.enabled ?? true) && !!institutionalId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to create SSO configuration
 */
export function useCreateSSOConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSSOConfig,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ssoKeys.config(data.institutional_id) });
      queryClient.invalidateQueries({ queryKey: ssoKeys.all });
    },
  });
}

/**
 * Hook to update SSO configuration
 */
export function useUpdateSSOConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SSOConfigUpdateRequest) => updateSSOConfig(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ssoKeys.config(data.institutional_id) });
      queryClient.invalidateQueries({ queryKey: ssoKeys.all });
    },
  });
}

/**
 * Hook to delete SSO configuration
 */
export function useDeleteSSOConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSSOConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ssoKeys.all });
    },
  });
}

/**
 * Hook to test SSO connection
 */
export function useTestSSOConnection() {
  return useMutation({
    mutationFn: testSSOConnection,
  });
}
