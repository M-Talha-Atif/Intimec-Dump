
export const mockDebugLogs = [
  {
    id: '1',
    timestamp: '2024-01-15 10:30:15',
    level: 'ERROR',
    source: 'Connectors',
    category: 'connector',
    message: 'Failed to authenticate with Active Directory connector',
    objectType: 'Identity',
    objectId: 'john.doe@company.com',
    correlationId: 'req-12345',
    retryable: true,
    details: {
      error: 'Authentication failed',
      connector: 'AD-Primary',
      attempts: 3,
      lastAttempt: '2024-01-15 10:30:15'
    },
    aiExplanation: 'This error typically occurs when the service account credentials have expired or been changed. The connector cannot authenticate with the target system.',
    suggestedFix: 'Check the service account credentials in the connector configuration and verify they have not expired.'
  },
  {
    id: '2',
    timestamp: '2024-01-15 10:29:45',
    level: 'INFO',
    source: 'Workflows',
    category: 'workflow',
    message: 'User provisioning workflow completed successfully',
    objectType: 'Identity',
    objectId: 'jane.smith@company.com',
    correlationId: 'wf-67890',
    retryable: false,
    details: {
      workflow: 'User Onboarding',
      duration: '45s',
      steps: 8,
      completedSteps: 8
    }
  },
  {
    id: '3',
    timestamp: '2024-01-15 10:29:30',
    level: 'WARN',
    source: 'Access Requests',
    category: 'access',
    message: 'Access request approval deadline approaching',
    objectType: 'AccessRequest',
    objectId: 'AR-2024-001',
    correlationId: 'req-54321',
    retryable: false,
    details: {
      requestId: 'AR-2024-001',
      requester: 'bob.wilson@company.com',
      approver: 'manager@company.com',
      deadline: '2024-01-16 17:00:00',
      hoursRemaining: 6.5
    }
  },
  {
    id: '4',
    timestamp: '2024-01-15 10:29:00',
    level: 'DEBUG',
    source: 'Provisioning',
    category: 'connector',
    message: 'Account creation request sent to ServiceNow',
    objectType: 'Account',
    objectId: 'alice.brown@company.com',
    correlationId: 'prov-11111',
    retryable: true,
    details: {
      application: 'ServiceNow',
      accountType: 'Standard User',
      attributes: {
        firstName: 'Alice',
        lastName: 'Brown',
        department: 'Engineering'
      }
    }
  },
  {
    id: '5',
    timestamp: '2024-01-15 10:28:45',
    level: 'TRACE',
    source: 'Workflows',
    category: 'workflow',
    message: 'Workflow step execution: Validate user attributes',
    objectType: 'Identity',
    objectId: 'mike.johnson@company.com',
    correlationId: 'wf-22222',
    retryable: false,
    details: {
      stepId: 'validate-attrs-001',
      stepName: 'Validate User Attributes',
      executionTime: '234ms',
      inputAttributes: {
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike.johnson@company.com',
        department: 'Sales'
      },
      validationRules: [
        'email_format_check',
        'department_exists',
        'name_length_check'
      ],
      validationResults: {
        email_format_check: 'PASS',
        department_exists: 'PASS',
        name_length_check: 'PASS'
      }
    }
  },
  {
    id: '6',
    timestamp: '2024-01-15 10:28:30',
    level: 'TRACE',
    source: 'Connectors',
    category: 'connector',
    message: 'HTTP request to LDAP connector: search for user attributes',
    objectType: 'Identity',
    objectId: 'sarah.davis@company.com',
    correlationId: 'conn-33333',
    retryable: true,
    details: {
      method: 'POST',
      endpoint: '/api/v1/ldap/search',
      requestHeaders: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer [REDACTED]'
      },
      requestPayload: {
        searchBase: 'ou=users,dc=company,dc=com',
        filter: '(mail=sarah.davis@company.com)',
        attributes: ['cn', 'mail', 'department', 'manager']
      },
      responseTime: '156ms',
      responseStatus: 200
    }
  },
  {
    id: '7',
    timestamp: '2024-01-15 10:28:15',
    level: 'ERROR',
    source: 'Webhooks/API',
    category: 'connector',
    message: 'Webhook delivery failed for identity lifecycle event',
    objectType: 'Identity',
    objectId: 'tom.anderson@company.com',
    correlationId: 'hook-44444',
    retryable: true,
    details: {
      webhookUrl: 'https://external-system.company.com/webhooks/identity',
      event: 'identity.created',
      httpStatus: 500,
      error: 'Internal Server Error',
      retryAttempt: 2,
      nextRetry: '2024-01-15 10:33:15'
    },
    aiExplanation: 'The external system is returning a 500 error, indicating an internal server error on their end. This is typically a temporary issue.',
    suggestedFix: 'Monitor for automatic retry. If the issue persists, contact the external system administrator.'
  },
  {
    id: '8',
    timestamp: '2024-01-15 10:28:00',
    level: 'INFO',
    source: 'Authentication',
    category: 'access',
    message: 'SSO authentication successful',
    objectType: 'Identity',
    objectId: 'lisa.garcia@company.com',
    correlationId: 'auth-55555',
    retryable: false,
    details: {
      ssoProvider: 'Azure AD',
      authenticationType: 'SAML',
      sessionDuration: '8h',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  }
];
