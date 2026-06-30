export interface AISuggestion {
  id: string;
  sourceAttribute: string;
  targetAttribute: string;
  transformation: string;
  confidence: number;
  reasoning: string;
  source: string;
  priority: number;
}

export const generateMockSuggestions = (sourceName: string): AISuggestion[] => [
  {
    id: "1",
    sourceAttribute: "sAMAccountName",
    targetAttribute: "username",
    transformation: "toLowerCase",
    confidence: 95,
    reasoning: "Strong name similarity and common AD pattern",
    source: sourceName || "Active Directory",
    priority: 1,
  },
  {
    id: "2",
    sourceAttribute: "mail",
    targetAttribute: "email",
    transformation: "trim",
    confidence: 98,
    reasoning: "Direct attribute match with high confidence",
    source: sourceName || "Active Directory",
    priority: 2,
  },
  {
    id: "3",
    sourceAttribute: "displayName",
    targetAttribute: "fullName",
    transformation: "trim",
    confidence: 90,
    reasoning: "Display name commonly maps to full name",
    source: sourceName || "Active Directory",
    priority: 3,
  },
  {
    id: "4",
    sourceAttribute: "memberOf",
    targetAttribute: "groups",
    transformation: "script",
    confidence: 85,
    reasoning: "Group membership requires array transformation",
    source: sourceName || "Active Directory",
    priority: 4,
  },
];
