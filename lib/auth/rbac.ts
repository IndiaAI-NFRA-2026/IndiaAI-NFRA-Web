import { ROUTERS } from '@/constants/routers';
import { USER_ROLE } from '@/enums/auth';

export const PUBLIC_ROUTERS = [ROUTERS.LOGIN, ROUTERS.FORBIDDEN];

const BASE_PATHS_WITH_CHILDREN = [ROUTERS.ANALYSIS, ROUTERS.REVIEW_EXTRACTION];

const PagesForRole: Record<USER_ROLE, string[]> = {
  [USER_ROLE.ADMIN]: [ROUTERS.USER_MANAGEMENT, ROUTERS.AUDIT_LOG, ROUTERS.SETTINGS, ROUTERS.INSTITUTION, ROUTERS.SSO_CONFIGURATION],
  [USER_ROLE.COMPLIANCE_OFFICER]: [ROUTERS.AUDIT_LOG, ROUTERS.ANALYSIS, ROUTERS.DOCUMENT_RETENTION, ROUTERS.RETENTION_POLICY],
  [USER_ROLE.CREDIT_OFFICER_ANALYST]: [ROUTERS.REVIEW_EXTRACTION, ROUTERS.ANALYSIS],
};

export const finalPagesForRole = (role?: USER_ROLE): string[] => {
  const pages = (role && PagesForRole[role]) ?? [];
  return [...pages, ...PUBLIC_ROUTERS];
};

function isUnderBase(pathname: string, base: string): boolean {
  return pathname === base || pathname.startsWith(base + '/');
}

export const hasAccessToPage = (role: USER_ROLE | undefined, page: string): boolean => {
  const allowed = finalPagesForRole(role);
  if (allowed.includes(page)) return true;
  const canAccessSub = BASE_PATHS_WITH_CHILDREN.some((base) => allowed.includes(base) && isUnderBase(page, base));
  return canAccessSub;
};

export const getDefaultRouteForUser = (role: USER_ROLE): string => {
  const pages = PagesForRole[role] ?? [];
  return pages[0] ?? PUBLIC_ROUTERS[0];
};

export type PermissionAction = 'create' | 'read' | 'update' | 'delete';

export type Page =
  | 'user_management'
  | 'audit_log'
  | 'institution'
  | 'sso_configuration'
  | 'analysis'
  | 'analysis_detail'
  | 'review_extraction'
  | 'review_extraction_upload'
  | 'review_extraction_detail'
  | 'document_retention'
  | 'retention_policy';

export type Resource = Page;

const PermissionsForRole: Record<USER_ROLE, Partial<Record<Page, PermissionAction[]>>> = {
  [USER_ROLE.ADMIN]: {
    user_management: ['create', 'read', 'update', 'delete'],
    audit_log: ['read'],
    institution: ['read', 'update'],
    sso_configuration: ['read', 'update'],
  },
  [USER_ROLE.COMPLIANCE_OFFICER]: {
    audit_log: ['read'],
    analysis: ['read'],
    analysis_detail: ['read', 'update'],
    document_retention: ['read', 'update'],
    retention_policy: ['read', 'update'],
  },
  [USER_ROLE.CREDIT_OFFICER_ANALYST]: {
    analysis: ['read'],
    analysis_detail: ['read', 'update'],
    review_extraction: ['read'],
    review_extraction_upload: ['create', 'read'],
    review_extraction_detail: ['read', 'update', 'delete'],
  },
};

export const hasPermission = (role: USER_ROLE | undefined, page: Page, action: PermissionAction): boolean => {
  if (!role) return false;
  const actions = PermissionsForRole[role]?.[page];
  return Array.isArray(actions) && actions.includes(action);
};

export const canCreate = (role: USER_ROLE | undefined, page: Page): boolean => hasPermission(role, page, 'create');

export const canUpdate = (role: USER_ROLE | undefined, page: Page): boolean => hasPermission(role, page, 'update');

export const canDelete = (role: USER_ROLE | undefined, page: Page): boolean => hasPermission(role, page, 'delete');

export const canRead = (role: USER_ROLE | undefined, page: Page): boolean => hasPermission(role, page, 'read');

export function getPageFromPath(pathname: string): Page | null {
  const p = pathname.replace(/\/$/, '') || '/';
  if (p === '/user-management') return 'user_management';
  if (p === '/audit-logs') return 'audit_log';
  if (p.startsWith('/settings/institution')) return 'institution';
  if (p.startsWith('/settings/sso-configuration')) return 'sso_configuration';
  if (/^\/analysis\/[^/]+\/[^/]+\/(financial-statement|bank-statement|combined-analysis|consolidated-analysis|fraud-detection)$/.test(p))
    return 'analysis_detail';
  if (p.startsWith('/analysis')) return 'analysis';
  if (p === '/review-extraction/upload-document') return 'review_extraction_upload';
  if (/^\/review-extraction\/[^/]+\/[^/]+$/.test(p)) return 'review_extraction_detail';
  if (p.startsWith('/review-extraction')) return 'review_extraction';
  if (p === '/document-retention') return 'document_retention';
  if (p === '/retention-policy') return 'retention_policy';
  return null;
}
