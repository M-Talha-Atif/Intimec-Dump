export interface AvailableSource {
  id: string;
  name: string;
  type: string;
  syncStatus: "synced" | "out-of-sync" | "not-configured";
  icon: string;
  description: string;
}

export const availableSources: AvailableSource[] = [
  {
    id: "a1b2c3d4-e5f6-4abc-8def-123456789012",
    name: "Okta",
    type: "Identity Provider",
    syncStatus: "synced",
    icon: "🔐",
    description: "Identity and access management platform",
  },
  {
    id: "b2c3d4e5-f6a1-4bcd-9ef0-234567890123",
    name: "Azure Active Directory",
    type: "Directory",
    syncStatus: "out-of-sync",
    icon: "🏢",
    description: "Microsoft cloud-based identity service",
  },
  {
    id: "c3d4e5f6-a1b2-4cde-af01-345678901234",
    name: "Google Workspace",
    type: "Productivity",
    syncStatus: "synced",
    icon: "🌐",
    description: "Google productivity and collaboration tools",
  },
  {
    id: "d4e5f6a1-b2c3-4def-b012-456789012345",
    name: "Active Directory",
    type: "Directory",
    syncStatus: "synced",
    icon: "🏢",
    description: "On-premises directory service",
  },
  {
    id: "e5f6a1b2-c3d4-4ef0-c123-567890123456",
    name: "Salesforce",
    type: "CRM",
    syncStatus: "not-configured",
    icon: "☁️",
    description: "Customer relationship management platform",
  },
  {
    id: "f6a1b2c3-d4e5-4f01-d234-678901234567",
    name: "Workday",
    type: "HR System",
    syncStatus: "out-of-sync",
    icon: "👥",
    description: "Human resources management system",
  },
  {
    id: "a1b2c3d4-e5f6-4012-e345-789012345678",
    name: "GitHub",
    type: "DevOps",
    syncStatus: "synced",
    icon: "🐙",
    description: "Version control and collaboration platform",
  },
  {
    id: "b2c3d4e5-f6a1-4123-f456-890123456789",
    name: "AWS IAM",
    type: "Cloud Provider",
    syncStatus: "not-configured",
    icon: "☁️",
    description: "Amazon Web Services identity management",
  },
  {
    id: "c3d4e5f6-a1b2-4234-0567-901234567890",
    name: "Slack",
    type: "Productivity",
    syncStatus: "synced",
    icon: "💬",
    description: "Team communication platform",
  },
  {
    id: "d4e5f6a1-b2c3-4345-1678-012345678901",
    name: "Jira",
    type: "DevOps",
    syncStatus: "out-of-sync",
    icon: "📋",
    description: "Project management and issue tracking",
  },
  {
    id: "e5f6a1b2-c3d4-4456-2789-123456789012",
    name: "ServiceNow",
    type: "External System",
    syncStatus: "not-configured",
    icon: "🛠️",
    description: "IT service management platform",
  },
  {
    id: "f6a1b2c3-d4e5-4567-3890-234567890123",
    name: "Oracle EBS",
    type: "Database",
    syncStatus: "synced",
    icon: "🗄️",
    description: "Enterprise business suite",
  },
];
