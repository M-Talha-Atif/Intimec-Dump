export type RiskLevel = "Low" | "Medium" | "High";
export type IdentityType = "Employee" | "Non-Employee" | "Non-Human";

export type SortingState = {
  sortBy: string;
  direction: "asc" | "desc";
};
