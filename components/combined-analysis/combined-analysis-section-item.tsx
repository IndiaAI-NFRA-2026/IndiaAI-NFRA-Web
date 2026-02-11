'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { EditModal } from '@/components/financial-statement/analytics/analytics-tab/edit-modal';
import { formatTitle } from '@/lib/utils/helpers';

interface CombinedAnalysisField {
  analysis?: string;
  rationale?: string;
  reason?: string;
  'Final Result'?: string;
}

interface CombinedAnalysisSectionItemProps {
  fieldKey: string;
  field: CombinedAnalysisField;
  titleKey: string;
  onSave?: (key: string, analysis: string, rationale: string, reason: string) => void;
  isEditable?: boolean;
  isUploader?: boolean;
}

export function CombinedAnalysisSectionItem({
  fieldKey,
  field,
  titleKey,
  onSave,
  isEditable = true,
  isUploader = false,
}: Readonly<CombinedAnalysisSectionItemProps>) {
  const { t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handle both 'analysis' and 'Final Result' fields
  const analysisValue = field.analysis || field['Final Result'] || '';
  const [analysis, setAnalysis] = useState(analysisValue);
  const [rationale, setRationale] = useState(field.rationale || '');
  const [reason, setReason] = useState(field.reason || '');

  // Check if this is a final result field
  const isFinalResult = fieldKey === 'overall_analysis_result' || 'Final Result' in field;
  const finalResultOptions = ['strong', 'medium', 'weak'] as const;
  const normalizedAnalysis = analysis?.toLowerCase().trim() || '';
  const isFinalResultDropdown = isFinalResult && finalResultOptions.includes(normalizedAnalysis as (typeof finalResultOptions)[number]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const newAnalysisValue = field.analysis || field['Final Result'] || '';
      setAnalysis(newAnalysisValue);
      setRationale(field.rationale || '');
      setReason(field.reason || '');
    }, 0);
    return () => clearTimeout(timer);
  }, [field.analysis, field['Final Result'], field.rationale, field.reason]);

  const handleEdit = () => {
    setIsModalOpen(true);
  };

  const handleModalSave = (analysisContent: string, rationaleContent: string, reasonContent: string) => {
    if (onSave) {
      onSave(fieldKey, analysisContent, rationaleContent, reasonContent);
    }
    // Update local state with the saved content
    setAnalysis(analysisContent);
    setRationale(rationaleContent);
    setReason(reasonContent);
    setIsModalOpen(false);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="rounded-lg border border-(--color-filters-border) bg-(--color-background-color)">
      <div className="flex items-center justify-between border-b border-(--color-filters-border) px-6 py-4">
        <h3 className="text-sm font-bold text-(--color-table-header-text-color)">{formatTitle(titleKey)}</h3>
        {isEditable && isUploader && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEdit}
            className="h-8 rounded border border-(--color-data-sources-audit-analysis-border-color) bg-(--color-background-color) px-4 text-(--color-table-header-text-color) hover:bg-(--color-background-color) hover:text-(--color-table-header-text-color)"
            title={t('financialStatement.analytics.edit') || 'Edit'}
          >
            <Image src="/assets/icons/edit-icon.svg" alt={t('financialStatement.analytics.edit') || 'Edit'} width={12} height={12} />
            {t('financialStatement.analytics.edit') || 'Edit'}
          </Button>
        )}
      </div>
      <div className="space-y-4 p-6">
        {/* Analysis Field or Final Result */}
        <div className="space-y-2 rounded border border-(--color-data-sources-audit-analysis-border-color) bg-(--color-data-sources-audit-analysis-background-color) p-4">
          <label className="text-sm font-semibold text-(--color-data-sources-audit-analysis-text-color)">
            {isFinalResult
              ? t('financialStatement.analytics.finalResult') || 'Final Result'
              : t('financialStatement.analytics.analysis') || 'Analysis'}
          </label>
          {isFinalResultDropdown ? (
            <div className="text-sm font-medium text-(--color-data-sources-audit-analysis-text-color)">
              {t(`financialStatement.analytics.finalResultOptions.${normalizedAnalysis}`) || normalizedAnalysis}
            </div>
          ) : (
            <div
              className="prose prose-sm max-w-none text-sm leading-relaxed text-(--color-data-sources-audit-analysis-text-color) [&_li]:mb-1 [&_li_p]:mb-0 [&_ol]:ml-6 [&_ol]:list-decimal [&_ol]:space-y-1 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:ml-6 [&_ul]:list-disc [&_ul]:space-y-1"
              dangerouslySetInnerHTML={{
                __html: analysis || 'No analysis provided',
              }}
            />
          )}
        </div>

        {/* Rationale Field */}
        <div className="space-y-2 rounded border border-(--color-data-sources-audit-rationale-border-color) bg-(--color-data-sources-audit-rationale-background-color) p-4">
          <label className="mb-1 text-sm font-semibold text-(--color-data-sources-audit-rationale-text-color)">
            {t('financialStatement.analytics.rationale') || 'Rationale'}
          </label>
          <div
            className="prose prose-sm max-w-none text-sm leading-relaxed text-(--color-data-sources-audit-rationale-text-color) [&_li]:mb-1 [&_li_p]:mb-0 [&_ol]:ml-6 [&_ol]:list-decimal [&_ol]:space-y-1 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:ml-6 [&_ul]:list-disc [&_ul]:space-y-1"
            dangerouslySetInnerHTML={{
              __html: rationale || 'No rationale provided',
            }}
          />
        </div>
      </div>

      {/* Edit Modal */}
      <EditModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        initialJustification={analysis}
        initialRationale={rationale}
        initialReason={reason}
        initialKey={fieldKey}
        onSave={handleModalSave}
      />
    </div>
  );
}
