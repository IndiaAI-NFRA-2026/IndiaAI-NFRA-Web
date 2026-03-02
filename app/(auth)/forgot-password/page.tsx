'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useForgotPassword } from '@/lib/query/use-auth';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { HeaderForgotPassword } from '@/components/(auth)/forgot-password/header-forgot-password';
import { FormForgotPassword } from '@/components/(auth)/forgot-password/form-forgot-password';
import { snakeToCamelCase, validateEmail as validateEmailFormat } from '@/lib/utils/helpers';

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const forgotPasswordMutation = useForgotPassword();

  const validateEmail = (emailValue: string): string | null => {
    if (!emailValue.trim()) {
      return t('forgotPassword.errorEmailRequired');
    }

    if (/\s/.test(emailValue)) {
      return t('forgotPassword.errorEmailFormat');
    }

    if (!validateEmailFormat(emailValue)) {
      return t('forgotPassword.errorEmailFormatInvalid');
    }

    return null;
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (touched.email) {
      const error = validateEmail(value);
      setErrors((prev) => ({
        ...prev,
        email: error || '',
      }));
    }
  };

  const handleEmailBlur = () => {
    setTouched((prev) => ({ ...prev, email: true }));
    const error = validateEmail(email);
    setErrors((prev) => ({
      ...prev,
      email: error || '',
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setTouched({ email: true });

    const emailError = validateEmail(email);

    const newErrors: Record<string, string> = {};
    if (emailError) newErrors.email = emailError;

    setErrors(newErrors);

    if (emailError) {
      return;
    }

    // Trim email before sending to server
    const trimmedEmail = email.trim();

    forgotPasswordMutation.mutate(
      { email: trimmedEmail },
      {
        onSuccess: () => {
          toast.success(t('forgotPassword.success'));
        },
        onError: (error) => {
          let errorMessage = t('forgotPassword.error');

          if (error instanceof Error) {
            const apiError = error as {
              data?: { error_code?: string; detail?: string };
            };
            if (apiError.data?.error_code) {
              const translationKey = `forgotPassword.${snakeToCamelCase(apiError.data.error_code)}`;
              const translatedMessage = t(translationKey);
              if (translatedMessage === translationKey) {
                errorMessage = apiError.data.detail || error.message;
              } else {
                errorMessage = translatedMessage;
              }
            } else {
              errorMessage = error.message;
            }
          }

          toast.error(errorMessage);
        },
      }
    );
  };

  return (
    <div className="min-h-screen md:p-10">
      <div className="relative w-full">
        <div className="h-96 w-full bg-(--color-background-navy) md:rounded"></div>
        <div className="absolute top-1/2 left-1/2 z-10 w-[calc(100%-20px)] -translate-x-1/2 rounded bg-(--color-background-color) p-[60px] px-[40px] shadow-[0px_1px_4px_0px_#0C0C0D0D] md:w-[500px]">
          <HeaderForgotPassword t={t} />
          <FormForgotPassword
            t={t}
            handleSubmit={handleSubmit}
            email={email}
            handleEmailChange={handleEmailChange}
            handleEmailBlur={handleEmailBlur}
            forgotPasswordMutation={forgotPasswordMutation}
            errors={errors}
          />
          <div className="mt-4 text-center">
            <Link href="/login" className="text-sm text-(--color-text-link) hover:underline">
              {t('forgotPassword.backToLogin')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
