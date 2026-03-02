/* eslint-disable react-hooks/exhaustive-deps */
import { DocumentStatus } from '@/enums';
import { USER_ROLE, USER_STATUS } from '@/enums/auth';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DocumentType } from '@/enums/document-type';

export interface BaseOption {
  label: string;
  value: string;
  icon?: string;
}

export const useOptionsMultiLanguages = (): { [key: string]: BaseOption[] } => {
  const { t, i18n } = useTranslation('');
  const [language, setLanguage] = useState(i18n.language);

  useEffect(() => {
    const onLangChange = () => setLanguage(i18n.language);
    i18n.on('languageChanged', onLangChange);

    return () => {
      i18n.off('languageChanged', onLangChange);
    };
  }, [i18n]);

  const userStatusOptions = useMemo(
    () => [
      {
        label: t('userStatus.active'),
        value: USER_STATUS.ACTIVE,
      },
      {
        label: t('userStatus.inactive'),
        value: USER_STATUS.INACTIVE,
      },
    ],
    [language, t]
  );

  const documentTypeOptions = useMemo(
    () => [
      {
        label: t('documentType.financialStatement'),
        value: DocumentType.FINANCIAL_STATEMENT,
      },
      {
        label: t('documentType.bankStatement'),
        value: DocumentType.BANK_STATEMENT,
      },
    ],
    [language, t]
  );

  const userRoleOptions = useMemo(
    () => [
      {
        label: t('userRole.creditOfficerAnalyst'),
        value: USER_ROLE.CREDIT_OFFICER_ANALYST,
      },
      {
        label: t('userRole.complianceOfficer'),
        value: USER_ROLE.COMPLIANCE_OFFICER,
      },
    ],
    [language, t]
  );

  const documentStatusOptions = useMemo(
    () => [
      {
        label: t('documentStatus.pending'),
        value: DocumentStatus.PENDING,
      },
      {
        label: t('documentStatus.processing'),
        value: DocumentStatus.PROCESSING,
      },
      {
        label: t('documentStatus.review'),
        value: DocumentStatus.REVIEW,
      },
      {
        label: t('documentStatus.approved'),
        value: DocumentStatus.APPROVED,
      },
      {
        label: t('documentStatus.failed'),
        value: DocumentStatus.FAILED,
      },
    ],
    [language, t]
  );

  return {
    documentStatusOptions,
    documentTypeOptions,
    userStatusOptions,
    userRoleOptions,
  };
};
