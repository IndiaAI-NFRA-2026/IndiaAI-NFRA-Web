import { Modal } from '@/components/modal';
import { Input } from '@/components/typing/input';
import Select from '@/components/typing/select';
import { USER_ROLE, USER_STATUS } from '@/enums/auth';
import { useOptionsMultiLanguages } from '@/components/hook/use-options';
import { UserUpsert } from '@/types/user';
import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface FormErrors {
  username?: string;
  email?: string;
  phone_number?: string;
}

interface UpsertUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (formData: UserUpsert) => void;
  user: UserUpsert | null;
  loading: boolean;
}

const defaultFormData: UserUpsert = {
  id: '',
  username: '',
  email: '',
  phone_number: null,
  role: USER_ROLE.CREDIT_OFFICER_ANALYST,
  is_active: true,
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_DIGITS_MIN = 8;
const PHONE_DIGITS_MAX = 15;

function validate(form: UserUpsert, t: (key: string) => string): FormErrors {
  const err: FormErrors = {};
  if (!form.username?.trim()) err.username = t('title.validation.userNameRequired');
  if (!form.email?.trim()) err.email = t('title.validation.emailRequired');
  else if (!EMAIL_REGEX.test(form.email)) err.email = t('title.validation.emailInvalid');
  if (!form.phone_number?.trim()) err.phone_number = t('title.validation.phoneRequired');
  else {
    const digits = form.phone_number.replace(/\D/g, '');
    if (digits.length < PHONE_DIGITS_MIN || digits.length > PHONE_DIGITS_MAX) {
      err.phone_number = t('title.validation.phoneInvalid');
    }
  }
  return err;
}

const UpsertUserModal = ({ isOpen, onClose, onConfirm, user, loading }: UpsertUserModalProps) => {
  const { t } = useTranslation();
  const { userRoleOptions, userStatusOptions } = useOptionsMultiLanguages();
  const [formData, setFormData] = useState<UserUpsert>(() => user ?? defaultFormData);
  const [errors, setErrors] = useState<FormErrors>({});

  const handleConfirm = useCallback(() => {
    const next = validate(formData, t);
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    onConfirm(formData);
  }, [formData, onConfirm, t]);

  const handleBlur = useCallback(
    (field: keyof FormErrors) => {
      const next = validate(formData, t);
      setErrors((prev) => ({ ...prev, [field]: next[field] }));
    },
    [formData, t]
  );

  const update = useCallback((patch: Partial<UserUpsert>, field?: keyof FormErrors) => {
    setFormData((prev) => ({ ...prev, ...patch }));
    if (field) setErrors((e) => ({ ...e, [field]: undefined }));
  }, []);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      isLoading={loading}
      title={user?.id ? t('title.editUser') : t('title.addUser')}
      confirmButtonText={loading ? t('form.saving') : user?.id ? t('button.update') : t('button.create')}
      renderDescription={() => (
        <div className="flex flex-col gap-4 px-6">
          <div className="flex justify-between gap-4 max-md:flex-col">
            <div className="flex flex-1 flex-col gap-2">
              <label className="text-sm font-normal">
                {t('title.label.userName')} <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder={t('title.label.userName')}
                value={formData.username}
                onChange={(e) => update({ username: e.target.value }, 'username')}
                onBlur={() => handleBlur('username')}
                error={errors.username}
              />
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <label className="text-sm font-normal">
                {t('title.email')} <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                placeholder={t('title.email')}
                value={formData.email}
                onChange={(e) => update({ email: e.target.value }, 'email')}
                onBlur={() => handleBlur('email')}
                error={errors.email}
              />
            </div>
          </div>

          <div className="flex justify-between gap-4 max-md:flex-col">
            <div className="flex flex-1 flex-col gap-2">
              <label className="text-sm font-normal">
                {t('title.phoneNumber')} <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder={t('title.phoneNumber')}
                value={formData.phone_number ?? ''}
                onChange={(e) => update({ phone_number: e.target.value || null }, 'phone_number')}
                onBlur={() => handleBlur('phone_number')}
                error={errors.phone_number}
              />
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <label className="text-sm font-normal">
                {t('title.role')} <span className="text-red-500">*</span>
              </label>
              <Select
                options={userRoleOptions}
                value={formData.role}
                onValueChange={(value: string) => update({ role: value as USER_ROLE })}
                isClearable={false}
                placeholder={t('title.selectRole')}
                menuPortalTarget={null}
              />
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <label className="text-sm font-normal">
              {t('title.status')} <span className="text-red-500">*</span>
            </label>
            <Select
              options={userStatusOptions}
              value={formData.is_active ? USER_STATUS.ACTIVE : USER_STATUS.INACTIVE}
              onValueChange={(value: string) => update({ is_active: value === USER_STATUS.ACTIVE })}
              isClearable={false}
              placeholder={t('title.selectStatus')}
              menuPortalTarget={null}
            />
          </div>
        </div>
      )}
    />
  );
};

export default UpsertUserModal;
