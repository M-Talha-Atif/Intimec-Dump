export interface UserSession {
  sessionId: string;
  user: {
    userId: string;
    username: string;
    email: string;
    full_name?: string;
  };
  refreshToken: string;
  ipAddress: string;
  userAgent: string;
  device: string;
  isMobile: boolean;
  isDesktop: boolean;
  createdAt: number; // epoch timestamp
  lastActivityAt: number; // epoch timestamp
  authMethod: 'PASSWORD' | 'LDAP' | 'OAUTH2' | 'SAML';
  tenantId: string;
  location?: string;
  isCurrent?: boolean;
}
