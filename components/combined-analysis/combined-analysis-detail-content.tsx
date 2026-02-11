'use client';

import { useState } from 'react';
import Image from 'next/image';
import { CombinedAnalysisSection } from './combined-analysis-section';
import { CombinedAnalysisSectionItem } from './combined-analysis-section-item';
import { CombinedAnalysisDetail } from '@/types/analysis';
import { formatTitle } from '@/lib/utils/helpers';

interface CombinedAnalysisDetailContentProps {
  analysis: CombinedAnalysisDetail;
  onSave: (sectionPath: string[], fieldKey: string, analysis: string, rationale: string, reason: string) => void;
  isEditable?: boolean;
  isUploader?: boolean;
}

export function CombinedAnalysisDetailContent({
  analysis,
  onSave,
  isEditable = true,
  isUploader = false,
}: Readonly<CombinedAnalysisDetailContentProps>) {
  const [isFinancialPerformanceExpanded, setIsFinancialPerformanceExpanded] = useState(true);
  const [isFinalRecommendationExpanded, setIsFinalRecommendationExpanded] = useState(true);

  const createSaveHandler = (sectionKey: string) => {
    return (fieldKey: string, analysisContent: string, rationaleContent: string, reasonContent: string) => {
      onSave([sectionKey], fieldKey, analysisContent, rationaleContent, reasonContent);
    };
  };

  // Special handler for nested sections (like ratio_analysis)
  const createNestedSaveHandler = (sectionKey: string, subSectionKey: string) => {
    return (fieldKey: string, analysisContent: string, rationaleContent: string, reasonContent: string) => {
      onSave([sectionKey, subSectionKey], fieldKey, analysisContent, rationaleContent, reasonContent);
    };
  };

  return (
    <div className="space-y-6">
      {/* 0. Data Validation and Assumptions */}
      {analysis.data_validation_and_assumptions && (
        <CombinedAnalysisSection
          title={formatTitle('Data Validation and Assumptions')}
          data={analysis.data_validation_and_assumptions}
          onSave={createSaveHandler('data_validation_and_assumptions')}
          isEditable={isEditable}
          isUploader={isUploader}
        />
      )}

      {/* 1. Management and Governance Quality */}
      {analysis.management_and_governance_quality && (
        <CombinedAnalysisSection
          title={formatTitle('Management and Governance Quality')}
          data={analysis.management_and_governance_quality}
          onSave={createSaveHandler('management_and_governance_quality')}
          isEditable={isEditable}
          isUploader={isUploader}
        />
      )}

      {/* 2. Financial Performance and Structure */}
      {analysis.financial_performance_and_structure && (
        <div className="space-y-6">
          <div className="rounded border border-(--color-filters-border) bg-(--color-background-color)">
            <button
              onClick={() => setIsFinancialPerformanceExpanded(!isFinancialPerformanceExpanded)}
              className="flex w-full cursor-pointer items-center justify-between border-b border-(--color-filters-border) px-6 py-4"
            >
              <h2 className="text-base font-bold text-(--color-table-header-text-color)">
                {formatTitle('Financial Performance and Structure')}
              </h2>
              <Image
                src="/assets/icons/expanded-icon.svg"
                alt="Expand/Collapse"
                width={11}
                height={7}
                className={isFinancialPerformanceExpanded ? '' : 'rotate-180'}
              />
            </button>
            {isFinancialPerformanceExpanded && (
              <div className="p-6">
                {/* Ratio Analysis */}
                {analysis.financial_performance_and_structure.ratio_analysis && (
                  <div className="mb-6">
                    <h3 className="mb-4 text-sm font-bold text-(--color-table-header-text-color)">{formatTitle('Ratio Analysis')}</h3>
                    <div className="space-y-4">
                      {Object.entries(analysis.financial_performance_and_structure.ratio_analysis).map(([key, value]) => (
                        <CombinedAnalysisSectionItem
                          key={key}
                          fieldKey={key}
                          field={value as { analysis: string; rationale: string }}
                          titleKey={key}
                          onSave={createNestedSaveHandler('financial_performance_and_structure', 'ratio_analysis')}
                          isEditable={isEditable}
                          isUploader={isUploader}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Cashflow and Bank Behaviour */}
                {analysis.financial_performance_and_structure.cashflow_and_bank_behaviour && (
                  <div className="mb-6">
                    <h3 className="mb-4 text-sm font-bold text-(--color-table-header-text-color)">
                      {formatTitle('Cashflow and Bank Behaviour')}
                    </h3>
                    <CombinedAnalysisSection
                      title=""
                      data={analysis.financial_performance_and_structure.cashflow_and_bank_behaviour}
                      onSave={(fieldKey: string, analysisContent: string, rationaleContent: string, reasonContent: string) => {
                        onSave(
                          ['financial_performance_and_structure', 'cashflow_and_bank_behaviour'],
                          fieldKey,
                          analysisContent,
                          rationaleContent,
                          reasonContent
                        );
                      }}
                      isEditable={isEditable}
                      isUploader={isUploader}
                    />
                  </div>
                )}

                {/* Earnings Quality */}
                {analysis.financial_performance_and_structure.earnings_quality && (
                  <div className="mb-6">
                    <h3 className="mb-4 text-sm font-bold text-(--color-table-header-text-color)">{formatTitle('Earnings Quality')}</h3>
                    <CombinedAnalysisSection
                      title=""
                      data={analysis.financial_performance_and_structure.earnings_quality}
                      onSave={(fieldKey: string, analysisContent: string, rationaleContent: string, reasonContent: string) => {
                        onSave(
                          ['financial_performance_and_structure', 'earnings_quality'],
                          fieldKey,
                          analysisContent,
                          rationaleContent,
                          reasonContent
                        );
                      }}
                      isEditable={isEditable}
                      isUploader={isUploader}
                    />
                  </div>
                )}

                {/* Trend Analysis */}
                {analysis.financial_performance_and_structure.trend_analysis && (
                  <div>
                    <h3 className="mb-4 text-sm font-bold text-(--color-table-header-text-color)">{formatTitle('Trend Analysis')}</h3>
                    <CombinedAnalysisSection
                      title=""
                      data={analysis.financial_performance_and_structure.trend_analysis}
                      onSave={(fieldKey: string, analysisContent: string, rationaleContent: string, reasonContent: string) => {
                        onSave(
                          ['financial_performance_and_structure', 'trend_analysis'],
                          fieldKey,
                          analysisContent,
                          rationaleContent,
                          reasonContent
                        );
                      }}
                      isEditable={isEditable}
                      isUploader={isUploader}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Collateral and Security Analysis */}
      {analysis.collateral_and_security_analysis && (
        <CombinedAnalysisSection
          title={formatTitle('Collateral and Security Analysis')}
          data={analysis.collateral_and_security_analysis}
          onSave={createSaveHandler('collateral_and_security_analysis')}
          isEditable={isEditable}
          isUploader={isUploader}
        />
      )}

      {/* 4. Notes and Contingent Risk Analysis */}
      {analysis.notes_and_contingent_risk_analysis && (
        <CombinedAnalysisSection
          title={formatTitle('Notes and Contingent Risk Analysis')}
          data={analysis.notes_and_contingent_risk_analysis}
          onSave={createSaveHandler('notes_and_contingent_risk_analysis')}
          isEditable={isEditable}
          isUploader={isUploader}
        />
      )}

      {/* 5. Peer and Industry Positioning */}
      {analysis.peer_and_industry_positioning && (
        <CombinedAnalysisSection
          title={formatTitle('Peer and Industry Positioning')}
          data={analysis.peer_and_industry_positioning}
          onSave={createSaveHandler('peer_and_industry_positioning')}
          isEditable={isEditable}
          isUploader={isUploader}
        />
      )}

      {/* 6. Integrated Credit Assessment */}
      {analysis.integrated_credit_assessment && (
        <CombinedAnalysisSection
          title={formatTitle('Integrated Credit Assessment')}
          data={analysis.integrated_credit_assessment}
          onSave={createSaveHandler('integrated_credit_assessment')}
          isEditable={isEditable}
          isUploader={isUploader}
        />
      )}

      {/* 7. Final Recommendation */}
      {analysis.final_recommendation && (
        <div className="rounded border border-(--color-filters-border) bg-(--color-background-color)">
          <button
            onClick={() => setIsFinalRecommendationExpanded(!isFinalRecommendationExpanded)}
            className="flex w-full cursor-pointer items-center justify-between border-b border-(--color-filters-border) px-6 py-4"
          >
            <h2 className="text-base font-bold text-(--color-table-header-text-color)">{formatTitle('Final Recommendation')}</h2>
            <Image
              src="/assets/icons/expanded-icon.svg"
              alt="Expand/Collapse"
              width={11}
              height={7}
              className={isFinalRecommendationExpanded ? '' : 'rotate-180'}
            />
          </button>
          {isFinalRecommendationExpanded && (
            <div className="p-6">
              {Object.entries(analysis.final_recommendation).map(([key, value]) => {
                // Special handling for overall_analysis_result which has 'Final Result' field
                const fieldData =
                  key === 'overall_analysis_result' && value && typeof value === 'object' && 'Final Result' in value
                    ? { 'Final Result': (value as any)['Final Result'] || '', rationale: (value as any).rationale || '' }
                    : (value as { analysis: string; rationale: string });

                return (
                  <div key={key} className="mb-4 last:mb-0">
                    <CombinedAnalysisSectionItem
                      fieldKey={key}
                      field={fieldData as any}
                      titleKey={key}
                      onSave={createSaveHandler('final_recommendation')}
                      isEditable={isEditable}
                      isUploader={isUploader}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
