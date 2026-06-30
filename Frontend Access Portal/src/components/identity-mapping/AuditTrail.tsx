"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IdentityType } from "./data/identity-mapping";
import { useAuditTrail } from "./hooks/useAuditTrail";
import {
  AuditTrailHeader,
  AuditStats,
  AuditFilters,
  AuditTable,
  AuditDetailSheet,
} from "./components/audit-trail";

interface AuditTrailProps {
  identityType: IdentityType;
}

export const AuditTrail = ({ identityType }: AuditTrailProps) => {
  const {
    searchTerm,
    timeFilter,
    actionFilter,
    userFilter,
    auditEntries,
    filteredEntries,
    uniqueUsers,
    selectedEntry,
    setSearchTerm,
    setTimeFilter,
    setActionFilter,
    setUserFilter,
    viewDetails,
    closeDetails,
    handleExport,
  } = useAuditTrail(identityType);

  return (
    <div className="space-y-6">
      <AuditDetailSheet entry={selectedEntry} onClose={closeDetails} />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>
              Audit Trail for {identityType} Identity Mappings
            </CardTitle>
            <CardDescription>
              Complete audit log of all mapping changes, user actions, and
              system events
            </CardDescription>
          </div>
          <AuditTrailHeader onExport={handleExport} />
        </CardHeader>
        <CardContent>
          <AuditFilters
            searchTerm={searchTerm}
            timeFilter={timeFilter}
            actionFilter={actionFilter}
            userFilter={userFilter}
            uniqueUsers={uniqueUsers}
            onSearchChange={setSearchTerm}
            onTimeFilterChange={setTimeFilter}
            onActionFilterChange={setActionFilter}
            onUserFilterChange={setUserFilter}
          />

          <AuditStats auditEntries={filteredEntries} />

          <Card>
            <CardHeader>
              <CardTitle>Audit Entries</CardTitle>
              <CardDescription>
                Showing {filteredEntries.length} of {auditEntries.length} audit
                entries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AuditTable
                auditEntries={filteredEntries}
                onViewDetails={viewDetails}
              />
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};
