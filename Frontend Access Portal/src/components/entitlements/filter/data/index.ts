export const REQUESTABLE_OPTIONS = [
  { value: "all", label: "All", id: "r-all" },
  { value: "yes", label: "Only Requestable", id: "r-yes" },
  { value: "no", label: "Not Requestable", id: "r-no" },
];

export const OWNERSHIP_OPTIONS = [
  { value: "all", label: "All", id: "o-all" },
  { value: "owned", label: "Owned", id: "o-owned" },
  { value: "unowned", label: "Unowned", id: "o-unowned" },
];

export const GOVERNANCE_OPTIONS = ["orphaned", "unclassified", "critical"];

export const CLASSIFICATION_OPTIONS = ["High Risk", "PII", "GDPR", "SOX"];

export const ENTITLEMENT_TYPE_OPTIONS = [
  "Group",
  "Role",
  "Responsibility",
  "Policy",
  "Permission",
];

export const DEFAULT_FILTERS = {
  ownership: "all",
  governance: [],
  requestable: "all",
  classification: [],
  entitlementType: [],
};
