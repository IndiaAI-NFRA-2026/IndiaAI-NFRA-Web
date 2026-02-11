import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff } from 'lucide-react';
import { UseMutationResult } from '@tanstack/react-query';
import type { LoginResponse, SSORedirectResponse, LoginRequest } from '@/types/auth';
import { Button } from '@/components/ui/button';

export function FormLogin({
  t,
  handleSubmit,
  username,
  handleUsernameChange,
  handleUsernameBlur,
  password,
  handlePasswordChange,
  handlePasswordBlur,
  showPassword,
  setShowPassword,
  loginMutation,
  errors,
  rememberMe,
  setRememberMe,
  onSSOLogin,
}: Readonly<{
  t: (key: string) => string;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  username: string;
  handleUsernameChange: (value: string) => void;
  handleUsernameBlur: () => void;
  password: string;
  handlePasswordChange: (value: string) => void;
  handlePasswordBlur: () => void;
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
  loginMutation: UseMutationResult<LoginResponse | SSORedirectResponse, Error, LoginRequest>;
  errors: Record<string, string>;
  rememberMe: boolean;
  setRememberMe: (checked: boolean) => void;
  onSSOLogin?: () => void;
}>) {
  return (
    <form className="space-y-5.5" onSubmit={handleSubmit} autoComplete="on">
      {!onSSOLogin && (
        <>
          <div className="space-y-1.5">
            <div className="relative">
              <Input
                type="text"
                name="email"
                autoComplete="username"
                placeholder={t('login.email')}
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                onBlur={handleUsernameBlur}
                disabled={loginMutation.isPending}
                icon={<img src="/assets/icons/user-active-icon.svg" alt="User" className="h-4 w-4" />}
                className={`h-12 pl-10 text-base ${errors.username ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.username && <p className="text-xs text-red-500">{errors.username}</p>}
          </div>

          <div className="space-y-1.5">
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="current-password"
                placeholder={t('login.password')}
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                onBlur={handlePasswordBlur}
                disabled={loginMutation.isPending}
                icon={<img src="/assets/icons/lock-icon.svg" alt="Lock" className="h-4 w-4" />}
                className={`h-12 pr-12 pl-10 text-base ${errors.password ? 'border-red-500' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loginMutation.isPending}
                className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-(--color-muted-foreground) transition-colors hover:text-(--color-foreground) disabled:opacity-50"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
            <div className="mt-5.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loginMutation.isPending}
                  className="h-4 w-4 cursor-pointer rounded border-gray-300 text-(--color-button-background) focus:ring-(--color-button-background) disabled:cursor-not-allowed disabled:opacity-50"
                />
                <label htmlFor="remember" className="text-sm font-normal text-black">
                  {t('login.rememberMe')}
                </label>
              </div>
              <Link href="/forgot-password" className="text-sm text-(--color-text-link) hover:underline">
                {t('login.forgotPassword')}
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loginMutation.isPending}
            className="h-10 w-full cursor-pointer rounded text-base leading-5.5 font-normal disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              backgroundColor: 'var(--button-background)',
              color: 'var(--button-foreground)',
            }}
          >
            {loginMutation.isPending ? t('login.loggingIn') : t('login.loginButton')}
          </Button>
        </>
      )}

      {onSSOLogin && (
        <Button
          type="button"
          onClick={onSSOLogin}
          disabled={loginMutation.isPending}
          variant="link"
          className="text-sm text-(--color-text-link) underline-offset-4 hover:underline"
        >
          {t('login.loginWithSSO')}
        </Button>
      )}
    </form>
  );
}
