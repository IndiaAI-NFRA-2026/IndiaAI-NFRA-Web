import { tab } from '@/enums/document-type';
export interface Vendor {
  id: number | string;
  vendor_name: string;
  total_documents: number;
}

export interface VendorsResponse {
  data: Vendor[];
  total: number;
  page: number;
  count: number;
  page_size: number;
  total_pages: number;
}

export interface VendorFilters {
  vendorName?: string;
  page: number;
  pageSize: number;
  search?: string;
  type?: tab;
  hasDecisionReview?: boolean;
  include_fraud_transactions?: boolean;
}
