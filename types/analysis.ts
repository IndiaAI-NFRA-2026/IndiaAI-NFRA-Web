import { DataSourcesAuditAndAssumptions, ManagementAndGovernanceAssessment, AnalysisField } from './documents';
export interface ConsolidatedAnalysisApiResponse {
  items: Array<{
    id: string;
    name: string;
    fy_period: string;
    currency: string;
    analyze_error: string | null;
    created_by: string;
    created_at: string;
    updated_at: string;
  }>;
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  total_documents: number;
}

export interface CombinedAnalysisApiResponse {
  items: Array<{
    id: string;
    name: string;
    fy_period: string;
    vendor_name: string;
    created_by: string;
    created_at: string;
    updated_at: string;
    overall_result?: string | null;
  }>;
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface CombinedAnalysisDetailApiResponse {
  id: string;
  name: string;
  fy_period: string;
  vendor_name: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  overall_result?: string | null;
  analysis?: CombinedAnalysisDetail | null;
}

export interface CombinedAnalysisDetail {
  data_validation_and_assumptions: {
    document_integrity_checks: {
      analysis: string;
      rationale: string;
    };
    financial_statement_consistency: {
      analysis: string;
      rationale: string;
    };
    bank_statement_alignment: {
      analysis: string;
      rationale: string;
    };
    key_assumptions_and_normalisations: {
      analysis: string;
      rationale: string;
    };
  };
  management_and_governance_quality: {
    management_track_record: {
      analysis: string;
      rationale: string;
    };
    governance_systems_and_controls: {
      analysis: string;
      rationale: string;
    };
    related_party_exposure: {
      analysis: string;
      rationale: string;
    };
  };
  financial_performance_and_structure: {
    ratio_analysis: {
      liquidity: {
        analysis: string;
        rationale: string;
      };
      solvency: {
        analysis: string;
        rationale: string;
      };
      profitability: {
        analysis: string;
        rationale: string;
      };
      efficiency: {
        analysis: string;
        rationale: string;
      };
    };
    cashflow_and_bank_behaviour: {
      monthly_inflow_outflow_patterns: {
        analysis: string;
        rationale: string;
      };
      volatility_and_buffer: {
        analysis: string;
        rationale: string;
      };
      high_risk_counterparty_flags: {
        analysis: string;
        rationale: string;
      };
    };
    earnings_quality: {
      one_off_items: {
        analysis: string;
        rationale: string;
      };
      revenue_recognition_risks: {
        analysis: string;
        rationale: string;
      };
      accrual_vs_cash_mismatch: {
        analysis: string;
        rationale: string;
      };
    };
    trend_analysis: {
      horizontal_trends: {
        analysis: string;
        rationale: string;
      };
      vertical_structure: {
        analysis: string;
        rationale: string;
      };
    };
  };
  collateral_and_security_analysis: {
    collateral_strength: {
      analysis: string;
      rationale: string;
    };
    recoverability_and_liquidation_risk: {
      analysis: string;
      rationale: string;
    };
    existing_liens_and_priorities: {
      analysis: string;
      rationale: string;
    };
    borrowing_base_estimation: {
      analysis: string;
      rationale: string;
    };
  };
  notes_and_contingent_risk_analysis: {
    covenant_compliance: {
      analysis: string;
      rationale: string;
    };
    contingent_liabilities: {
      analysis: string;
      rationale: string;
    };
    legal_and_regulatory_exposures: {
      analysis: string;
      rationale: string;
    };
    red_flag_indicators: {
      analysis: string;
      rationale: string;
    };
  };
  peer_and_industry_positioning: {
    industry_benchmark_comparison: {
      analysis: string;
      rationale: string;
    };
    direct_peer_comparison: {
      analysis: string;
      rationale: string;
    };
    macroeconomic_and_sector_outlook: {
      analysis: string;
      rationale: string;
    };
  };
  integrated_credit_assessment: {
    aggregate_financial_health_strength: {
      analysis: string;
      rationale: string;
    };
    key_positive_drivers: {
      analysis: string;
      rationale: string;
    };
    key_risk_drivers: {
      analysis: string;
      rationale: string;
    };
    model_reasoning_trace: {
      analysis: string;
      rationale: string;
    };
  };
  final_recommendation: {
    credit_decision_and_rationale: {
      analysis: string;
      rationale: string;
    };
    proposed_limits_and_conditions: {
      analysis: string;
      rationale: string;
    };
    monitoring_and_early_warning_triggers: {
      analysis: string;
      rationale: string;
    };
    going_concern_assessment: {
      analysis: string;
      rationale: string;
    };
    overall_analysis_result: {
      'Final Result': string;
      rationale: string;
    };
  };
}

export interface AnalyzeDetailApiResponse {
  id: string;
  name: string;
  fy_period: string;
  currency: string;
  results: {
    analysis_period?: string;
    years_analyzed: string[];
    data_sources_audit_and_assumptions?: Record<string, AnalysisField>;
    management_and_governance_assessment?: Record<string, AnalysisField>;
    ratio_analysis?: Record<string, AnalysisField>;
    collateral_analysis?: Record<string, AnalysisField>;
    notes_based_risk_analysis?: Record<string, AnalysisField>;
    trend_analysis?: Record<string, AnalysisField>;
    'industry_average_&_peer_comparison'?: Record<string, AnalysisField>;
    final_conclusion_and_recommendation?: Record<string, AnalysisField>;
  };
  analyze_error: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  analysis?: {
    id: string;
    interpretation?: string;
    final_recommendation?: string;
    user_id?: string;
  };
}

export interface ExtractionAnalysis {
  id: string;
  analysis_error?: string | null;
  current_ratio?: string;
  quick_ratio?: string;
  cash_ratio?: string;
  debt_to_equity_ratio?: string;
  debt_to_assets_ratio?: string;
  interest_coverage_ratio?: string;
  gross_profit_margin?: string;
  operating_profit_margin?: string;
  net_profit_margin?: string;
  return_on_assets?: string;
  return_on_equity?: string;
  inventory_turnover?: string;
  receivables_turnover?: string;
  days_sales_outstanding?: string;
  asset_turnover?: string;
  operating_cash_flow_ratio?: string;
  cash_flow_margin?: string;
  free_cash_flow?: string;
  working_capital?: string;
  cash_conversion_cycle?: string;
  current_liability_coverage?: string;
  times_interest_earned_ratio?: string;
  dupont_roe?: string;
  user_id?: string;
  analysis?: {
    data_sources_audit_and_assumptions?: DataSourcesAuditAndAssumptions;
    management_and_governance_assessment?: ManagementAndGovernanceAssessment;
    ratio_analysis?: Record<string, AnalysisField>;
    collateral_analysis?: Record<string, AnalysisField>;
    notes_based_risk_analysis?: Record<string, AnalysisField>;
    trend_analysis?: Record<string, AnalysisField>;
    'industry_average_&_peer_comparison'?: AnalysisField;
    final_conclusion_and_recommendation?: AnalysisField;
  };
}

export interface BankStatementExtractionAnalysisResponse {
  schema_version: string;
  balance_metrics: {
    opening_balance: number;
    closing_balance: number;
    average_balance: number;
    min_balance: number;
    total_credit: number;
    total_debit: number;
  };
  cash_flow: {
    total_inflow: number;
    total_outflow: number;
    inflow_outflow_ratio: number;
  };
  transaction_categories: {
    utilities?: {
      count: number;
      total_amount: number;
      transaction_ids: string[];
    };
    transfer?: {
      count: number;
      total_amount: number;
      transaction_ids: string[];
    };
    others?: {
      count: number;
      total_amount: number;
      transaction_ids: string[];
    };
    education?: {
      count: number;
      total_amount: number;
      transaction_ids: string[];
    };
    cash_withdrawal?: {
      count: number;
      total_amount: number;
      transaction_ids: string[];
    };
    insurance?: {
      count: number;
      total_amount: number;
      transaction_ids: string[];
    };
  };
  risk_patterns: RiskPattern[];
  credit_metrics: {
    buffer_ratio: number;
    cash_volatility: string;
    average_monthly_inflow: number | null;
    average_monthly_outflow: number | null;
  };
}

export interface ValueTransaction {
  value: string | number | null;
  confidence: number;
  raw?: string;
}

export interface RiskPattern {
  risk_type: string;
  transaction_id: string;
  rationale: string;
  reason?: string;
  severity?: string;
  confidence?: number;
}
export interface BankTransaction {
  txn_id: ValueTransaction;
  date: ValueTransaction;
  month: ValueTransaction;
  description: ValueTransaction;
  debit: ValueTransaction;
  credit: ValueTransaction;
  running_balance: ValueTransaction;
  mode: ValueTransaction;
  category: {
    high_level: ValueTransaction;
    sub_category: ValueTransaction;
  };
}

export interface MonthlySummary {
  month: ValueTransaction;
  opening_balance: ValueTransaction;
  closing_balance: ValueTransaction;
  total_credits: number | string;
  total_debits: number | string;
  transaction_count: number | string;
  average_balance: number | string;
  largest_value: ValueTransaction;
  transactions: BankTransaction[];
  casino_transaction: {
    count: ValueTransaction;
    transactions: BankTransaction[];
  };
  unusual_currency_transactions: {
    count: ValueTransaction;
    transactions: BankTransaction[];
  };
  round_tripping_transactions: {
    count: ValueTransaction;
    transactions: BankTransaction[];
  };
  anomalies: {
    count: ValueTransaction;
    transactions: BankTransaction[];
  };
}

export interface BankStatementResponse {
  id: string;
  file_name: string;
  document_type: DocumentType;
  status: string;
  user_id: string | null;
  user_name: string | null;
  create_by: string | null;
  vendor_name: string;
  file_size: number;
  financial_year: string | null;
  file_extension: string;
  progress_percentage: number;
  period: string | null;
  document_language: string | null;
  preferred_currency: string | null;
  error_message: string | null;
  extract_error: string | null;
  s3_url: string;
  s3_key: string | null;
  created_at: string;
  updated_at: string;
  processed_at: string | null;
  data: {
    doc_type: DocumentType;
    analysis_period: {
      period_start: string;
      period_end: string;
      month_count: number;
    };
    account: {
      bank_name: {
        value: string;
        confidence: number;
      };
      account_holder_name: {
        value: string;
        confidence: number;
      };
      account_holder_address: {
        value: string;
        confidence: number;
      };
      account_number: {
        value: string;
        confidence: number;
      };
      account_masked: {
        value: string;
        confidence: number;
      };
      account_type: {
        value: string;
        confidence: number;
      };
      currency: {
        value: string;
        confidence: number;
      };
      ifsc: {
        value: string | null;
        confidence: number;
      };
    };
    monthly_summaries: MonthlySummary[];

    transactions: BankTransaction[];
  };
  analysis: BankStatementExtractionAnalysisResponse | null;
}
