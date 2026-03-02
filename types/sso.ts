export type SSOProtocol = 'SAML 2.0';

export interface SSOServiceProviderInfo {
  entity_id: string;
  acs_url: string;
  metadata_url?: string | null;
}

export interface SSOAttributeMapping {
  email?: string | null;
  username?: string | null;
  full_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
}

export interface SSOConfigResponse {
  id: string;
  institutional_id: string;
  is_enabled: boolean;
  protocol: SSOProtocol;
  protocol_config: {
    entity_id: string;
    sso_url: string;
    x509_certificate?: string;
  };
  attribute_mapping: SSOAttributeMapping;
  allowed_domains: string[];
  sp_info: SSOServiceProviderInfo;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  updated_by?: string | null;
}

export interface SSOAvailableProtocolsResponse {
  protocols: string[];
}

export interface SAML2ConfigRequest {
  entity_id: string;
  sso_url: string;
  x509_certificate: string;
}

export interface SSOAttributeMappingRequest {
  email?: string;
  username?: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
}

export interface SSOConfigCreateRequest {
  // institutional_id is automatically taken from current_user, not required in request
  protocol: SSOProtocol;
  is_enabled: boolean;
  saml2_config?: SAML2ConfigRequest;
  attribute_mapping?: SSOAttributeMappingRequest;
  allowed_domains?: string[];
}

export interface SSOConfigUpdateRequest {
  protocol?: SSOProtocol;
  is_enabled?: boolean;
  saml2_config?: SAML2ConfigRequest;
  attribute_mapping?: SSOAttributeMappingRequest;
  allowed_domains?: string[];
}
