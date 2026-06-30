import { Users, Bot, Building } from "lucide-react";
import { IdentityType } from "../data/identity-mapping";

// API Types
export interface IdentitySchemaContext {
  schemaId: string;
  schemaName: string;
}

export const getIdentityTypeIcon = (type: IdentityType) => {
  switch (type) {
    case "employee":
      return Users;
    case "non-human":
      return Bot;
    case "non-employee":
      return Building;
  }
};

export const getIdentityTypeLabel = (type: IdentityType) => {
  switch (type) {
    case "employee":
      return "Employee Identities";
    case "non-human":
      return "Non-Human Identities";
    case "non-employee":
      return "Non-Employee Identities";
  }
};

export const isValidIdentityType = (type: string): type is IdentityType => {
  return ["employee", "non-human", "non-employee"].includes(type);
};
