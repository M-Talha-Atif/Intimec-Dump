export type AccountDetail = {
  accountId: string;
  shadowId?: string;
  createdAt: string;
  lastModified: string;
  provisionedFrom: string;
  connectorName: string;
  status: "Active" | "Disabled" | "Suspended";
  accountType: "Managed" | "Orphan" | "System Account";
  lastLogin?: string;
  ownerVerified: boolean;
  accessObjects: {
    type: "Group" | "Permission" | "Role";
    name: string;
    riskLevel: "Low" | "Medium" | "High";
    assignmentSource:
      | "Static Group"
      | "Derived from Role"
      | "Direct Assignment"
      | "Inherited";
    description?: string;
  }[];
  risks: {
    type: "SoD Conflict" | "Inactive Group" | "Provisioning Error";
    description: string;
    severity: "Low" | "Medium" | "High";
  }[];
};

export const mockAccountDetails: Record<string, AccountDetail> = {
  acc_1: {
    accountId: "391847-AD",
    createdAt: "2023-09-18 10:22 AM",
    lastModified: "2025-01-20 03:14 PM",
    provisionedFrom: "IGA Orchestrator",
    connectorName: "AD_Production_Connector",
    status: "Active",
    accountType: "Managed",
    lastLogin: "2025-01-12 09:42 AM",
    ownerVerified: false,
    accessObjects: [
      {
        type: "Group",
        name: "Domain Users",
        riskLevel: "Low",
        assignmentSource: "Static Group",
        description: "Default group for all users",
      },
      {
        type: "Group",
        name: "Engineering-All",
        riskLevel: "Medium",
        assignmentSource: "Direct Assignment",
        description: "Access to engineering file shares",
      },
      {
        type: "Permission",
        name: "vpn.read",
        riskLevel: "Low",
        assignmentSource: "Derived from Role",
        description: "VPN access permission",
      },
    ],
    risks: [
      {
        type: "SoD Conflict",
        description: "User has both development and approval access",
        severity: "High",
      },
    ],
  },
  acc_2: {
    accountId: "584921-GH",
    createdAt: "2024-02-10 14:15 PM",
    lastModified: "2025-01-15 11:20 AM",
    provisionedFrom: "Manual Provisioning",
    connectorName: "GitHub_Enterprise_Connector",
    status: "Disabled",
    accountType: "Managed",
    lastLogin: "2024-12-20 16:30 PM",
    ownerVerified: true,
    accessObjects: [
      {
        type: "Role",
        name: "Developer",
        riskLevel: "Medium",
        assignmentSource: "Direct Assignment",
        description: "Basic development access",
      },
      {
        type: "Permission",
        name: "repo.write",
        riskLevel: "High",
        assignmentSource: "Derived from Role",
        description: "Repository write access",
      },
    ],
    risks: [],
  },
  acc_3: {
    accountId: "729384-AWS",
    createdAt: "2024-01-05 09:30 AM",
    lastModified: "2025-01-26 08:45 AM",
    provisionedFrom: "Automated Provisioning",
    connectorName: "AWS_Console_Connector",
    status: "Active",
    accountType: "System Account",
    lastLogin: "2025-01-26 08:00 AM",
    ownerVerified: true,
    accessObjects: [
      {
        type: "Role",
        name: "PowerUser",
        riskLevel: "High",
        assignmentSource: "Direct Assignment",
        description: "Elevated AWS console access",
      },
      {
        type: "Permission",
        name: "ec2.admin",
        riskLevel: "High",
        assignmentSource: "Derived from Role",
        description: "EC2 administrative access",
      },
    ],
    risks: [
      {
        type: "Provisioning Error",
        description: "Account has excessive permissions for user role",
        severity: "Medium",
      },
    ],
  },
};

export const getAccountDetail = (accountId: string): AccountDetail | null => {
  return mockAccountDetails[accountId] || null;
};
