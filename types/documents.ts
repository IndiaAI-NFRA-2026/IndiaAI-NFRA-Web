import { BankStatementExtractionAnalysisResponse, ExtractionAnalysis } from './analysis';
import { DocumentStatus } from '@/enums';
export interface Document {
  id: number | string;
  fileName: string;
  title?: string;
  type: string;
  status: DocumentStatus;
  uploadDate: string;
  period?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  errorMessage?: string;
  is_uploader?: boolean;
  fraud_detection?: number;
}

export interface DocumentFilters {
  search: string;
  status: string;
  type: string;
  uploadDate: string;
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateDocumentDto {
  title: string;
  type: string;
}

export interface PaginatedDocumentsResponse {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  documents: Document[];
  total_documents: number;
  total_document_bank_statement?: number;
  total_document_financial_statement?: number;
}

export interface DocumentResponse {
  id: string;
  file_name: string;
  created_at: string;
  period?: string;
  status: string;
  type: string | null;
  created_by?: string;
  is_uploader?: boolean;
  updated_at?: string;
  fraud_detection?: number;
}

export interface CountReviewApiResponse {
  financial_statement_count: number;
  bank_statement_count: number;
}

export interface CountAnalysisApiResponse {
  financial_statement_count: number;
  bank_statement_count: number;
  combined_analysis_count: number;
  fraud_detection_count: number;
}

export interface VendorDocumentsApiResponse {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  documents: DocumentResponse[];
  total_documents: number;
  total_document_bank_statement?: number;
  total_document_financial_statement?: number;
}

export interface VendorDocumentFilters {
  vendorName: string;
  search?: string;
  status?: string;
  type?: string;
  uploadDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface BatchUploadResponse {
  documents: Array<{
    id: number | string;
    file_name: string;
    status: string;
    is_duplicate?: boolean;
  }>;
  errors?: string[];
  failed_uploads?: number;
  successful_uploads?: number;
  total_files?: number;
  message?: string;
}

export interface UploadStatusDocument {
  id: string;
  file_name: string;
  document_type: string | null;
  status: string;
  user_id: string;
  user_name?: string | null;
  create_by?: string | null;
  vendor_name?: string;
  file_size: number;
  file_extension: string;
  financial_year?: string | null;
  progress_percentage: number;
  period: string | null;
  document_language: string | null;
  preferred_currency: string | null;
  error_message: string | null;
  extract_error?: string | null;
  s3_url: string;
  s3_key: string;
  created_at: string;
  updated_at: string;
  processed_at: string | null;
  data?: null;
  fraud?: null;
  analysis?: null;
  extraction: null;
  is_uploader?: boolean | null;
}

export interface UploadStatusResponse {
  total_documents: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  progress_percentage: number;
  documents: UploadStatusDocument[];
}

export interface ExtractionData {
  document_id: string;

  analysis_period: {
    period_start: string;
    period_end: string;
    month_count: number;
  };

  account: {
    bank_name: StringValue;
    account_number: StringValue;
    account_holder_name: StringValue;
    account_holder_address: StringValue;
    currency: StringValue;
    opening_balance: NumberValue;
    closing_balance: NumberValue;
    available_balance?: NumberValue;
  };

  bank: {
    name: StringValue;
    address?: StringValue;
  };

  entities: {
    name?: StringValue;
    address?: StringValue;
    phone?: StringValue;
    email?: StringValue;
  };

  monthlySummaries: MonthlySummary[];

  transactions: Transaction[];

  metadata?: {
    source?: string;
    created_at?: string;
  };
}

export interface StringValue {
  value: string | null;
  confidence: number;
}

export interface NumberValue {
  value: number | null;
  confidence: number;
}

export interface MonthlySummary {
  month: string;
  opening_balance: NumberValue;
  closing_balance: NumberValue;

  total_credits?: NumberValue;
  total_debits?: NumberValue;

  number_of_transactions?: {
    credits: NumberValue;
    debits: NumberValue;
  };

