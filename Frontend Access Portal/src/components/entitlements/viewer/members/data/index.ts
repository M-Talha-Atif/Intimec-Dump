import type { Member } from "../types";

export const MOCK_MEMBERS: Member[] = [
  {
    id: "1",
    name: "John Smith",
    email: "john.smith@company.com",
    source: "Direct",
    path: "Direct Assignment",
    status: "Active",
    assignedOn: "6/10/2025",
    expiresOn: "1/1/2026",
    risk: "HIGH",
  },
  {
    id: "2",
    name: "Jane Doe",
    email: "jane.doe@company.com",
    source: "Role",
    path: "Domain Administrator",
    status: "Active",
    assignedOn: "5/15/2025",
    expiresOn: "Never",
    risk: "MEDIUM",
  },
  {
    id: "3",
    name: "Bob Wilson",
    email: "bob.wilson@company.com",
    source: "Group",
    path: "IT Admins +1 more",
    status: "Active",
    assignedOn: "4/20/2025",
    expiresOn: "Never",
    risk: "LOW",
  },
  {
    id: "4",
    name: "Alice Johnson",
    email: "alice.johnson@company.com",
    source: "Policy",
    path: "Security Policy",
    status: "Disabled",
    assignedOn: "3/1/2025",
    expiresOn: "12/31/2025",
    risk: "MEDIUM",
  },
  {
    id: "5",
    name: "Mike Brown",
    email: "mike.brown@company.com",
    source: "Direct",
    path: "Direct Assignment",
    status: "Out-of-scope",
    assignedOn: "2/15/2025",
    expiresOn: "Never",
    risk: "LOW",
  },
];

export const SOURCE_OPTIONS = [
  { value: "All Sources", label: "All Sources" },
  { value: "Direct", label: "Direct" },
  { value: "Role", label: "Role" },
  { value: "Group", label: "Group" },
  { value: "Policy", label: "Policy" },
];

export const RISK_OPTIONS = [
  { value: "All Risk", label: "All Risk" },
  { value: "HIGH", label: "High" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LOW", label: "Low" },
];

export const STATUS_OPTIONS = [
  { value: "All Status", label: "All Status" },
  { value: "Active", label: "Active" },
  { value: "Disabled", label: "Disabled" },
  { value: "Out-of-scope", label: "Out-of-scope" },
];

export const DEFAULT_FILTERS = {
  search: "",
  source: "All Sources",
  risk: "All Risk",
  status: "All Status",
};
