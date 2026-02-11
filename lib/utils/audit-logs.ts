import type { AuditLogResponse, AuditLog } from '@/types/audit-logs';

/**
 * Extract browser name from user agent string
 */
function extractBrowser(userAgent: string): string {
  if (!userAgent) return 'Unknown';

  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
    return 'Chrome';
  }
  if (userAgent.includes('Firefox')) {
    return 'Firefox';
  }
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    return 'Safari';
  }
  if (userAgent.includes('Edg')) {
    return 'Edge';
  }
  if (userAgent.includes('Opera') || userAgent.includes('OPR')) {
    return 'Opera';
  }

  return 'Unknown';
}

/**
 * Format timestamp from ISO format to display format
 * Input: "2025-11-24T07:07:15.047261Z"
 * Output: "2024-01-15 09:21"
 */
function formatTimestamp(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  } catch {
    return timestamp;
  }
}

/**
 * Transform API response to display format
 */
export function transformAuditLog(log: AuditLogResponse): AuditLog {
  const ipDevice = `${log.ip_address} / ${log.user_agent}`;

  return {
    id: log.id,
    timestamp: formatTimestamp(log.timestamp),
    user: log.full_name || log.username,
    role: log.role,
    actionType: log.action_type,
    description: log.description,
    ipDevice,
  };
}

/**
 * Transform array of API responses to display format
 */
export function transformAuditLogs(logs: AuditLogResponse[]): AuditLog[] {
  return logs.map(transformAuditLog);
}
