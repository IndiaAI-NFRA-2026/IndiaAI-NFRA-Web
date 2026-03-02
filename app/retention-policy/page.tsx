/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useEffect, useState } from 'react';
import { SectionHeader } from '@/components/settings/section-header';
import { RetentionCard } from '@/components/settings/retention-card';
import { Heading } from '@/components/heading';
import Container from '@/components/layout/container';
import { Alert } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { RetentionSetting } from '@/types/retention-policy';
import { getRetentionSetting, updateRetentionSetting } from '@/api/retention-setting';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { useQueryClient } from '@tanstack/react-query';
import { retentionDocumentKeys } from '@/lib/query/use-retention-documents';
import { AppLayout } from '@/components/layout/app-layout';
import Card from '@/components/card';
import { Button } from '@/components/button';
import { Check, Save, X } from 'lucide-react';
import { Modal } from '@/components/modal';

const getRetentionCardsConfig = (t: (key: string) => string) => [
  {
    key: 'uploaded_documents_retention_days' as const,
    image: <img src="/assets/icons/file-text.svg" alt="Uploaded Documents" className="h-5 w-5" />,
    title: t('retentionPolicy.retentionPeriods.uploadedDocuments.title'),
    subTitle: t('retentionPolicy.retentionPeriods.uploadedDocuments.subTitle'),
  },
  {
    key: 'derived_data_retention_days' as const,
    image: <img src="/assets/icons/database.svg" alt="Derived Data" className="h-5 w-5" />,
    title: t('retentionPolicy.retentionPeriods.derivedData.title'),
    subTitle: t('retentionPolicy.retentionPeriods.derivedData.subTitle'),
  },
  {
    key: 'audit_logs_retention_days' as const,
    image: <img src="/assets/icons/shield-check.svg" alt="Audit Logs" className="h-5 w-5" />,
    title: t('retentionPolicy.retentionPeriods.auditLogs.title'),
    subTitle: t('retentionPolicy.retentionPeriods.auditLogs.subTitle'),
  },
];

const defaultFormData: RetentionSetting = {
  institutional_id: '',
  uploaded_documents_retention_days: null,
  derived_data_retention_days: null,
  audit_logs_retention_days: null,
  enable_automatic_deletion: false,
};

