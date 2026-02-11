'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useLogin } from '@/lib/query/use-auth';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { HeaderLogin } from '@/components/(auth)/login/header-login';
import { FormLogin } from '@/components/(auth)/login/form-login';
import { snakeToCamelCase, validateEmail as validateEmailFormat } from '@/lib/utils/helpers';
import { URL_SSO_INITIATE, URL_SSO_CHECK_ENABLED } from '@/constants/endpoints';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

const REMEMBER_ME_KEY = 'remembered_username';
const REMEMBERED_PASSWORD_KEY = 'remembered_password';

const encodePassword = (password: string): string => {
  if (globalThis.window === undefined) return '';
  // btoa is available in browser environment
  return (globalThis as any).btoa(password);
};

const decodePassword = (encoded: string): string => {
  if (globalThis.window === undefined) return '';
  try {
    // atob is available in browser environment
    return (globalThis as any).atob(encoded);
  } catch {
    return '';
  }
};

function LoginPageContent() {
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  // Use lazy initialization to read from localStorage only once during initial render
  const [username, setUsername] = useState(() => {
    if (globalThis.window === undefined) return '';
    return localStorage.getItem(REMEMBER_ME_KEY) || '';
  });
  const [password, setPassword] = useState(() => {
    if (globalThis.window === undefined) return '';
    const rememberedPasswordEncoded = localStorage.getItem(REMEMBERED_PASSWORD_KEY);
    if (rememberedPasswordEncoded) {
      return decodePassword(rememberedPasswordEncoded);
    }
    return '';
  });
  const [rememberMe, setRememberMe] = useState(() => {
    if (globalThis.window === undefined) return false;
    return !!localStorage.getItem(REMEMBER_ME_KEY);
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const loginMutation = useLogin();

  // Get institutional_id from URL query parameter
  const institutionalId = searchParams?.get('institutional_id') || null;

  // Check if SSO is enabled for this institution
  const { data: ssoStatus } = useQuery({
    queryKey: ['sso-enabled', institutionalId],
    queryFn: async () => {
      if (!institutionalId) return { is_enabled: false, has_config: false };
      try {
        // Use apiFetch which handles base URL automatically
        return await apiFetch<{ is_enabled: boolean; has_config: boolean }>(URL_SSO_CHECK_ENABLED(institutionalId));
      } catch (error) {
        // On any error, assume SSO is not enabled
        console.error('Error checking SSO status:', error);
        return { is_enabled: false, has_config: false };
      }
    },
    enabled: !!institutionalId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry on error
  });

  // Only show SSO button if SSO is enabled
  const showSSOButton = institutionalId && ssoStatus?.is_enabled === true;

  // Clean up localStorage when rememberMe is unchecked
  useEffect(() => {
    if (globalThis.window === undefined) return;

    if (!rememberMe) {
      // If rememberMe is unchecked, clean up stored password
      localStorage.removeItem(REMEMBERED_PASSWORD_KEY);
    }
  }, [rememberMe]);

  // Handle remember me checkbox change
  const handleRememberMeChange = (checked: boolean) => {
    setRememberMe(checked);
    // If unchecked, remove from storage immediately
    if (checked || globalThis.window === undefined) {
      return;
    }
    localStorage.removeItem(REMEMBER_ME_KEY);
    localStorage.removeItem(REMEMBERED_PASSWORD_KEY);
    setPassword('');
  };

  const validateEmail = (email: string): string | null => {
    if (!email.trim()) {
      return t('login.errorEmailRequired');
    }

    // Check for spaces at the beginning or end of email
    if (email.startsWith(' ') || email.endsWith(' ')) {
      return t('login.errorEmailFormat');
    }

    // Check for any spaces in email (including middle)
    if (/\s/.test(email)) {
      return t('login.errorEmailFormat');
    }

    if (!validateEmailFormat(email)) {
      return t('login.errorEmailFormatInvalid');
    }

    return null;
  };

  const validatePassword = (pwd: string): string | null => {
    // Check if password is empty
    if (pwd.length === 0) {
      return t('login.errorPasswordRequired');
    }

    // Check if password contains spaces
    if (/\s/.test(pwd)) {
      return t('login.errorPasswordNoSpaces');
    }

    if (pwd.length < 8) {
      return t('login.errorPasswordMinLength');
    }

    return null;
  };

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    if (touched.username) {
      const error = validateEmail(value);
      setErrors((prev) => ({
        ...prev,
        username: error || '',
      }));
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (touched.password) {
      const error = validatePassword(value);
      setErrors((prev) => ({
        ...prev,
        password: error || '',
      }));
    }
  };

  const handleUsernameBlur = () => {
    setTouched((prev) => ({ ...prev, username: true }));
    const error = validateEmail(username);
    setErrors((prev) => ({
      ...prev,
      username: error || '',
    }));
  };

  const handlePasswordBlur = () => {
    setTouched((prev) => ({ ...prev, password: true }));
    const error = validatePassword(password);
    setErrors((prev) => ({
      ...prev,
      password: error || '',
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setTouched({ username: true, password: true });

    const emailError = validateEmail(username);
    const passwordError = validatePassword(password);

    const newErrors: Record<string, string> = {};
    if (emailError) newErrors.username = emailError;
    if (passwordError) newErrors.password = passwordError;

    setErrors(newErrors);

    if (emailError || passwordError) {
      return;
    }

    // Trim username and password before sending to server
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    loginMutation.mutate(
      { username: trimmedUsername, password: trimmedPassword },
      {
        onSuccess: (response) => {
          // Handle SSO redirect - if it's an SSO redirect, useLogin hook already handled it
          if ('sso_redirect' in response && response.sso_redirect) {
            return;
          }

          // Regular login response
          const loginResponse = response as { user: { first_change_password: boolean } };

          // Handle remember me functionality
          if (rememberMe) {
            // Save username and password to localStorage (persists across sessions and tabs)
            localStorage.setItem(REMEMBER_ME_KEY, trimmedUsername);
            const encodedPassword = encodePassword(trimmedPassword);
            localStorage.setItem(REMEMBERED_PASSWORD_KEY, encodedPassword);
          } else {
            localStorage.removeItem(REMEMBER_ME_KEY);
            localStorage.removeItem(REMEMBERED_PASSWORD_KEY);
          }

          // Check if user needs to change password for the first time
          if (loginResponse.user.first_change_password === false) {
            // Don't show success toast, redirect will happen in useLogin hook
            return;
          }
          toast.success(t('login.loginSuccessful'));
          // Note: Redirect is handled by useLogin hook, so we don't need to redirect here
        },
        onError: (error) => {
          let errorMessage = t('login.loginFailed');

          if (error instanceof Error) {
            const apiError = error as {
              data?: { error_code?: string; detail?: string };
            };
            if (apiError.data?.error_code) {
              const translationKey = `login.${snakeToCamelCase(apiError.data.error_code)}`;
              const translatedMessage = t(translationKey);
              errorMessage = translatedMessage;
            } else {
              errorMessage = error.message;
            }
          }

          toast.error(errorMessage);
        },
      }
    );
  };

  const handleSSOLogin = () => {
    if (!institutionalId) {
      toast.error('Institutional ID is required for SSO login');
      return;
    }

    if (globalThis.window === undefined) {
      return; // Server-side rendering, skip
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const apiVersion = process.env.NEXT_PUBLIC_API_VERSION;
    const ssoInitiateUrl = `${baseUrl}/${apiVersion}${URL_SSO_INITIATE(institutionalId)}`;

    // Redirect to SSO initiate endpoint
    // Use globalThis to avoid TypeScript/ESLint issues
    const win = globalThis as typeof globalThis & { location: Location };
    win.location.href = ssoInitiateUrl;
  };

  return (
    <div className="min-h-screen md:p-10">
      <div className="relative w-full">
        <div className="h-96 w-full bg-(--color-background-navy) md:rounded"></div>
        <div className="absolute top-1/2 left-1/2 z-10 w-[calc(100%-20px)] max-w-lg -translate-x-1/2 rounded bg-(--color-background-color) p-[60px] px-[40px] shadow-[0px_1px_4px_0px_#0C0C0D0D] md:w-[500px]">
          <HeaderLogin t={t} />
          <FormLogin
            t={t}
            handleSubmit={handleSubmit}
            username={username}
            handleUsernameChange={handleUsernameChange}
            handleUsernameBlur={handleUsernameBlur}
            password={password}
            handlePasswordChange={handlePasswordChange}
            handlePasswordBlur={handlePasswordBlur}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            loginMutation={loginMutation}
            errors={errors}
            rememberMe={rememberMe}
            setRememberMe={handleRememberMeChange}
            onSSOLogin={showSSOButton ? handleSSOLogin : undefined}
          />
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <p className="text-lg">Loading...</p>
          </div>
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
