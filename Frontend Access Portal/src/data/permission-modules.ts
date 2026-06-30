
import { ModuleGroup } from '@/types/permissions';

export const permissionModules: ModuleGroup[] = [
  {
    group: "Core Management",
    modules: [
      { moduleId: "dashboard", label: "Dashboard", group: "Core Management", actions: ["view", "export", "configure"] },
      { moduleId: "applications", label: "Applications", group: "Core Management", actions: ["view", "create", "edit", "delete", "configure", "api"] },
      { moduleId: "identities", label: "Identities", group: "Core Management", actions: ["view", "create", "edit", "delete", "export", "api"] },
      { moduleId: "access-catalog", label: "Access Catalog", group: "Core Management", actions: ["view", "create", "edit", "delete", "approve"] },
      { moduleId: "organizations", label: "Organizations", group: "Core Management", actions: ["view", "create", "edit", "delete", "configure"] },
      { moduleId: "lifecycle", label: "Lifecycle", group: "Core Management", actions: ["view", "configure", "approve"] }
    ]
  },
  {
    group: "Security & Access",
    modules: [
      { moduleId: "access-portal", label: "Access Portal", group: "Security & Access", actions: ["view", "create", "approve", "configure"] },
      { moduleId: "access-review", label: "Access Review", group: "Security & Access", actions: ["view", "create", "approve", "export"] },
      { moduleId: "workflows", label: "Workflows", group: "Security & Access", actions: ["view", "create", "edit", "delete", "approve", "configure"] },
      { moduleId: "sod-policies", label: "SoD Policies", group: "Security & Access", actions: ["view", "create", "edit", "delete", "configure"] }
    ]
  },
  {
    group: "Monitoring & Analytics",
    modules: [
      { moduleId: "task-center", label: "Task Center", group: "Monitoring & Analytics", actions: ["view", "create", "approve", "configure"] },
      { moduleId: "monitoring", label: "Monitoring", group: "Monitoring & Analytics", actions: ["view", "configure"] },
      { moduleId: "access-analysis", label: "Access Analysis", group: "Monitoring & Analytics", actions: ["view", "export", "configure"] },
      { moduleId: "risk-analytics", label: "Risk Analytics", group: "Monitoring & Analytics", actions: ["view", "export", "configure"] },
      { moduleId: "security-alerts", label: "Security Alerts", group: "Monitoring & Analytics", actions: ["view", "configure"] },
      { moduleId: "reports", label: "Reports", group: "Monitoring & Analytics", actions: ["view", "create", "export", "configure"] },
      { moduleId: "debugging", label: "Debugging", group: "Monitoring & Analytics", actions: ["view", "configure"] },
      { moduleId: "audit-logs", label: "Audit Logs", group: "Monitoring & Analytics", actions: ["view", "export"] }
    ]
  },
  {
    group: "System",
    modules: [
      { moduleId: "settings", label: "Settings", group: "System", actions: ["view", "edit", "configure", "api"] }
    ]
  }
];

export const defaultActions = ["view", "create", "edit", "delete", "approve", "export", "configure", "api"];