  highest_credit?: NumberValue;
  highest_debit?: NumberValue;

  average_daily_balance?: NumberValue;
}

export interface Transaction {
  txn_id?: StringValue;
  date: StringValue;
  month?: StringValue;
  description: StringValue;
  amount?: NumberValue;
  debit?: {
    value: number | null;
    raw?: string;
    confidence: number;
  };
  credit?: {
    value: number | null;
    raw?: string;
    confidence: number;
  };
  balance?: NumberValue;
  running_balance?: {
    value: number | string | null;
    raw?: string;
    confidence: number;
  };
  type?: StringValue;
  mode?: StringValue;
  category?:
    | StringValue
    | {
        high_level?: {
          value: string | null;
          confidence: number;
        };
        sub_category?: {
          value: string | null;
          confidence: number;
        };
      };
  reference_number?: StringValue;
}

export interface AnalysisField {
  Analysis: string;
  rationale: string;
  reason?: string;
  'Final Result'?: string;
}

export interface DataSourcesAuditAndAssumptions {
  financial_statements_review?: AnalysisField;
  audit_opinion_and_qualifications?: AnalysisField;
  peer_and_industry_data_sources?: AnalysisField;
  key_assumptions_and_adjustments?: AnalysisField;
}

export interface ManagementAndGovernanceAssessment {
  management_competence_and_track_record?: AnalysisField;
  related_party_transactions_analysis?: AnalysisField;
  governance_and_internal_controls?: AnalysisField;
}

export interface DocumentDetailResponse {
  id: string;
  file_name: string;
  document_type: string;
  status: string;
  user_id: string;
  vendor_name?: string;
  file_size: number;
  file_extension: string;
  financial_analysis_id: string;
  progress_percentage: number;
  period: string | null;
  document_language: string | null;
  preferred_currency: string | null;
  error_message: string | null;
  extract_error?: string | null;
  create_by: string;
  updated_by: string;
  s3_url: string;
  s3_key: string;
  created_at: string;
  updated_at: string;
  processed_at: string | null;
  data: ExtractedBankStatementData | ExtractionFinancialStatementData | null;
  analysis: ExtractionAnalysis | BankStatementExtractionAnalysisResponse | null;
  overwrite_data?: null;
  fraud?: FraudData;
  is_uploader?: boolean;
  analysis_error?: string | null;
  fraud_transactions_count?: number;
  approved_document_id?: string;
}

export interface ExtractedBankStatementData {
  accountName: string;
  accountHolderAddress: string;
  accountCurrency: string;
  accountNumber: string;
  bankName: string;
  beginningBalance?: string;
  monthlySummaries?: [
    {
      month: string;
      opening_balance: { value: number; confidence: number };
      closing_balance: { value: number; confidence: number };
    },
  ];
  endingBalance?: string;
  transactions: Transaction[];
}

export interface FinancialStatementValue {
  value: string;
  confidence_score: string;
}

export interface FinancialStatementExtractionData {
  status: string;
  data: {
    // Balance Sheet
    current_assets?: FinancialStatementValue;
    current_liabilities?: FinancialStatementValue;
    total_assets?: FinancialStatementValue;
    total_liabilities?: FinancialStatementValue;
    cash_and_cash_equivalents?: FinancialStatementValue;
    total_intangible_assets?: FinancialStatementValue;
    non_current_assets?: FinancialStatementValue;
    property_plant_and_equipment?: FinancialStatementValue;
    inventory?: FinancialStatementValue;
    accounts_receivable?: FinancialStatementValue;
    accounts_payable?: FinancialStatementValue;
    shareholder_equity?: FinancialStatementValue;
    retained_earnings?: FinancialStatementValue;
    // Income Statement
    revenue?: FinancialStatementValue;
    total_comprehensive_income_for_the_year?: FinancialStatementValue;
    tax_expense?: FinancialStatementValue;
    financial_year?: FinancialStatementValue;
    cost_of_goods_sold?: FinancialStatementValue;
    gross_profit?: FinancialStatementValue;
    operating_expenses?: FinancialStatementValue;
    operating_income?: FinancialStatementValue;
    net_income?: FinancialStatementValue;
    'other_income/expense'?: FinancialStatementValue;
    // Cash Flow
    cash_flow_from_operating_activities?: FinancialStatementValue;
    total_depreciation_amortisation?: FinancialStatementValue;
    cash_flow_from_investing_activities?: FinancialStatementValue;
    cash_flow_from_financing_activities?: FinancialStatementValue;
    capital_expenditure?: FinancialStatementValue;
    dividends_paid?: FinancialStatementValue;
    net_change_in_cash?: FinancialStatementValue;
    free_cash_flow?: FinancialStatementValue;
    non_cash_items?: FinancialStatementValue;
    // Debt
    interest_expense?: FinancialStatementValue;
    others?: FinancialStatementValue;
    total_interest_expense?: FinancialStatementValue;
    short_term_debt?: FinancialStatementValue;
    long_term_debt?: FinancialStatementValue;
    total_debt?: FinancialStatementValue;
    // Other
    currency?: FinancialStatementValue;
    vendor_name?: FinancialStatementValue;
    unit?: FinancialStatementValue;
    unit_1?: FinancialStatementValue;
  };
  doc_type?: FinancialStatementValue;
  audited_or_unaudited?: FinancialStatementValue;
  extracted_text?: FinancialStatementValue;
}

export interface ExtractionFinancialStatementData {
  // Basic Info
  vendor_name: string;
  currency: string;
  financial_year: string;
  audited_or_unaudited: string;
  // Balance Sheet
  current_assets: string;
  current_liabilities: string;
  total_assets: string;
  total_liabilities: string;
  cash_and_cash_equivalents: string;
  total_intangible_assets: string;
  non_current_assets: string;
  property_plant_and_equipment: string;
  inventory: string;
  accounts_receivable: string;
  accounts_payable: string;
  shareholder_equity: string;
  retained_earnings: string;
  // Income Statement
  revenue: string;
  total_comprehensive_income_for_the_year: string;
  tax_expense: string;
  cost_of_goods_sold: string;
  gross_profit: string;
  operating_expenses: string;
  operating_income: string;
  net_income: string;
  other_income_expense: string;
  // Cash Flow
  cash_flow_from_operating_activities: string;
  total_depreciation_amortisation: string;
  cash_flow_from_investing_activities: string;
  cash_flow_from_financing_activities: string;
  capitalExpenditure: string;
  dividends_paid: string;
  net_change_in_cash: string;
  free_cash_flow: string;
  non_cash_items: string;
  // Debt
  interest_expense: string;
  others: string;
  total_interest_expense: string;
  short_term_debt: string;
  long_term_debt: string;
  total_debt: string;
  // Other
  unit: string;
  unit1: string;
  extractedText: string;
}

export interface FinancialTableRow {
  category: string;
  fieldKey?: keyof any;
  amount: string;
  confidence?: number;
}

export interface FinancialTableProps {
  extractedData: any;
  isEditing: boolean;
  onUpdateField: (field: keyof any, value: string) => void;
}

export interface FinancialTableSectionProps {
  title: string;
  data: FinancialTableRow[];
  isEditing?: boolean;
  onUpdateField?: (field: keyof any, value: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

// Fraud Detection Types
export interface FraudTransactionApiResponse {
  id: string;
  document_id: string;
  txn_id: string;
  date: string;
  description: string;
  debit: string;
  credit: string;
  flag: string;
  status: string | null;
  reason: string | null;
  confirmed_by: string | null;
}

export interface FraudData {
  vender?: string;
  bank_name?: string;
  address?: string;
  account_number?: string;
  period?: string;
  currency?: string;
  transactions?: FraudTransactionApiResponse[];
}

export interface DocumentDetailWithFraudResponse extends DocumentDetailResponse {
  fraud?: FraudData;
}
