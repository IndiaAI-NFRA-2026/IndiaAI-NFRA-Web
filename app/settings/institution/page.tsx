'use client';

import { useState, useEffect } from 'react';
import { Heading } from '@/components/heading';
import { SectionHeader } from '@/components/settings/section-header';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Mail, MapPin, FileText, Globe, Info, Save, X, PencilLineIcon } from 'lucide-react';
import { useInstitution, useUpdateInstitution, useUploadSingleFile } from '@/lib/query/use-institution';
import type { InstitutionUpdate } from '@/types/institution';
import { Spinner } from '@/components/ui/spinner';
import { Alert } from '@/components/ui/alert';
import { toast } from 'sonner';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { formatErrorMessage } from '@/lib/utils';
import { handleNumericInputChange, handleNumericKeyDown } from '@/lib/utils/helpers';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/button';

// Map API field names to form field names (moved outside component to reduce complexity)
const apiFieldToFormField: Record<string, string> = {
  name: 'institutionFullName',
  short_name: 'institutionShortName',
  primary_email: 'primaryContactEmail',
  primary_phone: 'primaryContactPhone',
  address: 'streetAddress',
  city: 'city',
  postal_code: 'postalCode',
  country: 'country',
  tax: 'taxIdentificationNumber',
  default_language: 'defaultLanguage',
  default_currency: 'defaultCurrency',
  default_timezone: 'defaultTimezone',
};

// Helper function to parse field name from API error (moved outside component)
function parseFieldNameFromError(errorPart: string): { apiFieldName: string; errorText: string } | null {
  const fieldRegex = /(?:body\.)?(\w+):/i;
  const fieldMatch = fieldRegex.exec(errorPart);
  if (!fieldMatch) return null;

  const apiFieldName = fieldMatch[1];
  const errorText = errorPart.split(':').slice(1).join(':').trim();
  if (!errorText) return null;

  return { apiFieldName, errorText };
}

// Helper function to parse formatted field label from error (moved outside component)
function parseFormattedFieldLabel(errorPart: string, t: (key: string) => string): { formFieldName: string; errorText: string } | null {
  const formattedRegex = /^([^:]+):\s*(.+)$/;
  const formattedMatch = formattedRegex.exec(errorPart);
  if (!formattedMatch) return null;

  const fieldLabel = formattedMatch[1].trim();
  const errorText = formattedMatch[2].trim();
  if (!errorText) return null;

  const labelToField: Record<string, string> = {
    [t('institution.basicInformation.fullName')]: 'institutionFullName',
    [t('institution.basicInformation.shortName')]: 'institutionShortName',
    [t('institution.contactInformation.email')]: 'primaryContactEmail',
    [t('institution.contactInformation.phone')]: 'primaryContactPhone',
    [t('institution.address.streetAddress')]: 'streetAddress',
    [t('institution.address.city')]: 'city',
    [t('institution.address.postalCode')]: 'postalCode',
    [t('institution.address.country')]: 'country',
    [t('institution.taxInformation.taxId')]: 'taxIdentificationNumber',
    [t('institution.defaultSettings.language')]: 'defaultLanguage',
    [t('institution.defaultSettings.currency')]: 'defaultCurrency',
    [t('institution.defaultSettings.timezone')]: 'defaultTimezone',
  };

  const formFieldName = labelToField[fieldLabel];
  if (!formFieldName) return null;

  return { formFieldName, errorText };
}

// Parse API errors and map them to form fields (moved outside component)
function parseApiErrors(errorMessage: string, t: (key: string) => string): Record<string, string> {
  const parsedErrors: Record<string, string> = {};

  const errorParts = errorMessage
    .split(';')
    .map((part) => part.trim())
    .filter((part) => part.length > 0);

  for (const errorPart of errorParts) {
    const fieldMatch = parseFieldNameFromError(errorPart);
    if (fieldMatch) {
      const formFieldName = apiFieldToFormField[fieldMatch.apiFieldName];
      if (formFieldName) {
        parsedErrors[formFieldName] = fieldMatch.errorText;
      }
      continue;
    }

    const formattedMatch = parseFormattedFieldLabel(errorPart, t);
    if (formattedMatch) {
      parsedErrors[formattedMatch.formFieldName] = formattedMatch.errorText;
    }
  }

  return parsedErrors;
}

