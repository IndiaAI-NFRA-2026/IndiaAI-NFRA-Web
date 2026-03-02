export enum Permission {
  USER_VIEW = 'user:view',
  USER_CREATE = 'user:create',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',

  DOCUMENT_VIEW = 'document:view',
  DOCUMENT_UPLOAD = 'document:upload',
  DOCUMENT_DELETE = 'document:delete',
  DOCUMENT_APPROVE = 'document:approve',

  FINANCIAL_STATEMENT_VIEW = 'financial_statement:view',
  FINANCIAL_STATEMENT_ANALYZE = 'financial_statement:analyze',

  AUDIT_LOG_VIEW = 'audit_log:view',

  DECISION_REVIEW_VIEW = 'decision_review:view',

  FRAUD_VIEW = 'fraud:view',
  FRAUD_ANALYZE = 'fraud:analyze',

  BANK_STATEMENT_VIEW = 'bank_statement:view',

  COMBINED_ANALYSIS_VIEW = 'combined_analysis:view',

  REVIEW_EXTRACTION_VIEW = 'review_extraction:view',

  SETTINGS_VIEW = 'settings:view',
  SETTINGS_RETENTION_POLICY_VIEW = 'settings:retention-policy-view',
  SETTINGS_DOCUMENT_RETENTION_VIEW = 'settings:document-retention-view',
}
