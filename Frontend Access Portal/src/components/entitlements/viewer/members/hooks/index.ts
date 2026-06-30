import { useState, useMemo } from "react";
import type { Member, MemberFilters } from "../types";
import { DEFAULT_FILTERS, MOCK_MEMBERS } from "../data";
import { applyMemberFilters } from "../utils";

export const useMembersViewer = () => {
  const [filters, setFilters] = useState<MemberFilters>(DEFAULT_FILTERS);

  // Apply filters to members
  const filteredMembers = useMemo(() => {
    return applyMemberFilters(MOCK_MEMBERS, filters);
  }, [filters]);

  const handleFiltersChange = (newFilters: MemberFilters) => {
    setFilters(newFilters);
  };

  const handleSearchChange = (search: string) => {
    setFilters((prev) => ({ ...prev, search }));
  };

  const handleSourceChange = (source: string) => {
    setFilters((prev) => ({ ...prev, source }));
  };

  const handleRiskChange = (risk: string) => {
    setFilters((prev) => ({ ...prev, risk }));
  };

  const handleStatusChange = (status: string) => {
    setFilters((prev) => ({ ...prev, status }));
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log("Exporting members data...", filteredMembers);
  };

  const handleViewMember = (member: Member) => {
    // TODO: Implement view member functionality
    console.log("Viewing member:", member);
  };

  return {
    filters,
    filteredMembers,
    handleFiltersChange,
    handleSearchChange,
    handleSourceChange,
    handleRiskChange,
    handleStatusChange,
    handleExport,
    handleViewMember,
  };
};