// Helper component for loading state
function LoadingState() {
  return (
    <div className="rounded bg-(--color-background-color) p-6">
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    </div>
  );
}

// Helper component for error state
function ErrorState({ error, t }: Readonly<{ error: unknown; t: (key: string) => string }>) {
  let errorMessage = t('institution.loadError.description');
  if (error instanceof Error) {
    // Check if error message is a translation key
    const message = error.message;
    const translatedMessage = t(message);
    errorMessage = translatedMessage === message ? message : translatedMessage;
  }
  return (
    <div className="rounded bg-(--color-background-color) p-6">
      <Alert variant="error" title={t('institution.loadError.title')} description={errorMessage} />
    </div>
  );
}

// Helper component for logo upload section
function LogoUploadSection({
  logoPreview,
  logoUrl,
  isEditing,
  isUploadingLogo,
  onLogoChange,
  t,
}: Readonly<{
  logoPreview: string;
  logoUrl: string;
  isEditing: boolean;
  isUploadingLogo: boolean;
  onLogoChange: (file: File) => void;
  t: (key: string) => string;
}>) {
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onLogoChange(file);
    }
  };

  const handleClickUpload = () => {
    if (!isEditing) return;
    const input = globalThis.window.document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement | null)?.files?.[0];
      if (file) {
        onLogoChange(file);
      }
    };
    input.click();
  };

  const hasLogo = logoPreview || logoUrl;

  if (hasLogo) {
    return (
      <>
        <div className="bg-muted flex h-24 w-24 items-center justify-center rounded border border-(--color-filters-border)">
          <img src={logoPreview || logoUrl || ''} alt="Institution logo" className="h-full w-full rounded object-contain" />
        </div>
        {isEditing && (
          <div className="space-y-2">
            <div className="relative">
              <Input type="file" accept="image/*" onChange={handleFileInputChange} className="cursor-pointer" disabled={isUploadingLogo} />
              {isUploadingLogo && (
                <div className="absolute top-1/2 right-2 -translate-y-1/2">
                  <Spinner className="size-4" />
                </div>
              )}
            </div>
            <p className="text-muted-foreground text-xs">
              {isUploadingLogo ? t('institution.logo.uploading') : t('institution.logo.helper')}
            </p>
          </div>
        )}
      </>
    );
  }

  if (isEditing) {
    return (
      <button
        type="button"
        className="flex flex-1 cursor-pointer flex-col items-center justify-center gap-2 rounded-[4px] border border-dashed p-[26px]"
        onClick={handleClickUpload}
        aria-label="Click to upload institution logo"
      >
        <img src="/assets/icons/download.svg" alt="Upload" className="size-10" />
        <p className="text-[14px] leading-[22px] font-medium text-[#1D3557]">{t('institution.logo.uploadButtonLabel')}</p>
        <p className="text-muted-foreground text-[14px] leading-[22px] font-normal">{t('institution.logo.formatHelper')}</p>
      </button>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-[4px] border border-dashed p-[26px]">
      <img src="/assets/icons/download.svg" alt="Upload" className="size-10" />
      <p className="text-[14px] leading-[22px] font-medium text-[#1D3557]">{t('institution.logo.uploadButtonLabel')}</p>
      <p className="text-muted-foreground text-[14px] leading-[22px] font-normal">{t('institution.logo.formatHelper')}</p>
    </div>
  );
}

