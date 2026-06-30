import React from "react";
import {
  BarChart,
  Bug,
  Database,
  FileText,
  KeyRound,
  Lock,
  Mail,
  Palette,
  Search,
  Shield,
  UserCog,
  Users,
  Zap,
  Brain,
} from "lucide-react";
import { ApplicationPermissionsContent } from "@/components/app-permissions/ApplicationPermissionsContent";
import ApplicationUIConfigurator from "@/components/settings/ApplicationUIConfigurator";
import { IdentityAttributeMappingContent } from "@/components/identity-mapping/IdentityAttributeMappingContent";
import NotificationManagement from "@/components/settings/NotificationManagement";
import ReportsManagement from "@/components/settings/ReportsManagement";
import SchemaManagementContent from "@/components/schema-management/SchemaManagementContent";
import SearchManagement from "@/components/settings/SearchManagement";
import SSOConnectionsPage from "@/components/Auth/SSOConnectionsPage";
import DebugConfigurationPage from "../debugconfiguration/page";
import { LoginSecurityForm } from "@/components/settings/login-security/LoginSecurityForm";
import AIManagement from "@/components/settings/AIManagement";

// --- Placeholder Components for Undefined Sections ---

// A generic placeholder for sections under development
const PlaceholderContent = ({ title }: { title: string }) => (
  <div className="p-6 bg-muted rounded-lg border border-border">
    <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
    <p className="mt-2 text-muted-foreground">
      Configuration for this section is under development.
    </p>
  </div>
);

const ComplianceAuditContent = () => (
  <PlaceholderContent title="Compliance & Audit" />
);
const DebuggingContent = () => <DebugConfigurationPage />;
const IdentityGovernanceContent = () => (
  <PlaceholderContent title="Identity Governance" />
);
const SystemIntegrationsContent = () => (
  <PlaceholderContent title="System Integrations" />
);
const LifecycleManagementContent = () => (
  <PlaceholderContent title="Lifecycle Management" />
);
const AccessReviewsContent = () => (
  <PlaceholderContent title="Access Reviews" />
);
const RiskAnalyticsContent = () => (
  <PlaceholderContent title="Risk Analytics" />
);

// --- Settings Configuration ---

export interface SettingSection {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  category: string;
  component: React.ComponentType;
}

export const settingsSections: SettingSection[] = [
  {
    id: "access",
    title: "Access Management",
    description: "Control user access and permissions",
    icon: Lock,
    category: "Security",
    component: () => <PlaceholderContent title="Access Management" />,
  },
  {
    id: "ai-management",
    title: "AI Management",
    description:
      "Configure AI features, prompts, connections, and monitor usage across the platform",
    icon: Brain,
    category: "AI",
    component: AIManagement,
  },
  {
    id: "application-permissions",
    title: "Application Permissions",
    description:
      "Manage granular access controls for internal IGA platform features and data",
    icon: KeyRound,
    category: "System",
    component: ApplicationPermissionsContent,
  },
  {
    id: "application-ui",
    title: "Application UI",
    description:
      "Customize the application's visual appearance, branding, and user interface",
    icon: Palette,
    category: "System",
    component: ApplicationUIConfigurator,
  },
  {
    id: "compliance",
    title: "Compliance & Audit",
    description: "Manage compliance reporting and audit trails",
    icon: FileText,
    category: "Governance",
    component: ComplianceAuditContent,
  },
  {
    id: "debugging",
    title: "Debugging",
    description:
      "Configure debug visibility and logging granularity across the IGA platform",
    icon: Bug,
    category: "System",
    component: DebuggingContent,
  },
  {
    id: "governance",
    title: "Identity Governance",
    description: "Manage identity policies and governance rules",
    icon: Users,
    category: "Identity",
    component: IdentityGovernanceContent,
  },
  {
    id: "identity-mappings",
    title: "Identity Attribute Mappings",
    description: "Configure identity attribute mappings and correlation rules",
    icon: UserCog,
    category: "System",
    component: IdentityAttributeMappingContent,
  },
  {
    id: "integrations",
    title: "System Integrations",
    description: "Configure application and directory connections",
    icon: Zap,
    category: "Integration",
    component: SystemIntegrationsContent,
  },
  {
    id: "lifecycle",
    title: "Lifecycle Management",
    description: "Automate user provisioning and deprovisioning",
    icon: Users,
    category: "Identity",
    component: LifecycleManagementContent,
  },
  {
    id: "login-security",
    title: "Login Security",
    description:
      "Configure password policies, session controls, lockout settings, and authentication security",
    icon: Lock,
    category: "Security",
    component: LoginSecurityForm,
  },
  {
    id: "notification-management",
    title: "Notification Management",
    description: "Configure email server settings and manage email templates",
    icon: Mail,
    category: "System",
    component: NotificationManagement,
  },
  {
    id: "reports-management",
    title: "Reports Management",
    description:
      "Configure report defaults, branding, retention policies, and access permissions",
    icon: FileText,
    category: "System",
    component: ReportsManagement,
  },
  {
    id: "reviews",
    title: "Access Reviews",
    description: "Configure periodic access certifications",
    icon: FileText,
    category: "Governance",
    component: AccessReviewsContent,
  },
  {
    id: "risk",
    title: "Risk Analytics",
    description: "Monitor identity risks and anomalies",
    icon: BarChart,
    category: "Analytics",
    component: RiskAnalyticsContent,
  },
  {
    id: "schema-management",
    title: "Schema Management",
    description:
      "Centrally manage and extend the schema of all core IGA objects",
    icon: Database,
    category: "System",
    component: SchemaManagementContent,
  },
  {
    id: "search-management",
    title: "Search Management",
    description:
      "Configure global search behavior, indexing, and access control",
    icon: Search,
    category: "System",
    component: SearchManagement,
  },
  {
    id: "sso",
    title: "Single Sign-on connections",
    description: "Manage SSO connections",
    icon: Shield,
    category: "Authentication",
    component: SSOConnectionsPage,
  },
];

export const settingsMap = new Map(settingsSections.map((s) => [s.id, s]));
