export interface Member {
  id: string;
  name: string;
  email: string;
  source: "Direct" | "Role" | "Group" | "Policy";
  path: string;
  status: "Active" | "Disabled" | "Out-of-scope";
  assignedOn: string;
  expiresOn: string;
  risk: "HIGH" | "MEDIUM" | "LOW";
}

export interface MemberFilters {
  search: string;
  source: string;
  risk: string;
  status: string;
}

export interface MembersTableProps {
  members: Member[];
  onViewMember: (member: Member) => void;
}

export interface MemberRowProps {
  member: Member;
  onViewMember: (member: Member) => void;
}

export interface MemberFiltersProps {
  filters: MemberFilters;
  onFiltersChange: (filters: MemberFilters) => void;
  onExport: () => void;
}
