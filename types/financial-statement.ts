// Types for Financial Statement documents
export interface FinancialStatementDocument {
  id: number | string;
  fileName: string;
  fyPeriod: string;
  dateUpload: string;
  updatedAt: string;
  createdAt: string;
  uploadDate: string;
  createdBy?: string;
  period?: string;
  is_uploader?: boolean;
}

export interface ConsolidatedAnalysisDocument {
  id: number | string;
  fileName: string;
  fyPeriod: string;
  createdDate: string;
}
