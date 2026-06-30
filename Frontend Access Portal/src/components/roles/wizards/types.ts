export interface RoleFormState {
  name: string;
  description: string;
  type: string;
  businessUnit: string;
  businessFunction: string;
  classification: string[];
  owner: string;
  ownerId: string;
  backupOwner: string;
  approvalWorkflow: string;
  certSchedule: string;
  requestable: boolean;
  entitlements: string[];
  status: string;
  riskLevel: string;
  complianceTags: string[];
  childRoleIds: string[];
}

export const INITIAL_ROLE_FORM: RoleFormState = {
  name: "",
  description: "",
  type: "",
  businessUnit: "",
  businessFunction: "",
  classification: [],
  owner: "",
  ownerId: "",
  backupOwner: "",
  approvalWorkflow: "single",
  certSchedule: "quarterly",
  requestable: true,
  entitlements: [],
  status: "enabled",
  riskLevel: "Low",
  complianceTags: [],
  childRoleIds: [],
};

export const MAX_FIELD_LENGTH = 256;

export const ROLE_TYPES = ["Business Role", "Technical Role", "Functional Role", "Application Role"];
export const BUS_UNITS = ["Finance", "Human Resources", "Engineering", "Marketing"];