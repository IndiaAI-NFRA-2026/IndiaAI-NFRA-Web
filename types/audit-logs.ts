// API Response Types
export interface AuditLogResponse {
  id: string;
  timestamp: string;
  user_id: string;
  username: string;
  full_name: string;
  role: string;
  action_type: string;
  description: string;
  ip_address: string;
  user_agent: string;
}

export interface AuditLogsApiResponse {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  logs: AuditLogResponse[];
}

// Component Display Types (transformed from API)
export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  actionType: string;
  description: string;
  ipDevice: string;
}

export interface AuditLogFilters {
  page: number;
  page_size: number;
  search?: string;
  date?: string;
  user_id?: string;
  action_type?: string;
}

export interface AuditLogFiltersApiResponse {
  users: Array<{
    id: string;
    username: string;
    full_name: string;
  }>;
  action_types: Array<{
    value: string;
    label: string;
  }>;
}
