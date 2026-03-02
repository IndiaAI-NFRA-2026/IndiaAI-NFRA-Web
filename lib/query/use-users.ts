'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import type { User } from '@/types/auth';
import { UserUpsert } from '@/types/user';

// Types
export interface UserListResponse {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  users: User[];
}

export interface UserFilters {
  page?: number;
  page_size?: number;
  search?: string;
  role?: string;
  status?: boolean;
  created_date?: string;
}

export interface ResetPasswordRequest {
  reset_method: 'email' | 'temporary';
}

export interface ResetPasswordResponse {
  message: string;
  temporary_password?: string;
  success: boolean;
}

// Query Keys
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...userKeys.lists(), filters] as const,
  detail: (id: string) => [...userKeys.all, 'detail', id] as const,
};

// API Functions
async function fetchUsers(filters: UserFilters): Promise<UserListResponse> {
  const params = new URLSearchParams();
  params.append('page', (filters.page || 1).toString());
  params.append('page_size', (filters.page_size || 10).toString());

  if (filters.search) params.append('search', filters.search.trim());
  if (filters.role && filters.role !== 'all') {
    params.append('role', filters.role);
  }
  if (filters.status !== undefined) {
    params.append('status', filters.status.toString());
  }
  if (filters.created_date) params.append('created_date', filters.created_date);

  return apiFetch<UserListResponse>(`/users/?${params.toString()}`, {
    method: 'GET',
  });
}

async function fetchUserById(id: string): Promise<User> {
  return apiFetch<User>(`/users/${id}`, {
    method: 'GET',
  });
}

async function createUser(data: UserUpsert): Promise<User> {
  return apiFetch<User>('/users', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

async function updateUser(data: UserUpsert): Promise<User> {
  return apiFetch<User>(`/users/${data.id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

async function deleteUser(id: string): Promise<void> {
  return apiFetch<void>(`/users/${id}`, {
    method: 'DELETE',
  });
}

async function resetPassword(id: string, data: ResetPasswordRequest): Promise<ResetPasswordResponse> {
  return apiFetch<ResetPasswordResponse>(`/users/${id}/reset-password`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Custom Hooks
/**
 * Hook to fetch users list with pagination and filters
 */
export function useUsers(options?: {
  enabled?: boolean;
  page?: number;
  pageSize?: number;
  search?: string;
  role?: string;
  status?: string;
  createdDate?: string;
}) {
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 10;
  const search = options?.search ?? '';
  const role = options?.role ?? 'all';
  const status = options?.status && options.status !== 'all' ? options.status === 'active' : undefined;
  const createdDate = options?.createdDate ?? '';

  return useQuery({
    queryKey: userKeys.list({
      page,
      pageSize,
      search,
      role,
      status: options?.status,
      createdDate,
    }),
    queryFn: () =>
      fetchUsers({
        page,
        page_size: pageSize,
        search: search || undefined,
        role: role === 'all' ? undefined : role,
        status,
        created_date: createdDate || undefined,
      }),
    enabled: options?.enabled ?? true,
  });
}

/**
 * Hook to fetch a single user by ID
 */
export function useUser(id: string, enabled = true) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => fetchUserById(id),
    enabled: enabled && !!id,
  });
}

/**
 * Hook to create a new user
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

/**
 * Hook to update a user
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UserUpsert) => updateUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

/**
 * Hook to delete a user
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

/**
 * Hook to reset user password
 */
export function useResetPassword() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ResetPasswordRequest }) => resetPassword(id, data),
  });
}
