import { USER_ROLE, USER_STATUS } from '@/enums/auth';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string | null;
  phone_number: string | null;
  role: USER_ROLE;
  status: USER_STATUS;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login: string | null;
  is_superuser: boolean;
  is_upload_first: boolean;
  first_change_password: boolean;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  user: User;
}

export interface SSORedirectResponse {
  sso_redirect: true;
  redirect_url: string;
  method: 'GET' | 'POST';
  data?: Record<string, any>;
}

export interface MeResponse {
  id: string;
  username: string;
  email: string;
  full_name: string | null;
  phone_number: string | null;
  is_active: boolean;
  created_at: string;
  role: USER_ROLE;
  is_upload_first: boolean;
  first_change_password: boolean;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  user: User;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordRequest {
  new_password: string;
  token: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface ChangePasswordRequest {
  new_password: string;
  old_password: string;
}

export interface ChangePasswordResponse {
  message: string;
}

export interface CheckSessionResponse {
  is_valid: boolean;
  is_active: boolean;
  message: string;
}
