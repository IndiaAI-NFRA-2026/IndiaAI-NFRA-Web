'use client';

import { useTranslation } from 'react-i18next';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { useLogout, useMe } from '@/lib/query/use-auth';
import { Logo, Sidebar } from '../sidebar';
import { LogOutIcon, Settings, UserIcon } from 'lucide-react';
import { useState } from 'react';
import { Modal } from '../modal';
import { getTagSeverity, getUserRoleLabel } from '@/lib/utils/helpers';
import { USER_ROLE } from '@/enums/auth';
import Tag from '../tag';

export function Header() {
  const { t } = useTranslation();
  const router = useRouter();
  const logoutMutation = useLogout();
  const { data: user } = useMe();
  const [isShowProfile, setIsShowProfile] = useState(false);

  const logout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        router.push('/login');
      },
      onError: (error) => {
        console.error('Logout failed:', error);
      },
    });
  };

  return (
    <header className="flex h-[48px] items-center justify-between bg-(--color-background-color) py-0">
      <div className="px-2">
        <div className="hidden pt-2 max-lg:block!">
          <Logo onClick={() => router.push('/')} />
        </div>
      </div>
      <div className="flex items-center gap-2 lg:px-4">
        <div className="py-4">
          <span>{user?.full_name || user?.username || ''}</span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" aria-label="Settings" className="cursor-pointer border-0 bg-transparent p-0">
              <Settings className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-38! rounded-[4px] py-2 shadow-[0_2px_8px_0_rgba(0,0,0,0.15)]">
            <DropdownMenuItem className="cursor-pointer focus:bg-gray-100" onClick={() => setIsShowProfile(true)}>
              <div className="flex items-center gap-2">
                <UserIcon className="size-4" />
                {t('header.profile')}
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer focus:bg-gray-100" onClick={logout}>
              <div className="flex items-center gap-2">
                <LogOutIcon className="size-4" />
                {t('header.logout')}
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="hidden max-lg:block!">
          <Sidebar />
        </div>
      </div>
      <Modal
        type="alert"
        isOpen={isShowProfile}
        onClose={() => setIsShowProfile(false)}
        onConfirm={() => {}}
        contentClassName="max-w-[600px]"
        title={t('header.profile')}
        cancelButtonText={t('common.close')}
        renderDescription={() => (
          <div className="px-4">
            <div className="flex flex-col gap-2 rounded-[4px] border border-(--color-filters-border) p-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-(--color-table-header-text-color)">{t('title.label.userName')}:</label>
                <span className="text-[14px] text-(--color-table-header-text-color)">{user?.username || ''}</span>
              </div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-(--color-table-header-text-color)">{t('title.email')}:</label>
                <span className="text-[14px] text-(--color-table-header-text-color)">{user?.email || ''}</span>
              </div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-(--color-table-header-text-color)">{t('title.label.phoneNumber')}:</label>
                <span className="text-[14px] text-(--color-table-header-text-color)">{user?.phone_number || ''}</span>
              </div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-(--color-table-header-text-color)">{t('title.role')}:</label>
                <Tag label={getUserRoleLabel(user?.role as USER_ROLE)} severity={getTagSeverity(user?.role as USER_ROLE)} />
              </div>
            </div>
          </div>
        )}
      />
    </header>
  );
}
