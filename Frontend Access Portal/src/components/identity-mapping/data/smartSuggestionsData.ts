export interface Issue {
  id: string;
  type: "error" | "warning" | "info";
  title: string;
  description: string;
  mappingId: string;
  severity: "high" | "medium" | "low";
}

export const issues: Issue[] = [
  {
    id: "1",
    type: "warning",
    title: "Untransformed Email Values",
    description: "Email attributes should use lowercase transformation",
    mappingId: "2",
    severity: "medium",
  },
  {
    id: "2",
    type: "error",
    title: "Type Mismatch",
    description: "String attribute mapped to number field",
    mappingId: "1",
    severity: "high",
  },
];
