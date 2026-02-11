'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import type { DecisionReviewDocument } from '@/components/decision-review/decision-review-column';
import type { AnalysisField } from '@/types/documents';

// Type helper for API response that may have 'Final Result' instead of 'Analysis'
type AnalysisFieldWithFinalResult =
  | AnalysisField
  | {
      'Final Result'?: string;
      rationale?: string;
      reason?: string;
      Analysis?: string;
    };

// API Response Types
export interface DecisionReviewApiItem {
  id: string;
  document_id: string;
  document_name: string;
  ai_decision_status: string;
  human_decision_status: string;
  override_by: string;
  override_at: string;
}

export interface DecisionReviewApiResponse {
  data: DecisionReviewApiItem[];
  total: number;
  skip: number | null;
  limit: number | null;
}

export interface DecisionReviewFilters {
  search?: string;
  date?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Map API decision status to UI format
 */
function mapDecisionStatus(status: string | null | undefined): DecisionReviewDocument['aiDecision'] {
  if (!status || typeof status !== 'string') {
    return 'Weak';
  }

  const statusMap: Record<string, DecisionReviewDocument['aiDecision']> = {
    strong: 'Strong',
    medium: 'Medium',
    weak: 'Weak',
  };

  return statusMap[status.toLowerCase()] || 'Not Recommended';
}

/**
 * Transform API response item to DecisionReviewDocument format
 */
function transformDecisionReviewItem(item: DecisionReviewApiItem): DecisionReviewDocument {
  return {
    id: item.id,
    fileName: item.document_name,
    aiDecision: mapDecisionStatus(item.ai_decision_status),
    humanDecision: mapDecisionStatus(item.human_decision_status),
    overriddenBy: item.override_by && item.override_by !== '-' ? item.override_by : undefined,
    overriddenAt: item.override_at || undefined,
  };
}

// Query Keys
export const decisionReviewKeys = {
  all: ['decision-review'] as const,
  lists: () => [...decisionReviewKeys.all, 'list'] as const,
  list: (vendorName: string, filters: Record<string, unknown>) => [...decisionReviewKeys.lists(), vendorName, filters] as const,
  details: () => [...decisionReviewKeys.all, 'detail'] as const,
  detail: (id: string) => [...decisionReviewKeys.details(), id] as const,
};

/**
 * Map UI status format to API status format
 */
function mapStatusToApi(status: string): string {
  const statusMap: Record<string, string> = {
    Strong: 'strong',
    Medium: 'medium',
    Weak: 'weak',
  };

  return statusMap[status] || status;
}

// API Functions
async function fetchDecisionReviewList(vendorName: string, options?: DecisionReviewFilters): Promise<DecisionReviewApiResponse> {
  const params = new URLSearchParams();

  // Pagination parameters
  const page = options?.page || 1;
  const pageSize = options?.pageSize || 10;

  params.append('page', page.toString());
  params.append('page_size', pageSize.toString());

  if (options?.search) {
    params.append('search', options.search.trim().toLowerCase());
  }
  if (options?.date) {
    params.append('from_date', `${options.date}T00:00:00`);
    params.append('to_date', `${options.date}T23:59:59`);
  }
  if (options?.status && options.status !== 'all') {
    // Map UI status format to API format
    const apiStatus = mapStatusToApi(options.status);
    params.append('status', apiStatus);
  }

  const queryString = params.toString();
  const url = queryString
    ? `/decision-review/list/${encodeURIComponent(vendorName)}?${queryString}`
    : `/decision-review/list/${encodeURIComponent(vendorName)}`;

  return apiFetch<DecisionReviewApiResponse>(url, {
    method: 'GET',
  });
}

// Custom Hooks
/**
 * Hook to fetch decision review list for a specific vendor with pagination
 */
export function useDecisionReviewList(vendorName: string | null, options?: DecisionReviewFilters & { enabled?: boolean }) {
  const { search = '', date = '', status = 'all', page = 1, pageSize = 10, enabled = true } = options ?? {};

  return useQuery({
    queryKey: decisionReviewKeys.list(vendorName || '', {
      search,
      date,
      status,
      page,
      pageSize,
    }),
    queryFn: async () => {
      try {
        const response = await fetchDecisionReviewList(vendorName!, {
          search,
          date,
          status,
          page,
          pageSize,
        });
        // Transform API response to DecisionReviewDocument format
        const documents = response.data.map((item, index) => {
          return transformDecisionReviewItem(item);
        });

        const totalPages = Math.ceil(response.total / pageSize);

        const result = {
          ...response,
          documents,
          page,
          pageSize,
          totalPages,
        };

        return result;
      } catch (error) {
        console.error('Error in queryFn:', error);
        throw error;
      }
    },
    enabled: !!vendorName && enabled,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

// Decision Review Detail Types
// Use AnalysisField from types/documents
export type DecisionReviewAnalysisField = AnalysisField;

export interface DecisionReviewDetailApiResponse {
  id: string;
  document_id: string;
  document_name: string;
  ai_decision_analysis: Record<string, Record<string, DecisionReviewAnalysisField>>;
  human_decision_analysis: Record<string, Record<string, DecisionReviewAnalysisField>> | null;
  override_by: string;
  override_at: string;
  fy_period: string;
  currency: string;
}

/**
 * Transform API analysis data to DataSourcesAudit format
 */
function transformAnalysisData(analysisData: Record<string, Record<string, DecisionReviewAnalysisField>> | null): {
  dataSourcesAuditAndAssumptions?: Record<string, AnalysisField | undefined>;
  managementAndGovernanceAssessment?: Record<string, AnalysisField | undefined>;
  ratioAnalysis?: Record<string, AnalysisField | undefined>;
  collateralAnalysis?: Record<string, AnalysisField | undefined>;
  notesBasedRiskAnalysis?: Record<string, AnalysisField | undefined>;
  trendAnalysis?: Record<string, AnalysisField | undefined>;
  industryAveragePeerComparison?: Record<string, AnalysisField | undefined>;
  finalConclusionAndRecommendation?: Record<string, AnalysisField | undefined>;
} {
  if (!analysisData) {
    return {};
  }

  const result: {
    dataSourcesAuditAndAssumptions?: Record<string, AnalysisField | undefined>;
    managementAndGovernanceAssessment?: Record<string, AnalysisField | undefined>;
    ratioAnalysis?: Record<string, AnalysisField | undefined>;
    collateralAnalysis?: Record<string, AnalysisField | undefined>;
    notesBasedRiskAnalysis?: Record<string, AnalysisField | undefined>;
    trendAnalysis?: Record<string, AnalysisField | undefined>;
    industryAveragePeerComparison?: Record<string, AnalysisField | undefined>;
    finalConclusionAndRecommendation?: Record<string, AnalysisField | undefined>;
  } = {};

  const processFinalConclusion = (sectionData: any): any => {
    if (!sectionData || typeof sectionData !== 'object') {
      return sectionData;
    }

    if (!sectionData.overall_analysis_result) {
      return sectionData;
    }

    const overallResult = sectionData.overall_analysis_result as AnalysisFieldWithFinalResult;
    const finalResultValue =
      'Final Result' in overallResult && overallResult['Final Result'] ? overallResult['Final Result'] : overallResult.Analysis || '';

    return {
      ...sectionData,
      overall_analysis_result: {
        Analysis: finalResultValue,
        rationale: overallResult.rationale || '',
        reason: overallResult.reason,
      } as AnalysisField,
    };
  };

  const mapSectionToResult = (key: string, sectionData: any, result: any): void => {
    if (key.includes('data_sources_audit_and_assumptions')) {
      result.dataSourcesAuditAndAssumptions = sectionData;
    } else if (key.includes('management_and_governance_assessment')) {
      result.managementAndGovernanceAssessment = sectionData;
    } else if (key.includes('ratio_analysis')) {
      result.ratioAnalysis = sectionData;
    } else if (key.includes('collateral_analysis')) {
      result.collateralAnalysis = sectionData;
    } else if (key.includes('notes_based_risk_analysis')) {
      result.notesBasedRiskAnalysis = sectionData;
    } else if (key.includes('trend_analysis')) {
      result.trendAnalysis = sectionData;
    } else if (key.includes('industry_average') || key.includes('peer_comparison')) {
      result.industryAveragePeerComparison = sectionData;
    } else if (key.includes('final_conclusion') || key.includes('recommendation')) {
      result.finalConclusionAndRecommendation = processFinalConclusion(sectionData);
    }
  };

  // Transform each section
  for (const key of Object.keys(analysisData)) {
    const sectionData = analysisData[key];
    mapSectionToResult(key, sectionData, result);
  }

  return result;
}

// API Functions for Detail
async function fetchDecisionReviewDetail(decisionReviewId: string): Promise<DecisionReviewDetailApiResponse> {
  return apiFetch<DecisionReviewDetailApiResponse>(`/decision-review/${decisionReviewId}`, {
    method: 'GET',
  });
}

/**
 * Hook to fetch decision review detail by ID
 */
export function useDecisionReviewDetail(decisionReviewId: string | null, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: decisionReviewKeys.detail(decisionReviewId || ''),
    queryFn: async () => {
      const response = await fetchDecisionReviewDetail(decisionReviewId!);

      // Transform analysis data
      const aiAnalysis = transformAnalysisData(response.ai_decision_analysis);
      const humanAnalysis = transformAnalysisData(response.human_decision_analysis);

      return {
        ...response,
        aiAnalysis,
        humanAnalysis,
      };
    },
    enabled: !!decisionReviewId && (options?.enabled ?? true),
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}
