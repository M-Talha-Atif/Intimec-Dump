"use client";
import React, { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Loader } from "../ui/Loader";

interface RoleSelectorProps<T extends { allowedRoles: string[] }> {
  formData: T;
  setFormData: React.Dispatch<React.SetStateAction<T>>;
}

interface ApiRole {
  id: string;
  roleName: string;
  roleType: string;
  isActive: boolean;
}

interface RolesApiResponse {
  data: ApiRole[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
  pageSize: number;
  message: string;
  status: string;
}

export default function RoleSelector<T extends { allowedRoles: string[] }>({
  formData,
  setFormData,
}: RoleSelectorProps<T>) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [roles, setRoles] = useState<ApiRole[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // ✅ NEW: Cache to store all selected roles permanently
  const [selectedRolesCache, setSelectedRolesCache] = useState<Map<string, ApiRole>>(new Map());

  // Fetch roles with pagination and search
  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("size", String(pageSize));

      if (search) {
        params.append("search", search);
      }

      const res = await fetch(`/api/access-portal/roles?${params.toString()}`);

      if (!res.ok) {
        throw new Error(`Failed: ${res.status}`);
      }

      const json: RolesApiResponse = await res.json();

      setRoles(json.data ?? []);
      setTotalPages(json.totalPages ?? 0);
      
      // ✅ Update cache with newly fetched roles
      const newCache = new Map(selectedRolesCache);
      (json.data ?? []).forEach(role => {
        if (formData.allowedRoles.includes(role.id)) {
          newCache.set(role.id, role);
        }
      });
      setSelectedRolesCache(newCache);
    } catch (err) {
      console.error("Failed to fetch roles", err);
      setRoles([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, formData.allowedRoles, selectedRolesCache]);

  // Fetch on mount and when page/search changes
  React.useEffect(() => {
    fetchRoles();
  }, [page, search]); // ✅ Removed fetchRoles from deps to avoid infinite loop

  // Reset to page 0 when search changes
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(0);
  };

  // Add role by ID (not name)
  const addRole = (role: ApiRole) => {
    if (!formData.allowedRoles.includes(role.id)) {
      // ✅ Add to cache when selected
      setSelectedRolesCache(prev => new Map(prev).set(role.id, role));
      
      setFormData({
        ...formData,
        allowedRoles: [...formData.allowedRoles, role.id],
      });
    }
  };

  // Remove role by ID
  const removeRole = (roleId: string) => {
    // ✅ Keep in cache even when removed (optional - you can remove this line if you want to clear cache)
    // setSelectedRolesCache(prev => {
    //   const newCache = new Map(prev);
    //   newCache.delete(roleId);
    //   return newCache;
    // });
    
    setFormData({
      ...formData,
      allowedRoles: formData.allowedRoles.filter((id) => id !== roleId),
    });
  };

  // ✅ Get role name from cache first, then from current page
  const getRoleName = (roleId: string): string => {
    // Check cache first
    const cachedRole = selectedRolesCache.get(roleId);
    if (cachedRole) {
      return cachedRole.roleName;
    }
    
    // Fallback to current page roles
    const role = roles.find((r) => r.id === roleId);
    return role?.roleName || roleId;
  };

  const showLoadingBadges = loading && formData.allowedRoles.length > 0 && roles.length === 0;

  return (
    <div>
      <label className="text-sm font-medium">Allowed Roles</label>

      {/* Selected Roles */}
      <div className="flex flex-wrap gap-2 mb-2 min-h-[32px]">
        {showLoadingBadges ? (
          formData.allowedRoles.map((roleId) => (
            <div key={roleId} className="h-6 w-24 bg-gray-200 animate-pulse rounded-md" />
          ))
        ) : (
          formData.allowedRoles.map((roleId) => {
            const roleName = getRoleName(roleId);

            return (
              <Badge key={roleId} variant="secondary" className="flex items-center gap-1">
                <span>{roleName}</span>
                <button
                  onClick={() => removeRole(roleId)}
                  className="ml-1 hover:text-destructive"
                  type="button"
                >
                  ×
                </button>
              </Badge>
            );
          })
        )}

        {!loading && formData.allowedRoles.length === 0 && (
          <span className="text-sm text-muted-foreground">No roles selected</span>
        )}
      </div>

      {/* Dropdown for Roles */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Select Role</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64" side="bottom" align="start">
          {/* Search */}
          <Input
            placeholder="Search roles..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="mb-2"
          />

          {loading && (
            <div className="flex items-center justify-center h-10 mt-8">
              <Loader size="sm" />
            </div>
          )}

          {!loading && roles.length === 0 && (
            <div className="px-2 py-2 text-sm text-muted-foreground">No roles found</div>
          )}

          {/* Role List */}
          {!loading &&
            roles.map((role) => (
              <DropdownMenuItem
                key={role.id}
                onSelect={() => addRole(role)}
                disabled={!role.isActive}
                className="flex flex-col items-start gap-1.5 rounded-md px-3 py-2 focus:bg-accent"
              >
                {/* Role Name */}
                <span className="text-sm font-semibold text-foreground leading-none">
                  {role.roleName}
                </span>
                {/* Role Meta */}
                <div className="flex items-center gap-1.5">
                  <Badge
                    variant="outline"
                    className="px-2 py-0 !text-[8px] !font-medium leading-4"
                  >
                    {role.roleType.charAt(0).toUpperCase() +
                      role.roleType.slice(1).toLowerCase()}
                  </Badge>
                  <Badge
                    variant={role.isActive ? "default" : "secondary"}
                    className="px-2 py-0 !text-[8px] !font-medium leading-4"
                  >
                    {role.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </DropdownMenuItem>
            ))}

          {/* Pagination */}
          {!loading && roles.length > 0 && (
            <div className="flex justify-between items-center mt-2 px-1 pt-2 border-t">
              <Button
                size="sm"
                variant="outline"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="text-xs text-muted-foreground">
                Page {page + 1} of {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}