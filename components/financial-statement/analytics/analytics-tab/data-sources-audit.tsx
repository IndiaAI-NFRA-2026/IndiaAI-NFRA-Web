'use client';

import { useLanguage } from '@/lib/i18n/useLanguage';
import type { DataSourcesAuditAndAssumptions, ManagementAndGovernanceAssessment, AnalysisField } from '@/types/documents';
import { DataSourcesAuditSection } from './data-sources-audit-section';

interface DataSourcesAuditProps {
  dataSourcesAuditAndAssumptions?: DataSourcesAuditAndAssumptions;
  managementAndGovernanceAssessment?: ManagementAndGovernanceAssessment;
  // Support for additional sections
  ratioAnalysis?: Record<string, AnalysisField | undefined>;
  collateralAnalysis?: Record<string, AnalysisField | undefined>;
  notesBasedRiskAnalysis?: Record<string, AnalysisField | undefined>;
  trendAnalysis?: Record<string, AnalysisField | undefined>;
  industryAveragePeerComparison?: Record<string, AnalysisField | undefined>;
  finalConclusionAndRecommendation?: Record<string, AnalysisField | undefined>;
  onSave?: (section: string, key: string, analysis: string, rationale: string, reason: string) => void;
  isEditable?: boolean;
  isViewReason?: boolean;
  isComplianceOfficer?: boolean;
  isUploader?: boolean;
}

export function DataSourcesAudit({
  dataSourcesAuditAndAssumptions,
  managementAndGovernanceAssessment,
  ratioAnalysis,
  collateralAnalysis,
  notesBasedRiskAnalysis,
  trendAnalysis,
  industryAveragePeerComparison,
  finalConclusionAndRecommendation,
  onSave,
  isEditable = true,
  isViewReason = false,
  isUploader = false,
}: Readonly<DataSourcesAuditProps>) {
  const { t } = useLanguage();

  const createSaveHandler = (sectionName: string) => {
    return (key: string, analysis: string, rationale: string, reason: string) => {
      if (onSave) {
        onSave(sectionName, key, analysis, rationale, reason);
      }
    };
  };

  return (
    <div className="space-y-6">
      {dataSourcesAuditAndAssumptions && (
        <DataSourcesAuditSection
          title={t('financialStatement.analytics.dataSourcesAudit.title') || 'Data Sources Audit and Assumptions'}
          data={dataSourcesAuditAndAssumptions as Record<string, AnalysisField | undefined>}
          onSave={createSaveHandler('data_sources_audit_and_assumptions')}
          isEditable={isEditable}
          isViewReason={isViewReason}
          isUploader={isUploader}
        />
      )}

      {managementAndGovernanceAssessment && (
        <DataSourcesAuditSection
          title={t('financialStatement.analytics.managementAssessment.title') || 'Management and Governance Assessment'}
          data={managementAndGovernanceAssessment as Record<string, AnalysisField | undefined>}
          onSave={createSaveHandler('management_and_governance_assessment')}
          isEditable={isEditable}
          isViewReason={isViewReason}
          isUploader={isUploader}
        />
      )}

      {ratioAnalysis && (
        <DataSourcesAuditSection
          title={t('financialStatement.analytics.ratioAnalysis.title') || 'Ratio Analysis'}
          data={ratioAnalysis}
          onSave={createSaveHandler('ratio_analysis')}
          isEditable={isEditable}
          isViewReason={isViewReason}
          isUploader={isUploader}
        />
      )}

      {collateralAnalysis && (
        <DataSourcesAuditSection
          title={t('financialStatement.analytics.collateralAnalysis.title') || 'Collateral Analysis'}
          data={collateralAnalysis}
          onSave={createSaveHandler('collateral_analysis')}
          isEditable={isEditable}
          isViewReason={isViewReason}
          isUploader={isUploader}
        />
      )}

      {notesBasedRiskAnalysis && (
        <DataSourcesAuditSection
          title={t('financialStatement.analytics.notesBasedRiskAnalysis.title') || 'Notes Based Risk Analysis'}
          data={notesBasedRiskAnalysis}
          onSave={createSaveHandler('notes_based_risk_analysis')}
          isEditable={isEditable}
          isViewReason={isViewReason}
          isUploader={isUploader}
        />
      )}

      {trendAnalysis && (
        <DataSourcesAuditSection
          title={t('financialStatement.analytics.trendAnalysis.title') || 'Trend Analysis'}
          data={trendAnalysis}
          onSave={createSaveHandler('trend_analysis')}
          isEditable={isEditable}
          isViewReason={isViewReason}
          isUploader={isUploader}
        />
      )}

      {industryAveragePeerComparison && (
        <DataSourcesAuditSection
          title={t('financialStatement.analytics.industryAveragePeerComparison.title') || 'Industry Average & Peer Comparison'}
          data={industryAveragePeerComparison}
          onSave={createSaveHandler('industry_average_&_peer_comparison')}
          isEditable={isEditable}
          isViewReason={isViewReason}
          isUploader={isUploader}
        />
      )}

      {finalConclusionAndRecommendation && (
        <DataSourcesAuditSection
          title={t('financialStatement.analytics.finalConclusionAndRecommendation.title') || 'Final Conclusion and Recommendation'}
          data={finalConclusionAndRecommendation}
          onSave={createSaveHandler('final_conclusion_and_recommendation')}
          isEditable={isEditable}
          isViewReason={isViewReason}
          isUploader={isUploader}
        />
      )}
    </div>
  );
}
