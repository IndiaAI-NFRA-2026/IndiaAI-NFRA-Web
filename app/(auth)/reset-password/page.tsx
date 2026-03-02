'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useResetPassword, useChangePassword } from '@/lib/query/use-auth';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { HeaderResetPassword } from '@/components/(auth)/reset-password/header-reset-password';
import { FormResetPassword } from '@/components/(auth)/reset-password/form-reset-password';
import { SuccessResetPassword } from '@/components/(auth)/reset-password/success-reset-password';
import { snakeToCamelCase } from '@/lib/utils/helpers';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [token, setToken] = useState<string | null>(null);
  const [isFirstChange, setIsFirstChange] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const resetPasswordMutation = useResetPassword();
  const changePasswordMutation = useChangePassword();

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    const typeParam = searchParams.get('type');

    if (!tokenParam) {
      toast.error(t('resetPassword.errorTokenMissing'));
      router.push('/forgot-password');
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToken(tokenParam);

    setIsFirstChange(typeParam === 'first-change');
  }, [searchParams, router, t]);

  const validatePassword = (password: string, oldPassword?: string): string | null => {
    if (!password.trim()) {
      return t('resetPassword.errorPasswordRequired');
    }

    // Check if password contains spaces
    if (/\s/.test(password)) {
      return t('resetPassword.errorPasswordNoSpaces');
    }

    if (password.length < 8) {
      return t('resetPassword.errorPasswordMinLength');
    }

    // Check if new password is the same as old password (only when changing password)
    if (oldPassword?.trim() && password === oldPassword) {
      return t('resetPassword.errorPasswordSameAsOld');
    }

    return null;
  };

  const validateOldPassword = (password: string): string | null => {
    if (!password.trim()) {
      return t('resetPassword.errorOldPasswordRequired');
    }

    // Check if password contains spaces
    if (/\s/.test(password)) {
      return t('resetPassword.errorPasswordNoSpaces');
    }

    return null;
  };

  const validateConfirmPassword = (password: string, confirm: string): string | null => {
    if (!confirm.trim()) {
      return t('resetPassword.errorPasswordRequired');
    }

    // Check if confirm password contains spaces
    if (/\s/.test(confirm)) {
      return t('resetPassword.errorPasswordNoSpaces');
    }

    // Check length first (priority)
    if (confirm.length < 8) {
      return t('resetPassword.errorPasswordMinLength');
    }

    // Then check if passwords match
    if (password !== confirm) {
      return t('resetPassword.errorPasswordMismatch');
    }

    return null;
  };

  const handleOldPasswordChange = (value: string) => {
    setOldPassword(value);
    if (touched.oldPassword) {
      const error = validateOldPassword(value);
      setErrors((prev) => ({
        ...prev,
        oldPassword: error || '',
      }));
    }
    // Re-validate new password if it's been touched (to check if it matches old password)
    if (touched.newPassword && newPassword) {
      const passwordError = validatePassword(newPassword, value);
      setErrors((prev) => ({
        ...prev,
        newPassword: passwordError || '',
      }));
    }
  };

  const handleNewPasswordChange = (value: string) => {
    setNewPassword(value);
    if (touched.newPassword) {
      const error = validatePassword(value, isFirstChange ? oldPassword : undefined);
      setErrors((prev) => ({
        ...prev,
        newPassword: error || '',
      }));
    }
    // Also re-validate confirm password if it's been touched
    if (touched.confirmPassword) {
      const confirmError = validateConfirmPassword(value, confirmPassword);
      setErrors((prev) => ({
        ...prev,
        confirmPassword: confirmError || '',
      }));
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (touched.confirmPassword) {
      const error = validateConfirmPassword(newPassword, value);
      setErrors((prev) => ({
        ...prev,
        confirmPassword: error || '',
      }));
    }
  };

  const handleOldPasswordBlur = () => {
    setTouched((prev) => ({ ...prev, oldPassword: true }));
    const error = validateOldPassword(oldPassword);
    setErrors((prev) => ({
      ...prev,
      oldPassword: error || '',
    }));
  };

  const handleNewPasswordBlur = () => {
    setTouched((prev) => ({ ...prev, newPassword: true }));
    const error = validatePassword(newPassword, isFirstChange ? oldPassword : undefined);
    setErrors((prev) => ({
      ...prev,
      newPassword: error || '',
    }));
  };

  const handleConfirmPasswordBlur = () => {
    setTouched((prev) => ({ ...prev, confirmPassword: true }));
    const error = validateConfirmPassword(newPassword, confirmPassword);
    setErrors((prev) => ({
      ...prev,
      confirmPassword: error || '',
    }));
  };

  const getErrorMessage = (error: unknown): string => {
    let errorMessage = t('resetPassword.error');
    if (error instanceof Error) {
      const apiError = error as {
        data?: { error_code?: string; detail?: string };
      };
      if (apiError.data?.error_code) {
        const translationKey = `resetPassword.${snakeToCamelCase(apiError.data.error_code)}`;
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
    return errorMessage;
  };

  // Extract first change password submission logic
  const handleFirstChangeSubmit = () => {
    setTouched({
      oldPassword: true,
      newPassword: true,
      confirmPassword: true,
    });

    const oldPasswordError = validateOldPassword(oldPassword);
    const passwordError = validatePassword(newPassword, oldPassword);
    const confirmError = validateConfirmPassword(newPassword, confirmPassword);

    const newErrors: Record<string, string> = {};
    if (oldPasswordError) newErrors.oldPassword = oldPasswordError;
    if (passwordError) newErrors.newPassword = passwordError;
    if (confirmError) newErrors.confirmPassword = confirmError;

    setErrors(newErrors);

    if (oldPasswordError || passwordError || confirmError) {
      return;
    }

    const trimmedOldPassword = oldPassword.trim();
    const trimmedNewPassword = newPassword.trim();

    changePasswordMutation.mutate(
      {
        data: {
          old_password: trimmedOldPassword,
          new_password: trimmedNewPassword,
        },
        accessToken: token!,
      },
      {
        onSuccess: () => {
          setIsSuccess(true);
          toast.success(t('resetPassword.success'));
        },
        onError: (error) => {
          toast.error(getErrorMessage(error));
        },
      }
    );
  };

  // Extract reset password submission logic
  const handleResetPasswordSubmit = () => {
    setTouched({ newPassword: true, confirmPassword: true });

    const passwordError = validatePassword(newPassword);
    const confirmError = validateConfirmPassword(newPassword, confirmPassword);

    const newErrors: Record<string, string> = {};
    if (passwordError) newErrors.newPassword = passwordError;
    if (confirmError) newErrors.confirmPassword = confirmError;

    setErrors(newErrors);

    if (passwordError || confirmError) {
      return;
    }

    const trimmedNewPassword = newPassword.trim();

    resetPasswordMutation.mutate(
      { new_password: trimmedNewPassword, token: token! },
      {
        onSuccess: () => {
          setIsSuccess(true);
        },
        onError: (error) => {
          toast.error(getErrorMessage(error));
        },
      }
    );
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!token) {
      toast.error(t('resetPassword.errorTokenMissing'));
      return;
    }

    if (isFirstChange) {
      handleFirstChangeSubmit();
    } else {
      handleResetPasswordSubmit();
    }
  };

  if (!token) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen md:p-10">
      <div className="relative w-full">
        <div className="h-96 w-full bg-(--color-background-navy) md:rounded"></div>
        <div className="absolute top-1/2 left-1/2 z-10 w-[calc(100%-20px)] -translate-x-1/2 rounded bg-(--color-background-color) p-[60px] px-[40px] shadow-[0px_1px_4px_0px_#0C0C0D0D] md:w-[500px]">
          <HeaderResetPassword t={t} />
          <FormResetPassword
            t={t}
            handleSubmit={handleSubmit}
            isFirstChange={isFirstChange}
            oldPassword={oldPassword}
            handleOldPasswordChange={handleOldPasswordChange}
            handleOldPasswordBlur={handleOldPasswordBlur}
            showOldPassword={showOldPassword}
            setShowOldPassword={setShowOldPassword}
            newPassword={newPassword}
            handleNewPasswordChange={handleNewPasswordChange}
            handleNewPasswordBlur={handleNewPasswordBlur}
            confirmPassword={confirmPassword}
            handleConfirmPasswordChange={handleConfirmPasswordChange}
            handleConfirmPasswordBlur={handleConfirmPasswordBlur}
            showNewPassword={showNewPassword}
            setShowNewPassword={setShowNewPassword}
            showConfirmPassword={showConfirmPassword}
            setShowConfirmPassword={setShowConfirmPassword}
            resetPasswordMutation={resetPasswordMutation}
            changePasswordMutation={changePasswordMutation}
            errors={errors}
          />
        </div>
      </div>
      <SuccessResetPassword t={t} isOpen={isSuccess} setIsOpen={setIsSuccess} />
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen md:p-10" />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
