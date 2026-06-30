"use client";
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  Shield, AlertTriangle, Clock, Download,
  Eye, Edit, Trash2, Plus, FileText, Users, Lock, KeyRound, ArrowLeft
} from 'lucide-react';
import { fetchMyInternalRoles, InternalRole } from '@/services/responsibilities';
import { format } from 'date-fns';
import PageHeader from '@/components/shared/PageHeader';
import { ListControlsCard } from "@/components/shared/ListControlsCard";
import { InternalRoleDetailsSheet } from '../components/InternalRoleDetailsSheet';

const getRoleTypeLabel = (roleType: string) => {
  const labels: Record<string, string> = {
    SYSTEM: "System",
    ADMINISTRATOR: "Administrator",
    REVIEWER: "Reviewer",
    OPERATOR: "Operator",
    VIEWER: "Viewer",
  };
  return labels[roleType] || roleType;
};

const getRoleTypeVariant = (roleType: string) => {
  const variants: Record<string, any> = {
    SYSTEM: "destructive",
    ADMINISTRATOR: "default",
    REVIEWER: "secondary",
    OPERATOR: "outline",
    VIEWER: "secondary",
  };
  return variants[roleType] || "outline";
};

export const InternalRolesIndex = () => {
  const [roleTypeFilter, setRoleTypeFilter] = useState("all");
  const [selectedRole, setSelectedRole] = useState<InternalRole | null>(null);
  const [search, setSearch] = useState("");

  const { data: roles, isLoading } = useQuery({
    queryKey: ["internalRoles"],
    queryFn: fetchMyInternalRoles,
  });

  // Close panel handler
  const handleClosePanel = () => {
    setSelectedRole(null);
  };

  const filteredRoles = roles?.filter((role) => {
    const matchesSearch = role.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = roleTypeFilter === "all" || role.roleType === roleTypeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 p-6">

      {/* Header */}
      <PageHeader
        title="Internal & System Roles"
        description="Platform and connector-specific administrative roles"
        icon={<Shield className="h-6 w-6 text-primary" />}
        actions={
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        }
      />

      {/* Controls */}
      <ListControlsCard
        title="Internal Roles"
        totalItems={filteredRoles?.length || 0}
        displayCount={filteredRoles?.length || 0}
        itemLabel="roles"
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search internal roles..."
        searchTooltip="Search by role name"
        filters={[
          {
            key: "type",
            placeholder: "All Role Types",
            tooltip: "Filter by role type",
            options: [
              { label: "All Role Types", value: "all" },
              { label: "System", value: "SYSTEM" },
              { label: "Administrator", value: "ADMINISTRATOR" },
              { label: "Reviewer", value: "REVIEWER" },
              { label: "Operator", value: "OPERATOR" },
              { label: "Viewer", value: "VIEWER" },
            ],
          },
        ]}
        filterValues={{ type: roleTypeFilter }}
        onFilterChange={(key, value) => {
          if (key === "type") setRoleTypeFilter(value);
        }}
        pageSize={10}
        pageSizeLabel='Internal Roles per page:'
        onPageSizeChange={() => { }}
      />

      {/* Roles */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRoles?.map((role) => (
            <Card
              key={role.id}
              className={`transition hover:shadow-sm ${role.isCritical ? "border-l-4 border-l-red-500" : ""
                }`}
            >
              <CardContent className="p-5 space-y-3">

                <div className="flex items-start justify-between gap-4">

                  <div className="flex items-start gap-3 flex-1">

                    <div
                      className={`p-2 rounded-md ${role.isCritical
                        ? "bg-red-100 dark:bg-red-950"
                        : "bg-primary/10"
                        }`}
                    >
                      <Shield className="h-5 w-5 text-primary" />
                    </div>

                    <div className="flex-1 space-y-2">

                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold">{role.name}</h3>

                        <Badge variant={getRoleTypeVariant(role.roleType)}>
                          {getRoleTypeLabel(role.roleType)}
                        </Badge>

                        {role.isCritical && (
                          <Badge variant="destructive" className="gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Critical
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Lock className="h-3.5 w-3.5" />
                          {role.permissions.length} permissions
                        </span>

                        {role.userCount && (
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {role.userCount} users
                          </span>
                        )}

                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {format(new Date(role.lastModified), "MMM dd yyyy")}
                        </span>
                      </div>

                      {/* Permissions preview */}
                      <div className="flex flex-wrap gap-2">
                        {role.permissions.slice(0, 5).map((p, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {p}
                          </Badge>
                        ))}

                        {role.permissions.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{role.permissions.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedRole(role)}
                    className="gap-2"
                  >
                    View Details
                  </Button>

                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Sheet Panel */}
      <InternalRoleDetailsSheet
        role={selectedRole}
        open={!!selectedRole}
        onClose={() => setSelectedRole(null)}
        getRoleTypeVariant={getRoleTypeVariant}
        getRoleTypeLabel={getRoleTypeLabel}
      />

    </div>
  );
};