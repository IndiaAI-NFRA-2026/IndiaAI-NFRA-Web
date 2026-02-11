'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import type { Institution, InstitutionUpdate } from '@/types/institution';
import { useMe } from './use-auth';

// Query Keys
export const institutionKeys = {
  all: ['institutionals'] as const,
  detail: (id?: string) => [...institutionKeys.all, 'detail', id] as const,
};

// API Functions
async function fetchInstitutionById(id: string): Promise<Institution> {
  return apiFetch<Institution>(`/institutionals/${id}`, {
    method: 'GET',
  });
}

async function updateInstitution(id: string, data: InstitutionUpdate): Promise<Institution> {
  return apiFetch<Institution>(`/institutionals/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export interface UploadSingleFileResponse {
  message: string;
  file: {
    file_name: string;
    file_size: number;
    content_type: string;
    file_extension: string;
    s3_key: string;
    s3_url: string;
    uploaded_at: string;
  };
}

async function uploadSingleFile(file: File): Promise<UploadSingleFileResponse> {
  const formData = new FormData();
  formData.append('file', file);

  return apiFetch<UploadSingleFileResponse>('/upload/single', {
    method: 'POST',
    body: formData,
  });
}

// Custom Hooks
/**
 * Hook to fetch institution settings by ID
 * If no ID provided, will try to get from current user's institutional_id
 */
export function useInstitution(institutionalId?: string, options?: { enabled?: boolean }) {
  const { data: user } = useMe();
  const id = institutionalId || (user as any)?.institutional_id;

  return useQuery({
    queryKey: institutionKeys.detail(id),
    queryFn: () => {
      if (!id) {
        throw new Error('institution.idRequired');
      }
      return fetchInstitutionById(id);
    },
    enabled: (options?.enabled ?? true) && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to update institution settings
 */
export function useUpdateInstitution() {
  const queryClient = useQueryClient();
  const { data: user } = useMe();
  const institutionalId = (user as any)?.institutional_id;

  return useMutation({
    mutationFn: (data: InstitutionUpdate) => updateInstitution(institutionalId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: institutionKeys.detail(institutionalId),
      });
    },
  });
}

/**
 * Hook to upload a single file
 */
export function useUploadSingleFile() {
  return useMutation({
    mutationFn: (file: File) => uploadSingleFile(file),
  });
}
