
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIdentityDetail } from "@/contexts/IdentityDetailContext";
import { identityToEmployee, type EmployeeData } from '@/utils/identityDataTransforms';
import useIdentities from '@/hooks/identities/useIdentities';
import { Loader2 } from 'lucide-react';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Clock, 
  User,
  Shield,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const statusColors = {
  'Active': 'bg-green-100 text-green-800',
  'Probation': 'bg-yellow-100 text-yellow-800',
  'On Leave': 'bg-purple-100 text-purple-800',
  'Terminating': 'bg-orange-100 text-orange-800',
  'Terminated': 'bg-red-100 text-red-800',
  'Suspended': 'bg-red-100 text-red-800',
  'Stale': 'bg-gray-100 text-gray-800'
};

const riskColors = {
  'Low': 'bg-blue-100 text-blue-800',
  'Medium': 'bg-yellow-100 text-yellow-800',
  'High': 'bg-red-100 text-red-800'
};

const typeColors = {
  'Full-Time': 'bg-green-100 text-green-800',
  'Part-Time': 'bg-blue-100 text-blue-800',
  'Contract': 'bg-orange-100 text-orange-800',
  'Contractor': 'bg-orange-100 text-orange-800',
  'Other': 'bg-purple-100 text-purple-800'
};

const PAGE_SIZE_OPTIONS = [20, 50, 100];

export function Directory() {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const { setSelectedUser } = useIdentityDetail();

  // Debounce search input by 350ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(0); // reset to first page on new search
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Reset page when filters change
  const handleStatusChange = useCallback((val: string) => {
    setStatusFilter(val === 'all' ? '' : val);
    setPage(0);
  }, []);

  const handleDepartmentChange = useCallback((val: string) => {
    setDepartmentFilter(val === 'all' ? '' : val);
    setPage(0);
  }, []);

  const handleSizeChange = useCallback((val: string) => {
    setSize(Number(val));
    setPage(0);
  }, []);

  // Fetch from backend with server-side filters + pagination
  const { data: identities, isLoading, error, pagination, refresh } = useIdentities('employee', {
    page,
    size,
    sort: 'createdAt,desc',
    search: debouncedSearch,
    status: statusFilter,
    department: departmentFilter,
  });

  const employees = useMemo(() => identities.map(identityToEmployee), [identities]);

  // Pagination calculations
  const { totalElements, totalPages } = pagination;
  const firstItem = totalElements === 0 ? 0 : page * size + 1;
  const lastItem = Math.min((page + 1) * size, totalElements);

  const handleUserSelect = (employee: EmployeeData) => {
    const identity = identities.find(i => i.id === employee.id);
    if (identity) {
      setSelectedUser({
        id: identity.id,
        name: employee.name,
        type: employee.type as "Employee" | "Contractor" | "Service Account" | "Partner",
        department: employee.department,
        status: employee.status as "Active" | "Suspended" | "Stale",
        team: 0,
        manager: employee.manager,
        riskLevel: employee.riskLevel as "Low" | "Medium" | "High",
        access: [],
        accounts: [],
        activity: [],
        lastUpdated: employee.lastUpdated,
        aiAnalysis: '',
      });
    }
  };

  return (
    <div className="space-y-6 pt-4">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Employee Directory</span>
            {totalElements > 0 && (
              <Badge variant="secondary" className="ml-2">{totalElements.toLocaleString()} total</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email..."
                className="pl-10"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <Select value={statusFilter || 'all'} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="SUSPENDED">Suspended</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="TERMINATED">Terminated</SelectItem>
              </SelectContent>
            </Select>
            <Select value={departmentFilter || 'all'} onValueChange={handleDepartmentChange}>
              <SelectTrigger>
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="Engineering">Engineering</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="HR">HR</SelectItem>
                <SelectItem value="Sales">Sales</SelectItem>
                <SelectItem value="Operations">Operations</SelectItem>
                <SelectItem value="Legal">Legal</SelectItem>
                <SelectItem value="IT">IT</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Directory Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loadingâ€¦
                </span>
              ) : (
                <span>
                  {totalElements > 0
                    ? `Showing ${firstItem}-${lastItem} of ${totalElements.toLocaleString()} employees`
                    : 'No employees found'}
                </span>
              )}
            </CardTitle>
            <Select value={size.toString()} onValueChange={handleSizeChange}>
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map(n => (
                  <SelectItem key={n} value={n.toString()}>{n} / page</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="py-10 text-center">
              <p className="text-destructive mb-4">
                {(error as { message?: string })?.message || 'Failed to load employees.'}
              </p>
              <Button variant="outline" onClick={refresh}>Retry</Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Employee</th>
                      <th className="text-left p-3">Department</th>
                      <th className="text-left p-3">Manager</th>
                      <th className="text-left p-3">Location</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Risk</th>
                      <th className="text-left p-3">Access</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.length === 0 && !isLoading ? (
                      <tr>
                        <td colSpan={8} className="text-center py-10 text-muted-foreground">
                          No employees match the current filters.
                        </td>
                      </tr>
                    ) : (
                      employees.map((employee) => (
                        <tr
                          key={employee.id}
                          className="border-b hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleUserSelect(employee)}
                        >
                          <td className="p-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                <User className="h-4 w-4 text-gray-600" />
                              </div>
                              <div>
                                <div className="font-medium">{employee.name}</div>
                                <div className="text-sm text-gray-500">{employee.email}</div>
                                <div className="text-sm text-gray-500">{employee.jobTitle}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="space-y-1">
                              <Badge className={typeColors[employee.employmentType as keyof typeof typeColors]}>
                                {employee.employmentType}
                              </Badge>
                              <div className="text-sm text-gray-500">{employee.department}</div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="font-medium">{employee.manager}</div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <div>
                                <div className="text-sm">{employee.location}</div>
                                <div className="text-xs text-gray-500">{employee.workLocation}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <Badge className={statusColors[employee.status as keyof typeof statusColors]}>
                              {employee.status}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Badge className={riskColors[employee.riskLevel as keyof typeof riskColors]}>
                              {employee.riskLevel}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center space-x-1">
                              <Shield className="h-4 w-4 text-gray-400" />
                              <span>{employee.accessCount} items</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              {employee.status === 'Stale' && (
                                <Button variant="ghost" size="sm" className="text-yellow-600" onClick={(e) => e.stopPropagation()}>
                                  <Clock className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t mt-4">
                  <span className="text-sm text-muted-foreground">
                    Page {page + 1} of {totalPages}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(0)}
                      disabled={page === 0 || isLoading}
                    >
                      First
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(0, p - 1))}
                      disabled={page === 0 || isLoading}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="px-2 text-sm font-medium">{page + 1}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                      disabled={page >= totalPages - 1 || isLoading}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(totalPages - 1)}
                      disabled={page >= totalPages - 1 || isLoading}
                    >
                      Last
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
