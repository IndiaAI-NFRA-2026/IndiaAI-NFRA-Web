import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UseMutationResult } from '@tanstack/react-query';
import type { ForgotPasswordRequest, ForgotPasswordResponse } from '@/types/auth';

export function FormForgotPassword({
  t,
  handleSubmit,
  email,
  handleEmailChange,
  handleEmailBlur,
  forgotPasswordMutation,
  errors,
}: Readonly<{
  t: (key: string) => string;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  email: string;
  handleEmailChange: (value: string) => void;
  handleEmailBlur: () => void;
  forgotPasswordMutation: UseMutationResult<ForgotPasswordResponse, Error, ForgotPasswordRequest>;
  errors: Record<string, string>;
}>) {
  return (
    <form className="space-y-5.5" onSubmit={handleSubmit}>
      <div className="space-y-5.5">
        <p className="text-center text-sm text-(--color-muted-foreground)">{t('forgotPassword.description')}</p>
        <div className="relative">
          <Input
            type="text"
            placeholder={t('forgotPassword.email')}
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            onBlur={handleEmailBlur}
            disabled={forgotPasswordMutation.isPending}
            icon={<img src="/assets/icons/user-active-icon.svg" alt="User" className="h-4 w-4" />}
            className={`h-12 pl-10 text-base ${errors.email ? 'border-red-500' : ''}`}
          />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
        </div>
      </div>

      <Button
        type="submit"
        disabled={forgotPasswordMutation.isPending}
        className="h-10 w-full cursor-pointer rounded text-base leading-5.5 font-normal disabled:cursor-not-allowed disabled:opacity-50"
        style={{
          backgroundColor: 'var(--button-background)',
          color: 'var(--button-foreground)',
        }}
      >
        {forgotPasswordMutation.isPending ? t('forgotPassword.sending') : t('forgotPassword.sendLink')}
      </Button>
    </form>
  );
}
