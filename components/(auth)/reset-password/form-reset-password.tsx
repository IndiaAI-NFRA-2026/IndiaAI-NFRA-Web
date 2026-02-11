import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { UseMutationResult } from '@tanstack/react-query';
import type { ResetPasswordRequest, ResetPasswordResponse, ChangePasswordRequest, ChangePasswordResponse } from '@/types/auth';

export function FormResetPassword({
  t,
  handleSubmit,
  isFirstChange,
  oldPassword,
  handleOldPasswordChange,
  handleOldPasswordBlur,
  showOldPassword,
  setShowOldPassword,
  newPassword,
  handleNewPasswordChange,
  handleNewPasswordBlur,
  confirmPassword,
  handleConfirmPasswordChange,
  handleConfirmPasswordBlur,
  showNewPassword,
  setShowNewPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  resetPasswordMutation,
  changePasswordMutation,
  errors,
}: Readonly<{
  t: (key: string) => string;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isFirstChange: boolean;
  oldPassword?: string;
  handleOldPasswordChange?: (value: string) => void;
  handleOldPasswordBlur?: () => void;
  showOldPassword?: boolean;
  setShowOldPassword?: (value: boolean) => void;
  newPassword: string;
  handleNewPasswordChange: (value: string) => void;
  handleNewPasswordBlur: () => void;
  confirmPassword: string;
  handleConfirmPasswordChange: (value: string) => void;
  handleConfirmPasswordBlur: () => void;
  showNewPassword: boolean;
  setShowNewPassword: (value: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (value: boolean) => void;
  resetPasswordMutation: UseMutationResult<ResetPasswordResponse, Error, ResetPasswordRequest>;
  changePasswordMutation?: UseMutationResult<ChangePasswordResponse, Error, { data: ChangePasswordRequest; accessToken: string }>;
  errors: Record<string, string>;
}>) {
  const isPending = resetPasswordMutation.isPending || (changePasswordMutation?.isPending ?? false);
  return (
    <form className="space-y-5.5" onSubmit={handleSubmit}>
      <p className="mx-auto max-w-[300px] text-center text-sm text-(--color-muted-foreground)">{t('resetPassword.description')}</p>

      {isFirstChange && oldPassword !== undefined && (
        <div className="space-y-1.5">
          <div className="relative">
            <Input
              type={showOldPassword ? 'text' : 'password'}
              placeholder={t('resetPassword.oldPassword')}
              value={oldPassword}
              onChange={(e) => handleOldPasswordChange?.(e.target.value)}
              onBlur={handleOldPasswordBlur}
              disabled={isPending}
              icon={<img src="/assets/icons/lock-icon.svg" alt="Lock" className="h-4 w-4" />}
              className={`h-12 pr-12 pl-10 text-base ${errors.oldPassword ? 'border-red-500' : ''}`}
            />
            <button
              type="button"
              onClick={() => setShowOldPassword?.(!showOldPassword)}
              disabled={isPending}
              className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-(--color-muted-foreground) transition-colors hover:text-(--color-foreground) disabled:opacity-50"
            >
              {showOldPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.oldPassword && <p className="text-xs text-red-500">{errors.oldPassword}</p>}
        </div>
      )}

      <div className="space-y-1.5">
        <div className="relative">
          <Input
            type={showNewPassword ? 'text' : 'password'}
            placeholder={t('resetPassword.newPassword')}
            value={newPassword}
            onChange={(e) => handleNewPasswordChange(e.target.value)}
            onBlur={handleNewPasswordBlur}
            disabled={isPending}
            icon={<img src="/assets/icons/lock-icon.svg" alt="Lock" className="h-4 w-4" />}
            className={`h-12 pr-12 pl-10 text-base ${errors.newPassword ? 'border-red-500' : ''}`}
          />
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
            disabled={isPending}
            className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-(--color-muted-foreground) transition-colors hover:text-(--color-foreground) disabled:opacity-50"
          >
            {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        {errors.newPassword && <p className="text-xs text-red-500">{errors.newPassword}</p>}
      </div>

      <div className="space-y-1.5">
        <div className="relative">
          <Input
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder={t('resetPassword.confirmPassword')}
            value={confirmPassword}
            onChange={(e) => handleConfirmPasswordChange(e.target.value)}
            onBlur={handleConfirmPasswordBlur}
            disabled={isPending}
            icon={<img src="/assets/icons/lock-icon.svg" alt="Lock" className="h-4 w-4" />}
            className={`h-12 pr-12 pl-10 text-base ${errors.confirmPassword ? 'border-red-500' : ''}`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            disabled={isPending}
            className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-(--color-muted-foreground) transition-colors hover:text-(--color-foreground) disabled:opacity-50"
          >
            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="h-10 w-full cursor-pointer rounded text-base leading-5.5 font-normal disabled:cursor-not-allowed disabled:opacity-50"
        style={{
          backgroundColor: 'var(--button-background)',
          color: 'var(--button-foreground)',
        }}
      >
        {isPending ? t('resetPassword.resetting') : t('resetPassword.resetButton')}
      </Button>
    </form>
  );
}
