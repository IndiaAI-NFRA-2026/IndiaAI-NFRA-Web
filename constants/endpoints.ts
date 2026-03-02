export const URL_REFRESH_TOKEN = '/auth/refresh';

// Retention Settings
export const URL_RETENTION_SETTING = '/retention-settings';
export const URL_RETENTION_DOCUMENTS = '/retention-settings/documents';

// SSO
export const URL_SSO_PROTOCOLS = '/sso/protocols';
export const URL_SSO_CONFIG = (institutionalId: string) => `/sso/config/${institutionalId}`;
export const URL_SSO_CREATE_CONFIG = '/sso/config';
export const URL_SSO_UPDATE_CONFIG = '/sso/config';
export const URL_SSO_DELETE_CONFIG = '/sso/config';
export const URL_SSO_INITIATE = (institutionalId: string) => `/sso/initiate/${institutionalId}`;
export const URL_SSO_TEST_CONNECTION = (institutionalId: string) => `/sso/test/${institutionalId}`;
export const URL_SSO_CHECK_ENABLED = (institutionalId: string) => `/sso/check-enabled/${institutionalId}`;

// Upload Document
export const URL_UPLOAD_DOCUMENT_ACCEPT_CONSENT = (userId: string) => `/users/${userId}/upload-document/accept-consent`;