function RetentionPolicyContent() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<RetentionSetting>(defaultFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isConfirmResetModalOpen, setIsConfirmResetModalOpen] = useState(false);
  const retentionCardsConfig = getRetentionCardsConfig(t);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!data.uploaded_documents_retention_days || data.uploaded_documents_retention_days <= 0) {
      newErrors.uploaded_documents_retention_days = t('errors.field.required');
    }

    if (!data.derived_data_retention_days || data.derived_data_retention_days <= 0) {
      newErrors.derived_data_retention_days = t('errors.field.required');
    }

    if (!data.audit_logs_retention_days || data.audit_logs_retention_days <= 0) {
      newErrors.audit_logs_retention_days = t('errors.field.required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (dataToSave?: RetentionSetting, isReset: boolean = false) => {
    const dataToValidate = dataToSave || data;

    if (!isReset && !validateForm()) {
      toast.error(t('errors.fillRequiredFields'));
      return;
    }
    try {
      setLoading(true);
      await updateRetentionSetting(dataToValidate);
      if (dataToSave) {
        setData(dataToSave);
      }
      setErrors({});
      queryClient.invalidateQueries({
        queryKey: retentionDocumentKeys.all,
        refetchType: 'all',
      });
      toast.success(isReset ? t('retentionPolicy.resetSuccess') : t('retentionPolicy.saveSuccess'));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('retentionPolicy.saveError');
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGetRetentionSetting = async () => {
    try {
      setLoading(true);
      const response = await getRetentionSetting();
      setData(response.data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('retentionPolicy.loadError');
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGetRetentionSetting();
  }, []);

  const handleReset = async () => {
    setIsConfirmResetModalOpen(false);
    setErrors({});
    await handleSave(defaultFormData, true);
  };

  const handleFieldChange = (key: keyof RetentionSetting, value: number) => {
    if (value >= 1) {
      setData((prev) => ({ ...prev, [key]: value }));

      if (errors[key]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[key];
          return newErrors;
        });
      }
    } else if (value === 0) {
      setData((prev) => ({ ...prev, [key]: null }));
    }
  };

  if (loading) {
    return (
      <Container>
        <div className="flex items-center justify-center py-12">
          <Spinner />
        </div>
      </Container>
    );
  }

  return (
    <Card header={<Heading title={t('retentionPolicy.title')} subTitle={t('retentionPolicy.subTitle')} />}>
      <div className="p-4 md:p-6">
        <Alert variant="warning" title={t('retentionPolicy.alert.title')} description={t('retentionPolicy.alert.description')} />

        <div className="mt-6 space-y-6">
          <section className="space-y-4">
            <SectionHeader
              icon={<img src="/assets/icons/time.svg" alt="Retention Periods" className="h-5 w-5" />}
              title={t('retentionPolicy.retentionPeriods.title')}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {retentionCardsConfig.map((card) => {
                const value = data[card.key] || 0;
                const approximateYears = value ? value / 365 : 0;
                return (
                  <RetentionCard
                    key={card.key}
                    image={card.image}
                    title={card.title}
                    subTitle={card.subTitle}
                    value={value}
                    helper={t('retentionPolicy.retentionPeriods.helper', { years: approximateYears.toFixed(2).replace(/\.?0+$/, '') })}
                    error={errors[card.key]}
                    onChange={(days) => handleFieldChange(card.key, days)}
                  />
                );
              })}
            </div>
          </section>

          <section className="space-y-3">
            <SectionHeader
              icon={<img src="/assets/icons/delete.svg" alt="Automatic Deletion" className="h-5 w-5" />}
              title={t('retentionPolicy.automaticDeletion.title')}
            />

            <div className="flex flex-col gap-3 rounded border border-(--color-filters-border) bg-[#F9FAFB] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground text-sm font-semibold">{t('retentionPolicy.automaticDeletion.enableTitle')}</p>
                  <p className="text-secondary text-xs">{t('retentionPolicy.automaticDeletion.enableDescription')}</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={data.enable_automatic_deletion ?? false}
                  onClick={() =>
                    setData((prev) => ({
                      ...prev,
                      enable_automatic_deletion: !prev.enable_automatic_deletion,
                    }))
                  }
                  className={`relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full border border-(--color-filters-border) pr-[2px] pl-[2px] transition-all ${
                    data.enable_automatic_deletion ? 'justify-end bg-(--color-button-background)' : 'justify-start bg-red-500/50'
                  }`}
                >
                  <span className="sr-only">{t('retentionPolicy.automaticDeletion.srOnly')}</span>
                  <span
                    className={`inline-block h-5 w-5 rounded-full shadow-sm ${data.enable_automatic_deletion ? 'bg-(--color-background-color)' : 'bg-muted'}`}
                  />
                </button>
              </div>
            </div>
          </section>

          <p className="text-secondary text-xs">{t('retentionPolicy.automaticDeletion.notificationHelper')}</p>

          <div className="flex items-end justify-end gap-3 border-t border-(--color-filters-border) pt-4">
            <Button
              title={t('retentionPolicy.buttons.resetToDefaults')}
              onClick={() => setIsConfirmResetModalOpen(true)}
              disabled={loading}
              isLoading={loading}
              type="outline"
              icon={<X className="size-4" />}
            />
            <Button
              title={t('retentionPolicy.buttons.saveSettings')}
              onClick={() => handleSave()}
              disabled={loading}
              isLoading={loading}
              icon={<Save className="size-4" />}
            />
          </div>
        </div>
      </div>
      <Modal
        contentClassName="max-w-[500px]"
        isOpen={isConfirmResetModalOpen}
        onClose={() => setIsConfirmResetModalOpen(false)}
        onConfirm={handleReset}
        title="Confirm Reset"
        description="This action will reset the retention policy to the default values. This cannot be undone."
        confirmButtonText={t('retentionPolicy.buttons.resetToDefaults')}
        cancelButtonText={t('button.cancel')}
        cancelButtonType="outline"
        confirmButtonIcon={<Check className="size-4" />}
        cancelButtonIcon={<X className="size-4" />}
      />
    </Card>
  );
}

export default function RetentionPolicyPage() {
  return (
    <AppLayout isContentScrollable={true}>
      <RetentionPolicyContent />
    </AppLayout>
  );
}
