export interface FraudDetectionApiResponse {
  documents: {
    id: string;
    period: string;
    fraud_detection: number;
    created_by: string;
    created_at: string;
    updated_at: string;
  }[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface FraudTransactionDetail {
  id: string;
  txn_id: string;
  date: string;
  description: string;
  debit: string;
  credit: string;
  flag: string;
  status: string | null;
  reason?: string | null;
  confirmed_by?: string | null;
}

export interface FraudDetailResponse {
  vender: string;
  bank_name: string;
  address: string;
  account_number: string;
  period: string;
  currency: string;
  transactions: FraudTransactionDetail[];
}
