"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  Globe, 
  LogOut,
  Search,
  Filter,
  Upload,
  RefreshCw,
  Activity,
  Users,
  X,
  ChevronDown,
  History
} from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { UserSession } from '@/types/session';
import { formatDistanceToNow } from 'date-fns';

const StatsCard: React.FC<{ 
  icon: any; 
  label: string; 
  value: number; 
  variant?: 'default' | 'success' | 'warning' 
}> = ({ icon: Icon, label, value, variant = 'default' }) => {
  const bgColor = variant === 'success' ? 'bg-success/10' : variant === 'warning' ? 'bg-warning/10' : 'bg-muted';
  const textColor = variant === 'success' ? 'text-success-foreground' : variant === 'warning' ? 'text-warning-foreground' : 'text-foreground';
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <div className={`${bgColor} p-3 rounded-lg`}>
            <Icon className={`h-5 w-5 ${textColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface SessionRowProps {
  session: UserSession;
  selected: boolean;
  onSelect: (selected: boolean) => void;
  onTerminate: () => void;
  isCurrentSession: boolean;
}

const SessionRow: React.FC<SessionRowProps> = ({ 
  session, 
  selected, 
  onSelect, 
  onTerminate,
  isCurrentSession 
}) => {
  const getDeviceIcon = () => {
    if (session.isMobile) return Smartphone;
    if (session.isDesktop) return Monitor;
    return Tablet;
  };

  const getSessionStatus = () => {
    // Current session is always active
    if (isCurrentSession) {
      return { label: 'Active', variant: 'success' };
    }

    // Check if lastActivityAt exists and is valid
    if (!session.lastActivityAt || session.lastActivityAt === 0) {
      return { label: 'Idle', variant: 'warning' };
    }

    // Calculate time since last activity (10 minutes threshold)
    const tenMinutesInMs = 10 * 60 * 1000;
    const timeSinceActivity = Date.now() - session.lastActivityAt;

    if (timeSinceActivity > tenMinutesInMs) {
      return { label: 'Idle', variant: 'warning' };
    }

    return { label: 'Active', variant: 'success' };
  };

  const formatLastActivity = () => {
    if (!session.lastActivityAt || session.lastActivityAt === 0) {
      return <span className="text-sm text-muted-foreground">Never</span>;
    }
    return <span className="text-sm">{formatDistanceToNow(new Date(session.lastActivityAt), { addSuffix: true })}</span>;
  };

  const DeviceIcon = getDeviceIcon();
  const status = getSessionStatus();

  return (
    <TableRow>
      <TableCell>
        <Checkbox 
          checked={selected} 
          onCheckedChange={onSelect} 
          disabled={isCurrentSession} 
        />
      </TableCell>
      <TableCell>
        <div className="flex flex-col">
          <span className="font-medium">{session.user.full_name || session.user.username}</span>
          <span className="text-xs text-muted-foreground">{session.user.email}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <DeviceIcon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{session.device}</span>
        </div>
      </TableCell>
      <TableCell>
        {session.location ? (
          <div className="flex items-center gap-1">
            <Globe className="h-3 w-3 text-muted-foreground" />
            <span className="text-sm">{session.location}</span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell className="text-sm font-mono">{session.ipAddress}</TableCell>
      <TableCell className="text-sm">
        {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
      </TableCell>
      <TableCell>
        {formatLastActivity()}
      </TableCell>
      <TableCell>
        {isCurrentSession ? (
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/30">
            Current
          </Badge>
        ) : status.variant === 'success' ? (
          <Badge className="bg-green-500/10 text-green-600 border-green-500/30 hover:bg-green-500/20">
            {status.label}
          </Badge>
        ) : (
          <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30 hover:bg-yellow-500/20">
            {status.label}
          </Badge>
        )}
      </TableCell>
      <TableCell className="text-right">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onTerminate}
              disabled={isCurrentSession}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isCurrentSession ? "Cannot terminate current session" : "Terminate session"}</p>
          </TooltipContent>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
};

export const ActiveSessionsTab: React.FC = () => {
  const router = useRouter();
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [selectedSessions, setSelectedSessions] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [showTerminateDialog, setShowTerminateDialog] = useState(false);
  const [showSingleTerminateDialog, setShowSingleTerminateDialog] = useState(false);
  const [sessionToTerminate, setSessionToTerminate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageInput, setPageInput] = useState('1');
  const { toast: showToast } = useToast();

  // Reset to page 1 when search query changes
  useEffect(() => {
    if (searchQuery !== undefined) {
      setCurrentPage(1);
    }
  }, [searchQuery]);

  // Fetch sessions when pagination or search changes
  useEffect(() => {
    fetchSessions();
  }, [currentPage, pageSize, searchQuery]);

  // Update pageInput when currentPage changes
  useEffect(() => {
    setPageInput(currentPage.toString());
  }, [currentPage]);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: (currentPage - 1).toString(),
        size: pageSize.toString(),
      });

      if (searchQuery && searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      const response = await fetch(`/api/proxy/sessions?${params.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // This sends cookies automatically
      });      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }
      
      const data = await response.json();
      setSessions(data.content || []);
      setTotalElements(data.totalElements || 0);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      showToast({
        title: "Error",
        description: "Failed to load sessions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => ({
    total: totalElements, // Use total from backend (including filtered)
    active: totalElements, // All fetched sessions are active
    desktop: sessions.filter(s => s.isDesktop).length,
    mobile: sessions.filter(s => s.isMobile).length,
  }), [sessions, totalElements]);

  const handleTerminateSessions = async (sessionIds: string[]) => {
    try {
      const results = await Promise.allSettled(
        sessionIds.map(sessionId => 
          fetch(`/api/proxy/sessions/${sessionId}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          })
        )
      );

      const successCount = results.filter(r => r.status === 'fulfilled' && (r.value as Response).ok).length;
      const failureCount = results.length - successCount;

      if (successCount > 0) {
        showToast({
          title: "Sessions Terminated",
          description: `Successfully terminated ${successCount} session(s). Users will be logged out instantly.`,
        });
        
        // Refresh the sessions list
        fetchSessions();
      }

      if (failureCount > 0) {
        showToast({
          title: "Partial Failure",
          description: `Failed to terminate ${failureCount} session(s). Please try again.`,
          variant: "destructive",
        });
      }

      setSelectedSessions(new Set());
      setShowTerminateDialog(false);
    } catch (error) {
      console.error('Error terminating sessions:', error);
      showToast({
        title: "Error",
        description: "Failed to terminate sessions. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleTerminateSingle = async () => {
    if (!sessionToTerminate) return;

    try {
      const response = await fetch(`/api/proxy/sessions/${sessionToTerminate}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to terminate session');
      }

      // Show success toast (bottom right corner)
      toast.success("Session terminated successfully");

      // Refresh the sessions list
      fetchSessions();
      setShowSingleTerminateDialog(false);
      setSessionToTerminate(null);
    } catch (error) {
      console.error('Error terminating session:', error);
      toast.error(error instanceof Error ? error.message : "Failed to terminate session. Please try again.");
      setShowSingleTerminateDialog(false);
      setSessionToTerminate(null);
    }
  };

  const openTerminateDialog = (sessionId: string) => {
    setSessionToTerminate(sessionId);
    setShowSingleTerminateDialog(true);
  };

  const handleRefresh = () => {
    fetchSessions();
    showToast({
      title: "Sessions Refreshed",
      description: "Session data has been updated.",
    });
  };

  const handleExport = (format: 'csv' | 'json') => {
    const dataToExport = sessions;
    
    if (format === 'json') {
      const jsonData = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sessions-export-${new Date().toISOString()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const headers = 'Email,Username,Device,IP Address,Location,Login Time,Auth Method,Mobile,Desktop';
      const csv = dataToExport.map(s => 
        `"${s.user.email}","${s.user.username}","${s.device}","${s.ipAddress}","${s.location || ''}","${new Date(s.createdAt).toISOString()}","${s.authMethod}","${s.isMobile}","${s.isDesktop}"`
      ).join('\n');
      
      const blob = new Blob([`${headers}\n${csv}`], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sessions-export-${new Date().toISOString()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
    
    showToast({
      title: "Export Complete",
      description: `Session data has been exported to ${format.toUpperCase()}.`,
    });
  };

  const handleExportSelected = (format: 'csv' | 'json') => {
    const selectedSessionsList = sessions.filter(s => selectedSessions.has(s.sessionId));
    
    if (selectedSessionsList.length === 0) {
      showToast({
        title: "No Selection",
        description: "Please select sessions to export.",
        variant: "destructive",
      });
      return;
    }
    
    if (format === 'json') {
      const jsonData = JSON.stringify(selectedSessionsList, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sessions-selected-export-${new Date().toISOString()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const headers = 'Email,Username,Device,IP Address,Location,Login Time,Auth Method,Mobile,Desktop';
      const csv = selectedSessionsList.map(s => 
        `"${s.user.email}","${s.user.username}","${s.device}","${s.ipAddress}","${s.location || ''}","${new Date(s.createdAt).toISOString()}","${s.authMethod}","${s.isMobile}","${s.isDesktop}"`
      ).join('\n');
      
      const blob = new Blob([`${headers}\n${csv}`], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sessions-selected-export-${new Date().toISOString()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
    
    showToast({
      title: "Export Complete",
      description: `${selectedSessionsList.length} selected session(s) exported to ${format.toUpperCase()}.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard icon={Users} label="Total Sessions" value={stats.total} />
        <StatsCard icon={Activity} label="Active" value={stats.active} variant="success" />
        <StatsCard icon={Monitor} label="Desktop" value={stats.desktop} />
        <StatsCard icon={Smartphone} label="Mobile" value={stats.mobile} />
      </div>

      {/* Actions Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 flex-1 min-w-[300px]">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by user, IP, location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-9"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                    onClick={() => setSearchQuery('')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => {
                        // Navigate to audit logs with pre-selected session events
                        router.push('/auditlogs?events=terminate%20session,login,logout');
                      }}
                    >
                      <History className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Audit Trail</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="flex items-center gap-2">
              {selectedSessions.size > 0 ? (
                <>
                  <DropdownMenu>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                          <Button variant="default" size="sm">
                            <Upload className="h-4 w-4 mr-2" />
                            ({selectedSessions.size})
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Export selected sessions</p>
                      </TooltipContent>
                    </Tooltip>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleExportSelected('csv')}>
                        <Upload className="h-4 w-4 mr-2" />
                        CSV
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExportSelected('json')}>
                        <Upload className="h-4 w-4 mr-2" />
                        JSON
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => setShowTerminateDialog(true)}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        ({selectedSessions.size})
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Terminate selected sessions</p>
                    </TooltipContent>
                  </Tooltip>
                </>
              ) : (
                <DropdownMenu>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Upload className="h-4 w-4 " />
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Export page</p>
                    </TooltipContent>
                  </Tooltip>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleExport('csv')}>
                      <Upload className="h-4 w-4 mr-2" />
                      CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('json')}>
                      <Upload className="h-4 w-4 mr-2" />
                      JSON
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sessions Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Sessions</CardTitle>
          <CardDescription>
            Manage and monitor all active user sessions across your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
              <p className="text-muted-foreground">Loading sessions...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedSessions.size === sessions.filter((s: UserSession) => !s.isCurrent).length && sessions.length > 0}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedSessions(new Set(sessions.filter((s: UserSession) => !s.isCurrent).map((s: UserSession) => s.sessionId)));
                            } else {
                              setSelectedSessions(new Set());
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Device</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Login Time</TableHead>
                      <TableHead>Last Activity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.map((session: UserSession) => (
                      <SessionRow 
                        key={session.sessionId}
                        session={session}
                        selected={selectedSessions.has(session.sessionId)}
                        onSelect={(selected) => {
                          const newSelected = new Set(selectedSessions);
                          if (selected) {
                            newSelected.add(session.sessionId);
                          } else {
                            newSelected.delete(session.sessionId);
                          }
                          setSelectedSessions(newSelected);
                        }}
                        onTerminate={() => openTerminateDialog(session.sessionId)}
                        isCurrentSession={session.isCurrent === true}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>

              {sessions.length === 0 && !loading && (
                <div className="text-center py-12">
                  <Monitor className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No sessions found</p>
                </div>
              )}
            </>
          )}

          {/* Pagination */}
          {!loading && totalElements > 0 && (
            <div className="flex items-center justify-between px-2 py-4 border-t">
              {/* Left side: Page size selector and results info */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Select
                    value={pageSize.toString()}
                    onValueChange={(value) => {
                      setPageSize(parseInt(value));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-fit">
                      <SelectValue /> <p>per page</p>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-sm text-muted-foreground whitespace-pre">
                  <span className="font-medium">{((currentPage - 1) * pageSize) + 1}</span>-{" "}
                  <span className="font-medium">{Math.min(currentPage * pageSize, totalElements)}</span> of{" "}
                  <span className="font-medium">{totalElements}</span>
                </div>
              </div>

              {/* Center: Pagination controls */}
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      size="default"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) setCurrentPage(currentPage - 1);
                      }}
                      className={
                        currentPage === 1 ? "pointer-events-none opacity-50" : ""
                      }
                    />
                  </PaginationItem>

                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <PaginationItem key={i}>
                        <PaginationLink
                          href="#"
                          size="icon"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(pageNum);
                          }}
                          isActive={currentPage === pageNum}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      size="default"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages)
                          setCurrentPage(currentPage + 1);
                      }}
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>

              {/* Right side: Manual page input */}
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  value={pageInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || /^\d+$/.test(value)) {
                      setPageInput(value);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const pageNumber = parseInt(pageInput);
                      if (pageNumber >= 1 && pageNumber <= totalPages) {
                        setCurrentPage(pageNumber);
                      } else {
                        setPageInput(currentPage.toString());
                      }
                    }
                  }}
                  onBlur={() => {
                    if (pageInput === "" || parseInt(pageInput) < 1 || parseInt(pageInput) > totalPages) {
                      setPageInput(currentPage.toString());
                    }
                  }}
                  className="w-16 text-center"
                  min={1}
                  max={totalPages}
                  placeholder="1"
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    const pageNumber = parseInt(pageInput);
                    if (pageNumber >= 1 && pageNumber <= totalPages) {
                      setCurrentPage(pageNumber);
                    } else {
                      setPageInput(currentPage.toString());
                    }
                  }}
                >
                  Open
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Terminate Confirmation Dialog */}
      <AlertDialog open={showTerminateDialog} onOpenChange={setShowTerminateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Terminate Sessions?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to terminate {selectedSessions.size} session(s). 
              Users will be logged out immediately and will need to re-authenticate.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleTerminateSessions(Array.from(selectedSessions))}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Terminate Sessions
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Single Session Terminate Confirmation Dialog */}
      <AlertDialog open={showSingleTerminateDialog} onOpenChange={setShowSingleTerminateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Terminate Session?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to terminate this session? The user will be logged out immediately and will need to re-authenticate.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSessionToTerminate(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleTerminateSingle}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Terminate Session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
