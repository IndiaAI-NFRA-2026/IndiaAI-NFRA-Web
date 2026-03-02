'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Container from '@/components/layout/container';
import { Heading } from '@/components/heading';
import { SectionHeader } from '@/components/settings/section-header';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { CheckCircle2, Copy, Loader2, TrashIcon, PlusIcon, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useMe } from '@/lib/query/use-auth';
import { useSSOConfig, useCreateSSOConfig, useUpdateSSOConfig, useSSOProtocols } from '@/lib/query/use-sso';
import { AppLayout } from '@/components/layout/app-layout';
import { Input } from '@/components/typing/input';
import { Button } from '@/components/button';

function SSOSettingsContent() {
  const { t } = useTranslation();
  const { data: user } = useMe();
  const institutionalId = (user as any)?.institutional_id as string | undefined;

  const { data: ssoConfig, isLoading: isLoadingConfig } = useSSOConfig(institutionalId, {
    enabled: !!institutionalId,
  });
  const { data: protocolsData } = useSSOProtocols();
  const createMutation = useCreateSSOConfig();
  const updateMutation = useUpdateSSOConfig();

  const [isEnabled, setIsEnabled] = useState(false);
  const [protocol, setProtocol] = useState<'SAML 2.0'>('SAML 2.0');
  const [entityId, setEntityId] = useState('');
  const [ssoUrl, setSsoUrl] = useState('');
  const [certificate, setCertificate] = useState('');
  const [allowedDomains, setAllowedDomains] = useState<string[]>(['']);
  const [isConnectionSuccessful, setIsConnectionSuccessful] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load existing config when available
  useEffect(() => {
    if (ssoConfig) {
      // Update form state when config loads
      setIsEnabled(ssoConfig.is_enabled);
      setProtocol(ssoConfig.protocol);
      if (ssoConfig.protocol_config) {
        setEntityId(ssoConfig.protocol_config.entity_id || '');
        setSsoUrl(ssoConfig.protocol_config.sso_url || '');
        setCertificate(ssoConfig.protocol_config.x509_certificate || '');
      }
      if (ssoConfig.allowed_domains && ssoConfig.allowed_domains.length > 0) {
        setAllowedDomains(ssoConfig.allowed_domains);
      }
      setIsConnectionSuccessful(false); // Reset on load
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ssoConfig?.id]); // Only re-run when config ID changes

  const spEntityId = ssoConfig?.sp_info?.entity_id;
  const acsUrl = ssoConfig?.sp_info?.acs_url;

  const handleCopy = async (text: string, label: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        toast.success(t('sso.copiedToClipboard', { label }));
      } else {
        toast.error(t('sso.clipboardNotAvailable'));
      }
    } catch {
      toast.error(t('sso.copyFailed'));
    }
  };

  const validateUrl = (url: string): string | null => {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) return null;
    try {
      const urlObj = new URL(trimmedUrl);
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return t('sso.urlInvalidProtocol');
      }
      return null;
    } catch {
      return t('sso.urlInvalid');
    }
  };

  const validateCertificate = (cert: string): string | null => {
    const trimmedCert = cert.trim();
    if (!trimmedCert) return t('sso.certificateEmpty');
    if (!trimmedCert.startsWith('-----BEGIN CERTIFICATE-----')) return t('sso.certificateStart');
    if (!trimmedCert.endsWith('-----END CERTIFICATE-----')) return t('sso.certificateEnd');
    return null;
  };

  const handleSave = async () => {
    if (!institutionalId) {
      toast.error(t('sso.institutionalIdRequired'));
      return;
    }

    const newErrors: Record<string, string> = {};
    const entityIdError = validateUrl(entityId);
    const ssoUrlError = validateUrl(ssoUrl);

    if (!entityId.trim()) {
      newErrors.entityId = t('sso.entityIdRequired');
    } else if (entityIdError) {
      newErrors.entityId = entityIdError;
    }

    if (!ssoUrl.trim()) {
      newErrors.ssoUrl = t('sso.ssoUrlRequired');
    } else if (ssoUrlError) {
      newErrors.ssoUrl = ssoUrlError;
    }

    // Validate certificate format
    const certError = validateCertificate(certificate);
    if (certError) {
      newErrors.certificate = certError;
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    // Parse allowed domains
    const domainsArray = allowedDomains
      .map((d) => d.trim())
      .filter((d) => d.length > 0)
      .map((d) => (d.startsWith('@') ? d : `@${d}`));

    const configData = {
      protocol: 'SAML 2.0' as const,
      is_enabled: isEnabled,
      saml2_config: {
        entity_id: entityId,
        sso_url: ssoUrl,
        x509_certificate: certificate.trim(),
      },
      allowed_domains: domainsArray.length > 0 ? domainsArray : undefined,
    };

    try {
      if (ssoConfig) {
        // Update existing config - backend gets institutional_id from current_user
        await updateMutation.mutateAsync({
          protocol: 'SAML 2.0',
          is_enabled: isEnabled,
          saml2_config: configData.saml2_config,
          allowed_domains: domainsArray.length > 0 ? domainsArray : undefined,
        });
        toast.success(t('sso.updateSuccess'));
      } else {
        await createMutation.mutateAsync(configData);
        toast.success(t('sso.createSuccess'));
      }
    } catch (error: any) {
      const errorMessage = error?.data?.detail || error?.message || t('sso.saveFailed');
      toast.error(errorMessage);
    }
  };

  const isLoading = isLoadingConfig || createMutation.isPending || updateMutation.isPending;

  if (!institutionalId) {
    return (
      <Container>
        <Heading title={t('sso.title')} subTitle={t('sso.subTitle')} />
        <div className="mt-6">
          <Card className="p-5">
            <p className="text-secondary">{t('sso.mustBeInstitution')}</p>
          </Card>
        </div>
      </Container>
    );
  }

  return (
    <div className="rounded bg-(--color-background-color) pb-6">
      <Heading title={t('sso.title')} subTitle={t('sso.subTitle')} />

      <div className="px-6">
        {isLoadingConfig && (
          <div className="mt-6 flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}

        {!isLoadingConfig && (
          <div className="mt-6 space-y-6">
            {/* Enable SSO + Protocol */}
            <section className="rounded bg-[#F9FAFB] p-[16px]">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-foreground text-sm leading-[24px] font-semibold">{t('sso.enableSSO')}</p>
                  <p className="text-secondary text-[14px] leading-[21px]">{t('sso.enableSSODescription')}</p>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={isEnabled}
                  onClick={() => setIsEnabled((prev) => !prev)}
                  className={`relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full border border-(--color-filters-border) pr-[2px] pl-[2px] transition-all ${
                    isEnabled ? 'justify-end bg-(--color-button-background)' : 'justify-start bg-red-500'
                  } ${isEnabled ? '' : 'cursor-not-allowed opacity-50'}`}
                >
                  <span className="sr-only">Enable SSO Authentication</span>
                  <span
                    className={`inline-block h-5 w-5 rounded-full shadow-sm ${isEnabled ? 'bg-(--color-background-color)' : 'bg-muted'}`}
                  />
                </button>
              </div>
            </section>

            <div className="flex flex-col gap-1">
              <label htmlFor="protocol-select" className="text-foreground text-[14px] leading-[22px] font-normal">
                {t('sso.protocol')}
              </label>
              <Select value={protocol} onValueChange={(value) => setProtocol(value as 'SAML 2.0')} disabled={!isEnabled}>
                <SelectTrigger id="protocol-select" className="h-10 cursor-pointer">
                  <SelectValue placeholder={t('sso.selectProtocol')} />
                </SelectTrigger>
                <SelectContent>
                  {protocolsData?.protocols?.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  )) || <SelectItem value="SAML 2.0">SAML 2.0</SelectItem>}
                </SelectContent>
              </Select>
              <p className="text-secondary text-xs">{t('sso.selectProtocolHelper')}</p>
            </div>

            <SectionHeader title={t('sso.identityProviderConfig')} />

            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="entity-id-input" className="text-foreground text-[14px] leading-[22px] font-normal">
                  {t('sso.entityId')}
                </label>
                <Input
                  id="entity-id-input"
                  placeholder={t('sso.entityIdPlaceholder')}
                  value={entityId}
                  onChange={(e) => {
                    setEntityId(e.target.value);
                    if (errors.entityId) {
                      setErrors((prev) => ({ ...prev, entityId: '' }));
                    }
                  }}
                  disabled={!isEnabled}
                  className={errors.entityId ? 'border-red-500' : ''}
                />
                {errors.entityId && <p className="text-xs text-red-500">{errors.entityId}</p>}
                <p className="text-secondary text-xs">{t('sso.entityIdHelper')}</p>
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="sso-url-input" className="text-foreground text-sm">
                  {t('sso.ssoUrl')}
                </label>
                <Input
                  id="sso-url-input"
                  placeholder={t('sso.ssoUrlPlaceholder')}
                  value={ssoUrl}
                  onChange={(e) => {
                    setSsoUrl(e.target.value);
                    // Clear error when user starts typing
                    if (errors.ssoUrl) {
                      setErrors((prev) => ({ ...prev, ssoUrl: '' }));
                    }
                  }}
                  disabled={!isEnabled}
                  className={errors.ssoUrl ? 'border-red-500' : ''}
                />
                {errors.ssoUrl && <p className="text-xs text-red-500">{errors.ssoUrl}</p>}
                <p className="text-secondary text-xs">{t('sso.ssoUrlHelper')}</p>
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="certificate-textarea" className="text-foreground text-[14px] leading-[22px] font-normal">
                  {t('sso.x509Certificate')}
                </label>
                <Textarea
                  id="certificate-textarea"
                  rows={5}
                  placeholder={t('sso.x509Placeholder')}
                  value={certificate}
                  onChange={(e) => {
                    setCertificate(e.target.value);
                    // Clear error when user starts typing
                    if (errors.certificate) {
                      setErrors((prev) => ({ ...prev, certificate: '' }));
                    }
                  }}
                  disabled={!isEnabled}
                  className={errors.certificate ? 'border-red-500' : ''}
                />
                {errors.certificate && <p className="text-xs text-red-500">{errors.certificate}</p>}
              </div>
            </div>

            <SectionHeader title={t('sso.attributeMapping')} />

            <div className="flex flex-col gap-4">
              <p className="text-secondary text-sm">{t('sso.attributeMappingHelper')}</p>
              <label htmlFor="allowed-domains-0" className="text-foreground text-[14px] leading-[22px] font-normal">
                {t('sso.allowedDomains')}
              </label>
              {allowedDomains.map((domain, index) => (
                <div key={`domain-${domain}-${index}`} className="flex items-center gap-4">
                  <div className="flex-1">
                    <Input
                      id={`allowed-domains-${index}`}
                      className="block"
                      placeholder={t('sso.allowedDomainsPlaceholder')}
                      value={domain}
                      onChange={(e) => {
                        const newAllowedDomains = [...allowedDomains];
                        newAllowedDomains[index] = e.target.value;
                        setAllowedDomains(newAllowedDomains);
                      }}
                      disabled={!isEnabled}
                    />
                  </div>

                  {index > 0 ? (
                    <button
                      type="button"
                      onClick={() => {
                        const newAllowedDomains = [...allowedDomains];
                        newAllowedDomains.splice(index, 1);
                        setAllowedDomains(newAllowedDomains);
                      }}
                      className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-[4px] border hover:opacity-70"
                      aria-label="Remove domain"
                    >
                      <TrashIcon className="w-[18px] text-[#DC2626]" />
                    </button>
                  ) : (
                    <div className="h-10 w-10"></div>
                  )}
                </div>
              ))}
              <div>
                <Button
                  type="outline"
                  onClick={() => setAllowedDomains([...allowedDomains, ''])}
                  disabled={!isEnabled}
                  icon={<PlusIcon className="size-4" />}
                  title={t('sso.add')}
                />
              </div>
            </div>

            {/* Service Provider Information & Connection Status */}
            {spEntityId && acsUrl && (
              <section className="flex flex-col gap-2">
                <Card className="space-y-4 rounded-[4px] border border-[#BEDBFF] bg-[#EFF6FF] p-5">
                  <h3 className="text-foreground text-sm font-semibold">{t('sso.serviceProviderInfo')}</h3>
                  <p className="text-[14px] leading-[21px]">{t('sso.serviceProviderInfoHelper')}</p>

                  <div className="space-y-3">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="text-[14px] leading-[21px] uppercase">{t('sso.spEntityId')}</p>
                      </div>
                      <div className="flex items-center gap-2 rounded-[4px] border border-[#BEDBFF] bg-[#FFFFFF] px-2 py-1">
                        <p className="text-foreground text-sm break-all">{spEntityId}</p>
                        <button
                          type="button"
                          onClick={() => handleCopy(spEntityId, t('sso.spEntityId'))}
                          className="cursor-pointer hover:opacity-70"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="text-[14px] leading-[21px] uppercase">{t('sso.acsUrl')}</p>
                      </div>
                      <div className="flex items-center gap-2 rounded-[4px] border border-[#BEDBFF] bg-[#FFFFFF] px-2 py-1">
                        <p className="text-foreground text-sm break-all">{acsUrl}</p>
                        <button
                          type="button"
                          onClick={() => handleCopy(acsUrl, t('sso.acsUrl'))}
                          className="cursor-pointer hover:opacity-70"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>

                {isConnectionSuccessful && (
                  <Card className="flex flex-col justify-center space-y-3 border border-green-200 bg-green-50/50 p-5">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                      <div className="space-y-1">
                        <h4 className="text-foreground text-sm font-semibold">{t('sso.connectionSuccessful')}</h4>
                        <p className="text-secondary text-xs">{t('sso.connectionSuccessfulDesc')}</p>
                      </div>
                    </div>
                  </Card>
                )}
              </section>
            )}

            {/* Actions */}
            <div className="flex flex-col items-end justify-end gap-3 border-t border-(--color-filters-border) pt-4 sm:flex-row sm:items-center">
              <Button
                type="primary"
                onClick={handleSave}
                disabled={isLoading}
                title={isLoading ? t('sso.saving') : t('sso.saveConfiguration')}
                isLoading={isLoading}
                icon={<Save className="size-4" />}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SSOSettingsPage() {
  return (
    <AppLayout isContentScrollable={true}>
      <SSOSettingsContent />
    </AppLayout>
  );
}