function InstitutionContent() {
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [originalData, setOriginalData] = useState<any>(null);
  const [formData, setFormData] = useState({
    // Basic Information
    institutionFullName: '',
    institutionShortName: '',
    institutionCode: '',
    // Contact Information
    primaryContactEmail: '',
    primaryContactPhone: '',
    // Address
    streetAddress: '',
    city: '',
    postalCode: '',
    country: '',
    // Tax Information
    taxIdentificationNumber: '',
    // Default Settings
    defaultLanguage: '',
    defaultCurrency: '',
    defaultTimezone: '',
    // Logo
    logo: null as File | null,
    logoPreview: '',
    logoUrl: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // API Hooks
  const { data: institutionData, isLoading, isError, error } = useInstitution();
  const updateMutation = useUpdateInstitution();
  const uploadMutation = useUploadSingleFile();

  const isUploadingLogo = uploadMutation.isPending;

  const mapInstitutionDataToFormData = (institutionData: any) => {
    return {
      institutionFullName: institutionData.name || '',
      institutionShortName: institutionData.short_name || '',
      institutionCode: institutionData.code || '',
      primaryContactEmail: institutionData.primary_email || '',
      primaryContactPhone: institutionData.primary_phone || '',
      streetAddress: institutionData.address || '',
      city: institutionData.city || '',
      postalCode: institutionData.postal_code || '',
      country: institutionData.country || '',
      taxIdentificationNumber: institutionData.tax || '',
      defaultLanguage: institutionData.default_language || '',
      defaultCurrency: institutionData.default_currency || '',
      defaultTimezone: institutionData.default_timezone || '',
      logoUrl: institutionData.logo || '',
      logoPreview: institutionData.logo || '',
      logo: null,
    };
  };

  // Populate form when data is fetched
  useEffect(() => {
    if (!institutionData) return;

    const data = mapInstitutionDataToFormData(institutionData);
    const shouldUpdate = !originalData || originalData.institutionCode !== data.institutionCode;

    if (shouldUpdate) {
      setFormData(data);
      setOriginalData(data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [institutionData]);

  const createInputChangeHandler = (field: string, isNumeric = false) => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isEditing) return;
      const value = e.target.value;
      if (isNumeric) {
        handleNumericInputChange(value, (filteredValue) => {
          handleInputChange(field, filteredValue);
        });
      } else {
        handleInputChange(field, value);
      }
      // Clear error when user starts typing
      if (field in errors && errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: '' }));
      }
    };
  };

  const handleLogoUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        logo: file,
        logoPreview: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);

    try {
      const response = await uploadMutation.mutateAsync(file);
      setFormData((prev) => ({
        ...prev,
        logoUrl: response.file.s3_url,
      }));
      toast.success(t('institution.logo.uploadSuccess'));
    } catch (error) {
      const rawErrorMessage = error instanceof Error ? error.message : t('institution.logo.uploadError');
      const formattedMessage = formatErrorMessage(rawErrorMessage, t);
      toast.error(formattedMessage);
    }
  };

  const handleInputChange = async (field: string, value: string | File | null) => {
    if (field === 'logo' && value instanceof File) {
      await handleLogoUpload(value);
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleEditSettings = () => {
    setIsEditing(true);
    // Clear errors when starting to edit
    setErrors({});
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to original values
    if (originalData) {
      setFormData({
        ...originalData,
        logo: null,
        logoPreview: originalData.logoUrl || originalData.logoPreview || '',
      });
    }
    // Clear errors
    setErrors({});
  };

  const scrollToFirstError = (errors: Record<string, string>) => {
    const firstErrorField = Object.keys(errors)[0];
    if (!firstErrorField) return;

    const errorElement =
      document.getElementById(firstErrorField) ||
      document.querySelector(`input[aria-label*="${firstErrorField}"]`) ||
      document.querySelector(`[name="${firstErrorField}"]`);
    if (errorElement) {
      errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (errorElement instanceof HTMLInputElement || errorElement instanceof HTMLTextAreaElement) {
        errorElement.focus();
      }
    }
  };

  const prepareUpdateData = (): InstitutionUpdate => {
    const trimValue = (value: string | null | undefined): string | null => {
      if (!value || typeof value !== 'string') return null;
      const trimmed = value.trim();
      return trimmed === '' ? null : trimmed;
    };

    return {
      name: trimValue(formData.institutionFullName),
      short_name: trimValue(formData.institutionShortName),
      primary_email: trimValue(formData.primaryContactEmail),
      primary_phone: trimValue(formData.primaryContactPhone),
      address: trimValue(formData.streetAddress),
      city: trimValue(formData.city),
      postal_code: trimValue(formData.postalCode),
      country: trimValue(formData.country),
      tax: trimValue(formData.taxIdentificationNumber),
      default_language: trimValue(formData.defaultLanguage),
      default_currency: trimValue(formData.defaultCurrency),
      default_timezone: trimValue(formData.defaultTimezone),
      logo: formData.logoUrl ? formData.logoUrl.trim() : null,
    };
  };

  const updateDataAfterSave = (updateData: InstitutionUpdate) => {
    setFormData({
      ...formData,
      institutionFullName: updateData.name || '',
      institutionShortName: updateData.short_name || '',
      primaryContactEmail: updateData.primary_email || '',
      primaryContactPhone: updateData.primary_phone || '',
      streetAddress: updateData.address || '',
      city: updateData.city || '',
      postalCode: updateData.postal_code || '',
      country: updateData.country || '',
      taxIdentificationNumber: updateData.tax || '',
    });

    setOriginalData({
      ...formData,
      institutionFullName: updateData.name || '',
      institutionShortName: updateData.short_name || '',
      primaryContactEmail: updateData.primary_email || '',
      primaryContactPhone: updateData.primary_phone || '',
      streetAddress: updateData.address || '',
      city: updateData.city || '',
      postalCode: updateData.postal_code || '',
      country: updateData.country || '',
      taxIdentificationNumber: updateData.tax || '',
      defaultLanguage: updateData.default_language || '',
      defaultCurrency: updateData.default_currency || '',
      defaultTimezone: updateData.default_timezone || '',
      logoUrl: updateData.logo || '',
    });
  };

  const validateMaxLength = (value: string, maxLength: number): string | null => {
    if (value.trim().length > maxLength) {
      return t('errors.maxLength')?.replace('{max}', String(maxLength)) || `String should have at most ${maxLength} characters`;
    }
    return null;
  };

  const validateRequired = (value: string, errorKey: string): string | null => {
    if (!value.trim()) {
      return t(errorKey);
    }
    return null;
  };

  const validateEmail = (email: string): string | null => {
    const MAX_LENGTH = 255;
    const requiredError = validateRequired(email, 'errors.email.required');
    if (requiredError) return requiredError;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return t('errors.email.invalid');
    }

    return validateMaxLength(email, MAX_LENGTH);
  };

  const validateFullName = (name: string): string | null => {
    const MAX_LENGTH = 255;
    const requiredError = validateRequired(name, 'errors.fullName.required');
    if (requiredError) return requiredError;
    return validateMaxLength(name, MAX_LENGTH);
  };

  const validatePhone = (phone: string): string | null => {
    const MAX_LENGTH = 255;
    const requiredError = validateRequired(phone, 'errors.phone.required');
    if (requiredError) return requiredError;
    return validateMaxLength(phone, MAX_LENGTH);
  };

  const validateForm = (): { isValid: boolean; errors: Record<string, string> } => {
    const newErrors: Record<string, string> = {};
    const MAX_LENGTH = 255;

    const validationRules: Array<{ field: string; validator: () => string | null }> = [
      { field: 'institutionFullName', validator: () => validateFullName(formData.institutionFullName) },
      { field: 'institutionShortName', validator: () => validateMaxLength(formData.institutionShortName, MAX_LENGTH) },
      { field: 'primaryContactEmail', validator: () => validateEmail(formData.primaryContactEmail) },
      { field: 'primaryContactPhone', validator: () => validatePhone(formData.primaryContactPhone) },
      { field: 'streetAddress', validator: () => validateMaxLength(formData.streetAddress, MAX_LENGTH) },
      { field: 'city', validator: () => validateMaxLength(formData.city, MAX_LENGTH) },
      { field: 'postalCode', validator: () => validateMaxLength(formData.postalCode, MAX_LENGTH) },
      { field: 'country', validator: () => validateMaxLength(formData.country, MAX_LENGTH) },
      { field: 'taxIdentificationNumber', validator: () => validateMaxLength(formData.taxIdentificationNumber, MAX_LENGTH) },
    ];

    for (const { field, validator } of validationRules) {
      const error = validator();
      if (error) {
        newErrors[field] = error;
      }
    }

    setErrors(newErrors);
    return { isValid: Object.keys(newErrors).length === 0, errors: newErrors };
  };

  const handleSave = async () => {
    if (isSaving) {
      return;
    }

    const validationResult = validateForm();
    if (!validationResult.isValid) {
      scrollToFirstError(validationResult.errors);
      return;
    }

    try {
      const updateData = prepareUpdateData();
      updateDataAfterSave(updateData);

      await updateMutation.mutateAsync(updateData);
      toast.success(t('institution.saveSuccess'));
      setIsEditing(false);
      setErrors({});
    } catch (error) {
      const rawErrorMessage = error instanceof Error ? error.message : t('institution.saveError');
      const formattedMessage = formatErrorMessage(rawErrorMessage, t);
      const parsedErrors = parseApiErrors(rawErrorMessage, t);
      if (Object.keys(parsedErrors).length > 0) {
        setErrors(parsedErrors);
      }
      toast.error(formattedMessage);
    }
  };

  const isSaving = updateMutation.isPending;

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError) {
    return <ErrorState error={error} t={t} />;
  }

  return (
    <div className="flex flex-1 flex-col gap-4 rounded bg-(--color-background-color) pb-6 shadow-[0_2px_8px_0_rgba(0,0,0,0.15)]">
      <Heading
        title={t('institution.title')}
        subTitle={t('institution.subTitle')}
        actions={[
          {
            icon: !isEditing ? <PencilLineIcon className="size-4" /> : <X className="size-4" />,
            title: !isEditing ? t('institution.editSettings') : t('institution.cancel'),
            onClick: !isEditing ? handleEditSettings : handleCancel,
            disabled: isLoading,
            type: !isEditing ? 'primary' : 'outline',
            isLoading: isSaving,
          },
        ]}
      />

      <div className="px-6">
        {/* Basic Information Section */}
        <section className="mb-5 space-y-4">
          <SectionHeader icon={<Building2 className="h-5 w-5" />} title={t('institution.basicInformation.title')} />

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-foreground mb-1 block text-[14px] leading-[24px] font-medium">
                <span className="text-red-500">*</span> {t('institution.basicInformation.fullName')}
              </label>
              <Input
                required={true}
                readOnly={!isEditing}
                value={formData.institutionFullName}
                onChange={createInputChangeHandler('institutionFullName')}
                placeholder={t('institution.basicInformation.fullNamePlaceholder')}
                className={errors.institutionFullName ? 'border-red-500' : ''}
              />
              {errors.institutionFullName && <p className="text-xs text-red-500">{errors.institutionFullName}</p>}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-foreground mb-1 block text-[14px] leading-[24px] font-medium">
                  {t('institution.basicInformation.shortName')}
                </label>
                <Input
                  readOnly={!isEditing}
                  value={formData.institutionShortName}
                  onChange={createInputChangeHandler('institutionShortName')}
                  placeholder={t('institution.basicInformation.shortNamePlaceholder')}
                  className={errors.institutionShortName ? 'border-red-500' : ''}
                />
                {errors.institutionShortName && <p className="text-xs text-red-500">{errors.institutionShortName}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-foreground mb-1 block text-[14px] leading-[24px] font-medium">
                  {t('institution.basicInformation.code')}
                </label>
                <Input value={formData.institutionCode} readOnly={true} className="cursor-not-allowed" />
                <p className="text-muted-foreground text-xs">{t('institution.basicInformation.codeHelper')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Institution Logo Section */}
        <section className="mb-5 space-y-4">
          <SectionHeader icon={<Building2 className="h-5 w-5" />} title={t('institution.logo.title')} />

          <div className="flex items-center gap-4">
            <LogoUploadSection
              logoPreview={formData.logoPreview}
              logoUrl={formData.logoUrl}
              isEditing={isEditing}
              isUploadingLogo={isUploadingLogo}
              onLogoChange={(file) => handleInputChange('logo', file)}
              t={t}
            />
          </div>
        </section>

        {/* Contact Information Section */}
        <section className="mb-5 space-y-4">
          <SectionHeader icon={<Mail className="h-5 w-5" />} title={t('institution.contactInformation.title')} />

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-foreground mb-1 block text-[14px] leading-[24px] font-medium">
                <span className="text-red-500">*</span> {t('institution.contactInformation.email')}
              </label>
              <Input
                required={true}
                readOnly={!isEditing}
                value={formData.primaryContactEmail}
                onChange={createInputChangeHandler('primaryContactEmail')}
                placeholder={t('institution.contactInformation.emailPlaceholder')}
                className={errors.primaryContactEmail ? 'border-red-500' : ''}
              />
              {errors.primaryContactEmail && <p className="text-xs text-red-500">{errors.primaryContactEmail}</p>}
              <div className="flex items-start gap-1.5">
                <Info className="text-muted-foreground mt-0.5 h-4 w-4" />
                <p className="text-muted-foreground text-xs">{t('institution.contactInformation.emailHelper')}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-foreground mb-1 block text-[14px] leading-[24px] font-medium">
                <span className="text-red-500">*</span> {t('institution.contactInformation.phone')}
              </label>
              <Input
                type="tel"
                required={true}
                readOnly={!isEditing}
                value={formData.primaryContactPhone}
                onChange={createInputChangeHandler('primaryContactPhone', true)}
                onKeyDown={handleNumericKeyDown}
                placeholder={t('institution.contactInformation.phonePlaceholder')}
                className={errors.primaryContactPhone ? 'border-red-500' : ''}
              />
              {errors.primaryContactPhone && <p className="text-xs text-red-500">{errors.primaryContactPhone}</p>}
            </div>
          </div>
        </section>

        {/* Address (Head Office) Section */}
        <section className="mb-5 space-y-4">
          <SectionHeader icon={<MapPin className="h-5 w-5" />} title={t('institution.address.title')} />

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-foreground mb-1 block text-[14px] leading-[24px] font-medium">
                {t('institution.address.streetAddress')}
              </label>
              <Input
                readOnly={!isEditing}
                value={formData.streetAddress}
                onChange={createInputChangeHandler('streetAddress')}
                placeholder={t('institution.address.streetAddressPlaceholder')}
                className={errors.streetAddress ? 'border-red-500' : ''}
              />
              {errors.streetAddress && <p className="text-xs text-red-500">{errors.streetAddress}</p>}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-foreground mb-1 block text-[14px] leading-[24px] font-medium">{t('institution.address.city')}</label>
                <Input
                  readOnly={!isEditing}
                  value={formData.city}
                  onChange={createInputChangeHandler('city')}
                  placeholder={t('institution.address.cityPlaceholder')}
                  className={errors.city ? 'border-red-500' : ''}
                />
                {errors.city && <p className="text-xs text-red-500">{errors.city}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-foreground mb-1 block text-[14px] leading-[24px] font-medium">
                  {t('institution.address.postalCode')}
                </label>
                <Input
                  readOnly={!isEditing}
                  value={formData.postalCode}
                  onChange={createInputChangeHandler('postalCode', true)}
                  onKeyDown={handleNumericKeyDown}
                  placeholder={t('institution.address.postalCodePlaceholder')}
                  className={errors.postalCode ? 'border-red-500' : ''}
                />
                {errors.postalCode && <p className="text-xs text-red-500">{errors.postalCode}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-foreground mb-1 block text-[14px] leading-[24px] font-medium">
                  {t('institution.address.country')}
                </label>
                <Input
                  readOnly={!isEditing}
                  value={formData.country}
                  onChange={createInputChangeHandler('country')}
                  placeholder={t('institution.address.countryPlaceholder')}
                  className={errors.country ? 'border-red-500' : ''}
                />
                {errors.country && <p className="text-xs text-red-500">{errors.country}</p>}
              </div>
            </div>
          </div>
        </section>

        {/* Tax Information Section */}
        <section className="mb-5 space-y-4">
          <SectionHeader icon={<FileText className="h-5 w-5" />} title={t('institution.taxInformation.title')} />

          <div className="space-y-2">
            <label className="text-foreground mb-1 block text-[14px] leading-[24px] font-medium">
              {t('institution.taxInformation.taxId')}
            </label>
            <Input
              readOnly={!isEditing}
              value={formData.taxIdentificationNumber}
              onChange={createInputChangeHandler('taxIdentificationNumber', true)}
              onKeyDown={handleNumericKeyDown}
              placeholder={t('institution.taxInformation.taxIdPlaceholder')}
              className={errors.taxIdentificationNumber ? 'border-red-500' : ''}
            />
            {errors.taxIdentificationNumber && <p className="text-xs text-red-500">{errors.taxIdentificationNumber}</p>}
            <p className="text-muted-foreground text-xs">{t('institution.taxInformation.taxIdHelper')}</p>
          </div>
        </section>

        {/* Default Settings Section */}
        <section className="space-y-4">
          <SectionHeader icon={<Globe className="h-5 w-5" />} title={t('institution.defaultSettings.title')} />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-foreground mb-1 block text-[14px] leading-[24px] font-medium">
                {t('institution.defaultSettings.language')}
              </label>
              <Select
                value={formData.defaultLanguage}
                onValueChange={(value) => {
                  if (isEditing) {
                    handleInputChange('defaultLanguage', value);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('institution.defaultSettings.languagePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">{t('common.english')}</SelectItem>
                  <SelectItem value="vi">{t('common.vietnamese')}</SelectItem>
                  <SelectItem value="th">{t('common.thai')}</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-muted-foreground text-xs">{t('institution.defaultSettings.languageHelper')}</p>
            </div>

            <div className="space-y-2">
              <label className="text-foreground mb-1 block text-[14px] leading-[24px] font-medium">
                {t('institution.defaultSettings.currency')}
              </label>
              <Select
                value={formData.defaultCurrency}
                onValueChange={(value) => {
                  if (isEditing) {
                    handleInputChange('defaultCurrency', value);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('institution.defaultSettings.currencyPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="VND">VND - Vietnamese Dong</SelectItem>
                  <SelectItem value="THB">THB - Thai Baht</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-muted-foreground text-xs">{t('institution.defaultSettings.currencyHelper')}</p>
            </div>

            <div className="space-y-2">
              <label className="text-foreground mb-1 block text-[14px] leading-[24px] font-medium">
                {t('institution.defaultSettings.timezone')}
              </label>
              <Select
                value={formData.defaultTimezone}
                onValueChange={(value) => {
                  if (isEditing) {
                    handleInputChange('defaultTimezone', value);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('institution.defaultSettings.timezonePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="Asia/Ho_Chi_Minh">Asia/Ho Chi Minh (GMT+7)</SelectItem>
                  <SelectItem value="Asia/Bangkok">Asia/Bangkok (GMT+7)</SelectItem>
                  <SelectItem value="America/New_York">America/New York (GMT-5)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-muted-foreground text-xs">{t('institution.defaultSettings.timezoneHelper')}</p>
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex flex-col items-end justify-end gap-3 border-t border-(--color-filters-border) pt-4 sm:flex-row sm:items-center">
            <Button icon={<X className="size-4" />} title={t('button.cancel')} type="outline" onClick={handleCancel} disabled={isSaving} />
            <Button
              icon={<Save className="size-4" />}
              title={t('institution.saveSettings')}
              type="primary"
              onClick={handleSave}
              disabled={isSaving}
              isLoading={isSaving}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function InstitutionSettingsPage() {
  return (
    <AppLayout isContentScrollable={true}>
      <InstitutionContent />
    </AppLayout>
  );
}
