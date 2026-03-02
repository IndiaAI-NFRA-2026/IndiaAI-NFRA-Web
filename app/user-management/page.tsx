'use client';

import { useState, useMemo } from 'react';
import { Filter, SELECT_TYPE } from '@/components/filter';
import { Heading } from '@/components/heading';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { useOptionsMultiLanguages } from '@/components/hook/use-options';
import type { User } from '@/types/auth';
import { useCreateUser, useDeleteUser, useUpdateUser, useUsers } from '@/lib/query/use-users';
import { AppLayout } from '@/components/layout/app-layout';
import { PenLineIcon, PlusCircleIcon, TrashIcon } from 'lucide-react';
import { formatDate, getUserRoleLabel } from '@/lib/utils/helpers';
import Tag from '@/components/tag';
import { Button } from '@/components/button';
import Table from '@/components/table';
import UpsertUserModal from '@/components/forms/user-management/upsert.modal';
import { UserUpsert } from '@/types/user';
import { Modal } from '@/components/modal';
import { useMe } from '@/lib/query/use-auth';
import { canCreate, canUpdate, canDelete } from '@/lib/auth/rbac';
import { USER_ROLE } from '@/enums/auth';

function UserManagementPageContent() {
  const { t } = useLanguage();
  const { data: me } = useMe();
  const role = me?.role as USER_ROLE | undefined;
  const [filter, setFilter] = useState<{
    search: string;
    role: string;
    createdAt: string;
    status: string;
  }>({
    search: '',
    role: '',
    createdAt: '',
    status: '',
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserUpsert | null>(null);
  const [upsertLoading, setUpsertLoading] = useState(false);

  const { userRoleOptions, userStatusOptions } = useOptionsMultiLanguages();

  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  // Fetch users from API
  const { data: usersData } = useUsers({
    page,
    pageSize,
    search: filter.search || undefined,
    role: filter.role,
    status: filter.status,
    createdDate: filter.createdAt || undefined,
  });

  // Handle edit user
  const handleEdit = useMemo(
    () => (user: User) => {
      setSelectedUser(user);
      setIsUserModalOpen(true);
    },
    []
  );

  // Handle delete user
  const handleDelete = useMemo(
    () => (user: User) => {
      setSelectedUser(user);
      setIsDeleteUserDialogOpen(true);
    },
    []
  );

  const onConfirm = (newUser: UserUpsert) => {
    setUpsertLoading(true);
    const dataToUpsert: UserUpsert = {
      ...newUser,
      password: `Temp${Math.random().toString(36).slice(-8)}!`,
    };
    if (selectedUser) {
      updateUserMutation.mutate(dataToUpsert);
    } else {
      createUserMutation.mutate(dataToUpsert);
    }
    setIsUserModalOpen(false);
    setUpsertLoading(false);
  };

  const onDelete = () => {
    deleteUserMutation.mutate(selectedUser?.id ?? '');
    setIsDeleteUserDialogOpen(false);
  };

  const columns = useMemo(() => {
    return [
      {
        id: 'index',
        header: '#',
        accessorKey: 'index',
        cell: (row: any) => row.index,
      },
      {
        id: 'userName',
        header: t('title.userName'),
        accessorKey: 'full_name',
        cell: (row: any) => <div className="line-clamp-2 max-md:text-sm md:min-w-[150px]">{row.full_name}</div>,
      },
      {
        id: 'phoneNumber',
        header: t('title.phoneNumber'),
        accessorKey: 'phone_number',
        cell: (row: any) => <div className="text-nowrap">{row.phone_number}</div>,
      },
      {
        id: 'email',
        header: t('title.email'),
        accessorKey: 'email',
        cell: (row: any) => <div className="text-nowrap">{row.email}</div>,
      },
      {
        id: 'role',
        header: t('title.role'),
        accessorKey: 'role',
        cell: (row: any) => <div className="text-nowrap">{getUserRoleLabel(row.role)}</div>,
      },
      {
        id: 'createdAt',
        header: t('title.createdAt'),
        accessorKey: 'created_at',
        cell: (row: any) => <div className="text-nowrap">{formatDate(row.created_at)}</div>,
      },
      {
        id: 'status',
        header: t('title.status'),
        accessorKey: 'status',
        cell: (row: any) => (
          <Tag label={row.is_active ? t('userStatus.active') : t('userStatus.inactive')} severity={row.is_active ? 'success' : 'danger'} />
        ),
      },
      ...(canUpdate(role, 'user_management') || canDelete(role, 'user_management')
        ? [
            {
              id: 'action',
              header: t('uploadedHistory.table.action'),
              accessorKey: 'action',
              cell: (row: any) => (
                <div className="flex items-center gap-1">
                  {canUpdate(role, 'user_management') && (
                    <Button onClick={() => handleEdit(row)} size="sm" type="text" icon={<PenLineIcon className="size-4" />} />
                  )}
                  {canDelete(role, 'user_management') && (
                    <Button onClick={() => handleDelete(row)} size="sm" type="text" icon={<TrashIcon className="size-4" />} />
                  )}
                </div>
              ),
            },
          ]
        : []),
    ];
  }, [t, handleEdit, handleDelete, role]);

  const handleAddUser = () => {
    setSelectedUser(null);
    setIsUserModalOpen(true);
  };

  const tableData = useMemo(() => {
    return [...(usersData?.users ?? [])].map((user, i) => ({
      ...user,
      index: (page - 1) * pageSize + i + 1,
    }));
  }, [usersData, page, pageSize]);

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-hidden rounded bg-(--color-background-color) shadow-[0_2px_8px_0_rgba(0,0,0,0.15)]">
      <Heading
        title={t('heading.userManagement')}
        subTitle={t('heading.userManagementSubTitle')}
        actions={
          canCreate(role, 'user_management')
            ? [{ title: t('title.addUser'), onClick: handleAddUser, icon: <PlusCircleIcon className="size-4" /> }]
            : undefined
        }
      />

      <div className="px-2 md:px-6">
        <Filter
          search={{
            name: 'search',
            placeholder: t('dataTable.search'),
            value: filter.search,
          }}
          selects={[
            {
              type: SELECT_TYPE.SELECT,
              name: 'role',
              placeholder: t('title.role'),
              options: userRoleOptions,
              value: filter.role,
              defaultValue: filter.role,
            },
            {
              type: SELECT_TYPE.DATE,
              name: 'createdAt',
              placeholder: t('auditLogs.filters.datePlaceholder'),
              value: filter.createdAt,
              isClearable: true,
            },
            {
              type: SELECT_TYPE.SELECT,
              name: 'status',
              placeholder: t('title.status'),
              options: userStatusOptions,
              value: filter.status,
              defaultValue: filter.status,
            },
          ]}
          onFilterChange={(data) => {
            setFilter({ ...filter, [data.name]: data.value });
          }}
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-2 md:px-6">
        <Table
          columns={columns}
          stickyHeader={true}
          data={tableData}
          noDataMessage={t('dataTable.noResults')}
          pagination={{ page, pageSize, totalItems: usersData?.total ?? 0, onPageChange: setPage, setPageSize: setPageSize }}
        />
      </div>

      {/* Modals */}
      <UpsertUserModal
        key={isUserModalOpen ? (selectedUser?.id ?? 'new') : 'closed'}
        isOpen={isUserModalOpen}
        onClose={() => {
          setIsUserModalOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={onConfirm}
        loading={upsertLoading}
        user={selectedUser ?? null}
      />

      <Modal
        contentClassName="max-w-[500px]"
        isOpen={isDeleteUserDialogOpen}
        onClose={() => setIsDeleteUserDialogOpen(false)}
        onConfirm={onDelete}
        title={t('title.deleteUser')}
        description={t('title.deleteUserDescription', { email: selectedUser?.email ?? '' })}
        cancelButtonText={t('button.cancel')}
        confirmButtonText={t('button.delete')}
        confirmButtonType="danger"
      />
    </div>
  );
}

export default function UserManagementPage() {
  return (
    <AppLayout>
      <UserManagementPageContent />
    </AppLayout>
  );
}
