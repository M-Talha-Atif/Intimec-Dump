// Identity entity types - fixed schema types
export const IDENTITY_ENTITY_TYPES = {
  EMPLOYEE: 'employee',
  NON_EMPLOYEE: 'non_employee',
  NON_HUMAN: 'non_human'
} as const;

export type IdentityEntityType = typeof IDENTITY_ENTITY_TYPES[keyof typeof IDENTITY_ENTITY_TYPES];

export const IDENTITY_ENTITY_TYPE_ARRAY: IdentityEntityType[] = [
  IDENTITY_ENTITY_TYPES.EMPLOYEE,
  IDENTITY_ENTITY_TYPES.NON_EMPLOYEE,
  IDENTITY_ENTITY_TYPES.NON_HUMAN
];

// Validation function for entity types
export function isValidEntityType(entityType: string): entityType is IdentityEntityType {
  return IDENTITY_ENTITY_TYPE_ARRAY.includes(entityType as IdentityEntityType);
}

// Display names for entity types
export const IDENTITY_ENTITY_DISPLAY_NAMES = {
  [IDENTITY_ENTITY_TYPES.EMPLOYEE]: 'Employee Identities',
  [IDENTITY_ENTITY_TYPES.NON_EMPLOYEE]: 'Non-Employee Identities',
  [IDENTITY_ENTITY_TYPES.NON_HUMAN]: 'Non-Human Identities'
} as const;

// Icons for entity types
export const ENTITY_TYPE_ICONS = {
  [IDENTITY_ENTITY_TYPES.EMPLOYEE]: '👤',
  [IDENTITY_ENTITY_TYPES.NON_EMPLOYEE]: '🧑‍💼',
  [IDENTITY_ENTITY_TYPES.NON_HUMAN]: '🤖'
} as const;

// Descriptions for entity types
export const ENTITY_TYPE_DESCRIPTIONS = {
  [IDENTITY_ENTITY_TYPES.EMPLOYEE]: 'Employee identity management',
  [IDENTITY_ENTITY_TYPES.NON_EMPLOYEE]: 'Non-employee identity management',
  [IDENTITY_ENTITY_TYPES.NON_HUMAN]: 'Non-human identity management'
} as const;
