import { USER_ROLE } from '@/enums/auth';

export interface UserUpsert {
  id?: string;
  username: string;
  password?: string;
  email: string;
  phone_number: string | null;
  role: USER_ROLE;
  is_active: boolean;
}
