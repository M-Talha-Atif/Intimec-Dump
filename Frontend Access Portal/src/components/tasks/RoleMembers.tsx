"use client";

import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

import { Loader2, Search, Upload, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoleMember {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  status: string;
  tenantId: string;
  assignmentType: "MANUAL" | "DYNAMIC";
}

interface RoleMembersResponse {
  members: RoleMember[];
  totalCount: number;
  manualAssignmentCount: number;
  dynamicAssignmentCount: number;
  page: number;
  size: number;
  totalPages: number;
  success: boolean;
}

interface Props {
  roleId: string;
}

export const RoleMembers: React.FC<Props> = ({ roleId }) => {

  const [members, setMembers] = useState<RoleMember[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [manualCount, setManualCount] = useState(0);
  const [dynamicCount, setDynamicCount] = useState(0);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());

  const fetchMembers = async (
    p = page,
    size = pageSize,
    status = statusFilter,
    search = searchTerm
  ) => {

    setLoading(true);

    try {

      const params = new URLSearchParams({
        page: p.toString(),
        size: size.toString(),
        status
      });

      if (search) params.append("search", search);

      const res = await fetch(`/api/roles/${roleId}/members?${params}`);

      if (!res.ok) throw new Error("Failed to fetch members");

      const data: RoleMembersResponse = await res.json();

      if (data.success) {
        setMembers(data.members);
        setTotalCount(data.totalCount);
        setManualCount(data.manualAssignmentCount);
        setDynamicCount(data.dynamicAssignmentCount);
        setPage(data.page);
        setTotalPages(data.totalPages);
      }

    } catch (err) {
      setError("Failed to load members");
    } finally {
      setLoading(false);
    }

  };

  useEffect(() => {
    fetchMembers(0);
  }, [roleId]);

  const toggleMember = (id: string) => {
    const newSet = new Set(selectedMembers);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setSelectedMembers(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedMembers.size === members.length) {
      setSelectedMembers(new Set());
    } else {
      setSelectedMembers(new Set(members.map(m => m.id)));
    }
  };

  const getAssignmentBadge = (type: "MANUAL" | "DYNAMIC") => {
    if (type === "MANUAL")
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 text-[10px]">
          Manual
        </Badge>
      );

    return (
      <Badge variant="outline" className="bg-purple-50 text-purple-700 text-[10px]">
        Dynamic
      </Badge>
    );
  };

  return (
    <div className="flex flex-col h-full min-h-0 space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">

        <div className="text-sm text-muted-foreground">
          {totalCount} members • {manualCount} manual • {dynamicCount} dynamic
        </div>

        {selectedMembers.size > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm">
                <Upload className="h-3.5 w-3.5 mr-1" />
                Export ({selectedMembers.size})
                <ChevronDown className="h-3.5 w-3.5 ml-1" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent>
              <DropdownMenuItem>Export CSV</DropdownMenuItem>
              <DropdownMenuItem>Export JSON</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">

        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              fetchMembers(0, pageSize, statusFilter, e.target.value);
            }}
            className="pl-8 h-8"
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v);
            fetchMembers(0, pageSize, v, searchTerm);
          }}
        >
          <SelectTrigger className="w-28 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="INACTIVE">Inactive</SelectItem>
          </SelectContent>
        </Select>

      </div>

      {/* Table */}
      <div className="border rounded-md overflow-hidden flex-1 min-h-0">

        {loading && (
          <div className="flex justify-center p-10">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}

        {!loading && (
          <div className="flex-1 overflow-auto">

            <table className="w-full text-xs">

              <thead className="bg-muted/40 sticky top-0 z-10">
                <tr>
                  <th className="p-2 w-10">
                    <Checkbox
                      checked={members.length > 0 && selectedMembers.size === members.length}
                      onCheckedChange={toggleSelectAll}
                    />
                  </th>

                  <th className="p-2 text-left">User</th>
                  <th className="p-2 text-left">User ID</th>
                  <th className="p-2 text-left">Assignment</th>
                </tr>
              </thead>

              <tbody>
                {members.map((m, i) => (
                  <tr
                    key={m.id}
                    className={cn(
                      "border-t hover:bg-muted/30",
                      i % 2 === 0 ? "bg-background" : "bg-muted/10"
                    )}
                  >
                    <td className="p-2">
                      <Checkbox
                        checked={selectedMembers.has(m.id)}
                        onCheckedChange={() => toggleMember(m.id)}
                      />
                    </td>

                    <td className="p-2">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {m.displayName || `${m.firstName} ${m.lastName}`}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {m.username}
                        </span>
                      </div>
                    </td>

                    <td className="p-2 font-mono text-muted-foreground">
                      {m.id}
                    </td>

                    <td className="p-2">
                      {getAssignmentBadge(m.assignmentType)}
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
};