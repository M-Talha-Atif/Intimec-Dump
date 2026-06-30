import React, { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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
  currentPageSize: number;
  roleId: string;
  tenantId: string;
  success: boolean;
  message: string;
}

interface RoleMembersPopoverProps {
  roleId: string;
  userCount: number;
  children: React.ReactNode;
}

export const RoleMembersPopover: React.FC<RoleMembersPopoverProps> = ({
  roleId,
  userCount,
  children,
}) => {
  const [members, setMembers] = useState<RoleMember[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [manualCount, setManualCount] = useState(0);
  const [dynamicCount, setDynamicCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(
    new Set()
  );

  const fetchMembers = async (
    page = 0,
    size = 10,
    status = "ALL",
    search = ""
  ) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        status,
      });

      if (search) {
        params.append("search", search);
      }

      const response = await fetch(
        `/api/roles/${roleId}/members?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch role members");
      }

      const data: RoleMembersResponse = await response.json();

      if (data.success) {
        setMembers(data.members);
        setTotalCount(data.totalCount);
        setManualCount(data.manualAssignmentCount);
        setDynamicCount(data.dynamicAssignmentCount);
        setCurrentPage(data.page);
        setTotalPages(data.totalPages);
      } else {
        throw new Error(data.message || "Failed to load members");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load role members"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && members.length === 0) {
      fetchMembers(0, pageSize, statusFilter, searchTerm);
    }
  };

  const handlePageSizeChange = (newSize: string) => {
    const size = parseInt(newSize);
    setPageSize(size);
    setCurrentPage(0);
    fetchMembers(0, size, statusFilter, searchTerm);
  };

  const handleStatusChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    setCurrentPage(0);
    fetchMembers(0, pageSize, newStatus, searchTerm);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(0);
    fetchMembers(0, pageSize, statusFilter, value);
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      fetchMembers(newPage, pageSize, statusFilter, searchTerm);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      fetchMembers(newPage, pageSize, statusFilter, searchTerm);
    }
  };

  // Selection handlers
  const toggleMemberSelection = (memberId: string) => {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(memberId)) {
      newSelected.delete(memberId);
    } else {
      newSelected.add(memberId);
    }
    setSelectedMembers(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedMembers.size === members.length) {
      setSelectedMembers(new Set());
    } else {
      setSelectedMembers(new Set(members.map((m) => m.id)));
    }
  };

  const isAllSelected = members.length > 0 && selectedMembers.size === members.length;
  const isPartiallySelected = selectedMembers.size > 0 && selectedMembers.size < members.length;

  // Export functions
  const exportToJSON = (membersToExport: RoleMember[]) => {
    const dataStr = JSON.stringify(membersToExport, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `role-members-${roleId}-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const exportToCSV = (membersToExport: RoleMember[]) => {
    const headers = [
      "id",
      "username",
      "email",
      "firstName",
      "lastName",
      "displayName",
      "status",
      "tenantId",
      "assignmentType",
    ];
    const rows = membersToExport.map((member) =>
      headers.map((header) => {
        const value = member[header as keyof RoleMember];
        if (typeof value === "string" && value.includes(",")) {
          return `"${value}"`;
        }
        return value;
      }).join(",")
    );
    const csvData = `${headers.join(",")}\n${rows.join("\n")}`;
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `role-members-${roleId}-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleExportSelected = (format: "csv" | "json") => {
    const membersToExport = members.filter((m) => selectedMembers.has(m.id));
    if (format === "csv") {
      exportToCSV(membersToExport);
    } else {
      exportToJSON(membersToExport);
    }
  };

  const handleExportAll = (format: "csv" | "json") => {
    if (format === "csv") {
      exportToCSV(members);
    } else {
      exportToJSON(members);
    }
  };

  const getAssignmentTypeBadge = (type: "MANUAL" | "DYNAMIC") => {
    if (type === "MANUAL") {
      return (
        <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 bg-blue-50 text-blue-700 border-blue-200">
          Manual
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 bg-purple-50 text-purple-700 border-purple-200">
        Dynamic
      </Badge>
    );
  };

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <Popover open={open} onOpenChange={handleOpenChange}>
          <PopoverTrigger asChild>
            <TooltipTrigger asChild>
              <div className="cursor-pointer hover:underline inline-flex items-center">
                {children}
              </div>
            </TooltipTrigger>
          </PopoverTrigger>
          <PopoverContent
            className="w-[650px] p-0"
            align="start"
            sideOffset={5}
          >
            <div className="p-3 border-b bg-muted/30">
              <h4 className="font-semibold text-sm">Role Members Overview</h4>
              {!loading && members.length > 0 && (
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-xs text-muted-foreground">
                    {totalCount} total members
                  </p>
                  <span className="text-xs text-muted-foreground">•</span>
                  <p className="text-xs text-blue-600">
                    {manualCount} manual
                  </p>
                  <span className="text-xs text-muted-foreground">•</span>
                  <p className="text-xs text-purple-600">
                    {dynamicCount} dynamic
                  </p>
                </div>
              )}
            </div>

            {/* Filters */}
            <div className="p-3 border-b bg-muted/10 space-y-2">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, username, or email..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="h-8 text-xs pl-8"
                  />
                </div>
                <Select value={statusFilter} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-28 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={pageSize.toString()}
                  onValueChange={handlePageSizeChange}
                >
                  <SelectTrigger className="w-20 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                {/* Export Button */}
                {selectedMembers.size > 0 ? (
                  <DropdownMenu>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="default"
                            size="sm"
                            className="h-8 px-2 bg-primary text-white hover:opacity-95"
                          >
                            <Upload className="h-3.5 w-3.5 mr-1" />
                            ({selectedMembers.size})
                            <ChevronDown className="h-3.5 w-3.5 ml-1" />
                          </Button>
                        </DropdownMenuTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Export selected members</p>
                      </TooltipContent>
                    </Tooltip>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleExportSelected("csv")}
                      >
                        <Upload className="h-3.5 w-3.5 mr-2" />
                        CSV
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleExportSelected("json")}
                      >
                        <Upload className="h-3.5 w-3.5 mr-2" />
                        JSON
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <DropdownMenu>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="h-8 px-2">
                            <Upload className="h-3.5 w-3.5" />
                            <ChevronDown className="h-3.5 w-3.5 ml-1" />
                          </Button>
                        </DropdownMenuTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Export page</p>
                      </TooltipContent>
                    </Tooltip>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleExportAll("csv")}>
                        <Upload className="h-3.5 w-3.5 mr-2" />
                        CSV
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExportAll("json")}>
                        <Upload className="h-3.5 w-3.5 mr-2" />
                        JSON
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>

            {loading && (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}

            {error && (
              <div className="p-4 text-sm text-destructive">
                <p>{error}</p>
              </div>
            )}

            {!loading && !error && members.length > 0 && (
              <>
                <ScrollArea className="h-[320px]">
                  <div className="p-3">
                    <div className="border rounded-md overflow-hidden">
                      <table className="w-full text-xs">
                        <thead className="bg-muted/50 sticky top-0">
                          <tr>
                            <th className="text-center p-2 font-medium text-[11px] w-10">
                              <Checkbox
                                checked={isAllSelected}
                                onCheckedChange={toggleSelectAll}
                                className="h-3.5 w-3.5"
                                aria-label="Select all members"
                              />
                            </th>
                            <th className="text-left p-2 font-medium text-[11px]">
                              Display Name
                            </th>
                            <th className="text-left p-2 font-medium text-[11px]">
                              User ID
                            </th>
                            <th className="text-left p-2 font-medium text-[11px]">
                              Assignment Type
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {members.map((member, idx) => (
                            <tr
                              key={member.id}
                              className={cn(
                                "border-t hover:bg-muted/30 transition-colors",
                                idx % 2 === 0 ? "bg-background" : "bg-muted/20"
                              )}
                            >
                              <td className="p-2 text-center">
                                <Checkbox
                                  checked={selectedMembers.has(member.id)}
                                  onCheckedChange={() =>
                                    toggleMemberSelection(member.id)
                                  }
                                  className="h-3.5 w-3.5"
                                  aria-label={`Select ${member.displayName || member.username}`}
                                />
                              </td>
                              <td className="p-2 text-[11px]">
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {member.displayName ||
                                      `${member.firstName} ${member.lastName}`}
                                  </span>
                                  <span className="text-muted-foreground text-[10px]">
                                    {member.username}
                                  </span>
                                </div>
                              </td>
                              <td className="p-2 text-[11px] font-mono text-muted-foreground">
                                {member.id}
                              </td>
                              <td className="p-2 text-[11px]">
                                {getAssignmentTypeBadge(member.assignmentType)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </ScrollArea>

                {/* Pagination */}
                <div className="p-3 border-t bg-muted/10 flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    Page {currentPage + 1} of {totalPages} ({members.length} of{" "}
                    {totalCount} members)
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePreviousPage}
                      disabled={currentPage === 0}
                      className="px-2 py-1 text-xs border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage >= totalPages - 1}
                      className="px-2 py-1 text-xs border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}

            {!loading && !error && members.length === 0 && (
              <div className="p-8 text-sm text-muted-foreground text-center">
                {searchTerm || statusFilter !== "ALL"
                  ? "No members found matching your filters"
                  : "No members assigned to this role"}
              </div>
            )}
          </PopoverContent>
        </Popover>
        <TooltipContent side="top" className="max-w-xs">
          <p className="text-xs">Click to view role members</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
