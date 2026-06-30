/**
 * User field types for dynamic rule builder
 */

export type UserFieldType = 
  | 'string' 
  | 'enum' 
  | 'boolean' 
  | 'number' 
  | 'timestamp' 
  | 'json';

export type OperatorType = 
  | '==' 
  | '!=' 
  | '>' 
  | '<' 
  | '>=' 
  | '<=' 
  | 'contains' 
  | 'startsWith' 
  | 'endsWith'
  | 'isNull'
  | 'isNotNull';

export interface UserField {
  name: string;
  label: string;
  type: UserFieldType;
  path: string; // The actual field path like "user.status"
  enumValues?: string[]; // For enum types
  description?: string;
}

export const USER_STATUS_VALUES = ['ACTIVE', 'INACTIVE', 'LOCKED'] as const;

/**
 * Complete list of User entity fields available for rule building
 */
export const USER_FIELDS: UserField[] = [
  {
    name: 'username',
    label: 'Username',
    type: 'string',
    path: 'user.username',
    description: 'Unique username for the user'
  },
  {
    name: 'email',
    label: 'Email',
    type: 'string',
    path: 'user.email',
    description: 'User email address'
  },
  {
    name: 'firstName',
    label: 'First Name',
    type: 'string',
    path: 'user.firstName',
    description: 'User first name'
  },
  {
    name: 'lastName',
    label: 'Last Name',
    type: 'string',
    path: 'user.lastName',
    description: 'User last name'
  },
  {
    name: 'displayName',
    label: 'Display Name',
    type: 'string',
    path: 'user.displayName',
    description: 'User display name'
  },
  {
    name: 'status',
    label: 'Status',
    type: 'enum',
    path: 'user.status',
    enumValues: [...USER_STATUS_VALUES],
    description: 'User account status'
  },
  {
    name: 'tenantId',
    label: 'Tenant ID',
    type: 'string',
    path: 'user.tenantId',
    description: 'Tenant identifier'
  },
  {
    name: 'mfaEnabled',
    label: 'MFA Enabled',
    type: 'boolean',
    path: 'user.mfaEnabled',
    description: 'Whether multi-factor authentication is enabled'
  },
  {
    name: 'isPasswordExpired',
    label: 'Password Expired',
    type: 'boolean',
    path: 'user.isPasswordExpired',
    description: 'Whether the user password has expired'
  },
  {
    name: 'failedLoginAttempts',
    label: 'Failed Login Attempts',
    type: 'number',
    path: 'user.failedLoginAttempts',
    description: 'Number of failed login attempts'
  },
  {
    name: 'lastLoginAt',
    label: 'Last Login At',
    type: 'timestamp',
    path: 'user.lastLoginAt',
    description: 'Timestamp of last login'
  },
  {
    name: 'passwordChangedAt',
    label: 'Password Changed At',
    type: 'timestamp',
    path: 'user.passwordChangedAt',
    description: 'Timestamp when password was last changed'
  },
  {
    name: 'createdAt',
    label: 'Created At',
    type: 'timestamp',
    path: 'user.createdAt',
    description: 'Timestamp when user was created'
  },
  {
    name: 'updatedAt',
    label: 'Updated At',
    type: 'timestamp',
    path: 'user.updatedAt',
    description: 'Timestamp when user was last updated'
  },
  {
    name: 'emailVerifiedAt',
    label: 'Email Verified At',
    type: 'timestamp',
    path: 'user.emailVerifiedAt',
    description: 'Timestamp when email was verified'
  },
  {
    name: 'lockedUntil',
    label: 'Locked Until',
    type: 'timestamp',
    path: 'user.lockedUntil',
    description: 'Timestamp until which account is locked'
  },
  {
    name: 'profileData',
    label: 'Profile Data',
    type: 'json',
    path: 'user.profileData',
    description: 'Extensible JSON profile data'
  }
];

/**
 * Get available operators for a field type
 */
export const getOperatorsForFieldType = (fieldType: UserFieldType): OperatorType[] => {
  switch (fieldType) {
    case 'string':
      return ['==', '!=', 'contains', 'startsWith', 'endsWith', 'isNull', 'isNotNull'];
    case 'enum':
      return ['==', '!=', 'isNull', 'isNotNull'];
    case 'boolean':
      return ['==', '!='];
    case 'number':
      return ['==', '!=', '>', '<', '>=', '<=', 'isNull', 'isNotNull'];
    case 'timestamp':
      return ['==', '!=', '>', '<', '>=', '<=', 'isNull', 'isNotNull'];
    case 'json':
      return ['isNull', 'isNotNull'];
    default:
      return ['==', '!='];
  }
};

/**
 * Get operator display label
 */
export const getOperatorLabel = (operator: OperatorType): string => {
  const labels: Record<OperatorType, string> = {
    '==': 'Equals',
    '!=': 'Not Equals',
    '>': 'Greater Than',
    '<': 'Less Than',
    '>=': 'Greater Than or Equal',
    '<=': 'Less Than or Equal',
    'contains': 'Contains',
    'startsWith': 'Starts With',
    'endsWith': 'Ends With',
    'isNull': 'Is Null',
    'isNotNull': 'Is Not Null'
  };
  return labels[operator];
};
