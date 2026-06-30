import { Users, Bot, Building } from "lucide-react";

export type IdentityType = "employee" | "non-human" | "non-employee";

export interface MappingStats {
  activeMappings: number;
  transformationRules: number;
  dataSources: number;
  conflictsResolved: number;
}

export const DEFAULT_MAPPING_STATS: MappingStats = {
  activeMappings: 0,
  transformationRules: 0,
  dataSources: 0,
  conflictsResolved: 0,
};

export interface IdentityTypeConfig {
  value: IdentityType;
  label: string;
  icon: typeof Users | typeof Bot | typeof Building;
}

export interface IdentityStatistic {
  label: string;
  value: string;
  trend: string;
  color: string;
}

export const identityTypes: IdentityTypeConfig[] = [
  {
    value: "employee",
    label: "Employee Identities",
    icon: Users,
  },
  {
    value: "non-human",
    label: "Non-Human Identities",
    icon: Bot,
  },
  {
    value: "non-employee",
    label: "Non-Employee Identities",
    icon: Building,
  },
];

export const identityStatistics: Record<IdentityType, IdentityStatistic[]> = {
  employee: [
    {
      label: "Active Mappings",
      value: "247",
      trend: "+15",
      color: "text-blue-600",
    },
    {
      label: "Transformation Rules",
      value: "89",
      trend: "+7",
      color: "text-green-600",
    },
    {
      label: "Data Sources",
      value: "5",
      trend: "±0",
      color: "text-purple-600",
    },
    {
      label: "Conflicts Resolved",
      value: "156",
      trend: "+23",
      color: "text-orange-600",
    },
  ],
  "non-human": [
    {
      label: "Active Mappings",
      value: "128",
      trend: "+8",
      color: "text-blue-600",
    },
    {
      label: "Transformation Rules",
      value: "45",
      trend: "+3",
      color: "text-green-600",
    },
    {
      label: "Data Sources",
      value: "7",
      trend: "+1",
      color: "text-purple-600",
    },
    {
      label: "Conflicts Resolved",
      value: "67",
      trend: "+12",
      color: "text-orange-600",
    },
  ],
  "non-employee": [
    {
      label: "Active Mappings",
      value: "89",
      trend: "+5",
      color: "text-blue-600",
    },
    {
      label: "Transformation Rules",
      value: "32",
      trend: "+2",
      color: "text-green-600",
    },
    {
      label: "Data Sources",
      value: "4",
      trend: "±0",
      color: "text-purple-600",
    },
    {
      label: "Conflicts Resolved",
      value: "34",
      trend: "+8",
      color: "text-orange-600",
    },
  ],
};
