export type AiStatus = "AI Analyzed" | "AI Pending";
export type ApplicationSource = "authoritative" | "non-authoritative";
export type ConnectionStatus = "Connected" | "Connection Problem" | "Offline";
export type ApplicationStatus = "ACTIVE" | "INACTIVE";

export type RiskLevel = "Low" | "Medium" | "High";

export type Application = {
  id: string;
  name: string;
  category: string;
  users: number;
  orphan: boolean;
  orphanCount: number;
  risky: boolean;
  riskyCount: number;
  riskLevel: RiskLevel;
  authoritative: boolean;
  flows: number;
  connectionStatus: ConnectionStatus;
  aiStatus: AiStatus;
  status: ApplicationStatus;
  lastSyncAccounts: string;
  lastSyncEntitlements: string;
  createdAt: string;
  iconPath?: string;
};

export type ApplicationOverview = {
  extraData: string;
};
