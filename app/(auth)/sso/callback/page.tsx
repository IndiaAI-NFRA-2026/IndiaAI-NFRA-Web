'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { saveAuthTokens } from '@/lib/utils/auth';
import { authKeys } from '@/lib/query/use-auth';
import type { LoginResponse } from '@/types/auth';
import { Spinner } from '@/components/ui/spinner';
import { HeaderLogin } from '@/components/(auth)/login/header-login';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { USER_ROLE } from '@/enums/auth';
import { getDefaultRouteForUser } from '@/lib/auth/rbac';

function SSOCallbackContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const [status, setStatus] = useState<'processing' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const processSSOCallback = async () => {
      try {
        // Extract token from URL hash
        // Backend redirects to /sso/callback#{base64_encoded_token_response}
        const hash = globalThis.window.location.hash;

        if (!hash || hash.length <= 1) {
          throw new Error('No token found in URL hash');
        }

        // Remove the '#' character
        const tokenEncoded = hash.substring(1);

        if (!tokenEncoded) {
          throw new Error('Token is empty');
        }

        // Decode base64 token response
        let tokenResponse: LoginResponse;
        try {
          // Decode base64 URL-safe encoding
          // Convert URL-safe base64 to standard base64
          const standardBase64 = tokenEncoded.replaceAll('-', '+').replaceAll('_', '/');
          // atob is available in browser environment
          const tokenJson = (globalThis as any).atob(standardBase64);
          tokenResponse = JSON.parse(tokenJson) as LoginResponse;
        } catch {
          // Error decoding token - invalid format
          throw new Error('Invalid token format');
        }

        // Validate token response structure
        if (!tokenResponse.access_token || !tokenResponse.user) {
          throw new Error('Invalid token response structure');
        }

        // Save tokens to localStorage
        saveAuthTokens(tokenResponse);

        // Invalidate user query to refresh user data
        queryClient.invalidateQueries({ queryKey: authKeys.me() });

        // Show success message
        toast.success(t('login.loginSuccessful'));

        // Redirect to default route based on user role
        const defaultRoute = getDefaultRouteForUser(tokenResponse.user.role as USER_ROLE);
        router.push(defaultRoute);
      } catch (error) {
        // SSO callback error occurred
        setStatus('error');
        const message = error instanceof Error ? error.message : t('login.loginFailed');
        setErrorMessage(message);
        toast.error(message);

        // Redirect to login page after a delay
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    };

    processSSOCallback();
  }, [router, queryClient, t]);

  return (
    <div className="min-h-screen md:p-10">
      <div className="relative w-full">
        <div className="h-96 w-full bg-(--color-background-navy) md:rounded"></div>
        <div className="absolute top-1/2 left-1/2 z-10 w-[404px] max-w-md -translate-x-1/2 rounded bg-(--color-background-color) p-[60px] shadow-[0px_1px_4px_0px_#0C0C0D0D]">
          <HeaderLogin t={t} />
          <div className="mt-8">
            {status === 'error' ? (
              <div className="text-center">
                <div className="mb-4 text-red-600">
                  <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 className="mb-2 text-lg font-semibold text-red-600">{t('login.loginFailed')}</h2>
                <p className="mb-4 text-sm text-gray-600">{errorMessage}</p>
                <p className="text-xs text-gray-500">{t('login.redirectingToLogin')}</p>
              </div>
            ) : (
              <div className="text-center">
                <Spinner className="mx-auto mb-4 size-8 animate-spin" />
                <p className="text-lg font-medium">{t('login.processingSSO')}</p>
                <p className="mt-2 text-sm text-gray-500">{t('login.pleaseWait')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SSOCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen md:p-10">
          <div className="relative w-full">
            <div className="h-96 w-full bg-(--color-background-navy) md:rounded"></div>
            <div className="absolute top-1/2 left-1/2 z-10 w-[404px] max-w-md -translate-x-1/2 rounded bg-(--color-background-color) p-[60px] shadow-[0px_1px_4px_0px_#0C0C0D0D]">
              <div className="text-center">
                <Spinner className="mx-auto mb-4 size-8 animate-spin" />
                <p className="text-lg">Loading...</p>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <SSOCallbackContent />
    </Suspense>
  );
}
