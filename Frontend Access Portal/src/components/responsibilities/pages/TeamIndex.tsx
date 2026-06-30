"use client";

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, UserPlus, Shield, AlertTriangle, Clock, Download, 
  Grid3x3, List, CheckCircle, ArrowLeft, X, Mail, Briefcase, 
  Building, Calendar, TrendingUp, Key
} from 'lucide-react';
import { fetchMyTeam, TeamMember } from '@/services/responsibilities';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { JobTrackerDrawer } from '@/components/shared/JobTrackerDrawer';
import { useConfirm } from '@/hooks/useConfirm';
import { useAudit } from '@/hooks/useAudit';
import { useRbac } from '@/hooks/useRbac';
import { useJobTracker } from '@/hooks/useJobTracker';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useRouter } from 'next/navigation';

export const TeamIndex = () => {
  const [globalSearch] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'chart'>('list');
  const [reportTypeFilter, setReportTypeFilter] = useState<'all' | 'direct' | 'indirect'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ACTIVE' | 'INACTIVE' | 'LOCKED'>('all');
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [panelWidth, setPanelWidth] = useState(800);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { confirm, isOpen, options, handleConfirm, handleCancel } = useConfirm();
  const { logAction } = useAudit();
  const { can } = useRbac();
  const jobTracker = useJobTracker();
  const router = useRouter();

  // Open/close panel when member is selected
  useEffect(() => {
    if (selectedMember) {
      setIsPanelOpen(true);
    } else {
      setIsPanelOpen(false);
    }
  }, [selectedMember]);

  // Close panel handler
  const handleClosePanel = () => {
    setSelectedMember(null);
    setIsPanelOpen(false);
  };

  const { data: team, isLoading } = useQuery({
    queryKey: ['team', 'me'],
    queryFn: fetchMyTeam,
  });

  const filteredTeam = team?.filter(member => {
    if (!member) return false;
    
    const searchTerm = (globalSearch || '').toLowerCase();
    const matchesSearch = 
      (member.displayName || '').toLowerCase().includes(searchTerm) ||
      (member.department || '').toLowerCase().includes(searchTerm) ||
      (member.jobTitle || '').toLowerCase().includes(searchTerm) ||
      (member.email || '').toLowerCase().includes(searchTerm);
    
    const matchesReportType = 
      reportTypeFilter === 'all' ||
      (reportTypeFilter === 'direct' && member.isDirectReport) ||
      (reportTypeFilter === 'indirect' && !member.isDirectReport);
    
    const matchesStatus = 
      statusFilter === 'all' || member.status === statusFilter;
    
    return matchesSearch && matchesReportType && matchesStatus;
  });

  const getRiskColor = (score: number): "destructive" | "default" | "secondary" => {
    if (score >= 30) return 'destructive';
    if (score >= 20) return 'default';
    return 'secondary';
  };

  const stats = {
    total: team?.length || 0,
    active: team?.filter(m => m.status === 'ACTIVE').length || 0,
    inactive: team?.filter(m => m.status !== 'ACTIVE').length || 0,
    direct: team?.filter(m => m.isDirectReport).length || 0,
    indirect: team?.filter(m => !m.isDirectReport).length || 0,
    highRisk: team?.filter(m => m.riskScore >= 30).length || 0,
    noMfa: team?.filter(m => !m.mfaEnabled).length || 0,
  };

  // Mutations
  const bulkCertifyMutation = useMutation({
    mutationFn: async ({  }: { reason: string }) => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const jobId = `cert-${Date.now()}`;
      return { jobId };
    },
    onSuccess: (data, variables) => {
      logAction({
        action: 'team.bulk_certify',
        entity: 'team',
        entityId: 'my-team',
        reason: variables.reason,
      });
      
      jobTracker.trackJob(data.jobId, 'Team Certification');
      
      toast({
        title: "Certification Started",
        description: "Bulk certification has been initiated.",
      });
      
      queryClient.invalidateQueries({ queryKey: ['team', 'me'] });
    },
  });



  // Handlers
  const handleBulkCertify = async () => {
    if (!can('certify', 'team')) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to certify team access.",
        variant: "destructive",
      });
      return;
    }

    const result = await confirm({
      title: "Bulk Team Certification",
      description: "Start a certification campaign for your entire team.",
      requireReason: true,
      confirmText: "Start Certification",
    });

    if (result.confirmed && result.reason) {
      bulkCertifyMutation.mutate({ reason: result.reason });
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/responsibilities')}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Team</h1>
            <p className="text-muted-foreground mt-1">
              Direct and indirect reports you manage
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={handleBulkCertify}
            disabled={bulkCertifyMutation.isPending}
          >
            <CheckCircle className="h-4 w-4" />
            Bulk Certification
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={() => setViewMode('list')}>
            <List className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setViewMode('chart')}>
            <Grid3x3 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Team</p>
                <p className="text-2xl font-bold mt-1">{stats.total}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.direct} direct · {stats.indirect} indirect
                </p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Members</p>
                <p className="text-2xl font-bold mt-1">{stats.active}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.inactive} inactive/locked
                </p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Risk</p>
                <p className="text-2xl font-bold mt-1">{stats.highRisk}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Risk score ≥ 30
                </p>
              </div>
              <div className="p-3 bg-destructive/10 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">No MFA</p>
                <p className="text-2xl font-bold mt-1">{stats.noMfa}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Security concern
                </p>
              </div>
              <div className="p-3 bg-orange-500/10 rounded-lg">
                <Shield className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="w-[200px]">
              <label className="text-sm font-medium mb-2 block">Report Type</label>
              <Tabs value={reportTypeFilter} onValueChange={(v) => setReportTypeFilter(v as typeof reportTypeFilter)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="direct">Direct</TabsTrigger>
                  <TabsTrigger value="indirect">Indirect</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="w-[180px]">
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="ACTIVE">Active</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Members */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : filteredTeam && filteredTeam.length > 0 ? (
        <div className="space-y-4">
          {filteredTeam?.slice(0, 5).map((member) => (
            <Card 
              key={member.userId} 
              className={`hover:shadow-lg transition-all duration-200 ${
                member.riskScore >= 30 
                  ? 'border-red-200 dark:border-red-800 bg-gradient-to-r from-red-50/50 to-transparent dark:from-red-950/20' 
                  : 'hover:border-primary/50'
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`h-14 w-14 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-lg ${
                      member.riskScore >= 30 
                        ? 'bg-gradient-to-br from-red-500 to-red-600' 
                        : member.status !== 'ACTIVE'
                        ? 'bg-gradient-to-br from-gray-400 to-gray-500'
                        : 'bg-gradient-to-br from-blue-500 to-blue-600'
                    }`}>
                      {member.firstName[0]}{member.lastName[0]}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{member.displayName}</h3>
                        <Badge 
                          variant={member.status === 'ACTIVE' ? 'default' : member.status === 'LOCKED' ? 'destructive' : 'secondary'}
                        >
                          {member.status}
                        </Badge>
                        {member.isDirectReport && (
                          <Badge variant="outline" className="text-xs">
                            Direct Report
                          </Badge>
                        )}
                        {member.riskScore >= 30 && (
                          <Badge variant="destructive" className="gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            High Risk
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm mb-3">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <UserPlus className="h-3.5 w-3.5" />
                          <span>{member.jobTitle}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="h-3.5 w-3.5" />
                          <span>{member.department}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Shield className="h-3.5 w-3.5" />
                          <span className="font-medium text-foreground">{member.roleCount}</span> roles
                          <span className="text-xs">({member.permissionCount} permissions)</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          <span className="text-xs">
                            {member.lastLogin == null 
                              ? 'Never'
                              : new Date(member.lastLogin).toLocaleString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge variant={getRiskColor(member.riskScore)} className="text-xs">
                          Risk: {member.riskScore}
                        </Badge>
                        {!member.mfaEnabled && (
                          <Badge variant="destructive" className="text-xs gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            No MFA
                          </Badge>
                        )}
                        {member.activeSessions > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {member.activeSessions} active session{member.activeSessions > 1 ? 's' : ''}
                          </Badge>
                        )}
                        {member.terminationDate && new Date(member.terminationDate).toString() !== 'Invalid Date' && (
                          <Badge variant="outline" className="text-xs text-orange-600 dark:text-orange-400">
                            Ends {format(new Date(member.terminationDate), 'MMM dd, yyyy')}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedMember(member)}
                    >
                      View Access
                    </Button>
                    <Button size="sm" variant="outline">
                      <UserPlus className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Shield className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <PageEmptyState
          icon={<Users className="h-8 w-8 text-primary" />}
          title="No Team Members Found"
          message="No team members match your current filters."
        />
      )}

      {/* Resizable Side Panel */}
      {isPanelOpen && selectedMember && (
        <div
          className="fixed top-0 right-0 h-full z-50 shadow-2xl bg-background border-l"
          style={{ width: `${panelWidth}px` }}
        >
          {/* Resize Handle */}
          <div
            className="absolute left-0 top-0 w-2 h-full bg-muted hover:bg-primary/20 cursor-col-resize z-10 transition-colors flex items-center justify-center group"
            onMouseDown={(e) => {
              e.preventDefault();

              const handleMouseMove = (e: MouseEvent) => {
                const newWidth = window.innerWidth - e.clientX;
                // Constrain between 500px and 1400px
                if (newWidth >= 500 && newWidth <= 1400) {
                  setPanelWidth(newWidth);
                }
              };

              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };

              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
          >
            <div className="w-1 h-12 bg-muted-foreground/40 group-hover:bg-primary/60 transition-colors rounded-full"></div>
          </div>

          {/* Panel Content */}
          <div className="h-full overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background border-b p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`h-16 w-16 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg ${
                    selectedMember.riskScore >= 30 
                      ? 'bg-gradient-to-br from-red-500 to-red-600' 
                      : selectedMember.status !== 'ACTIVE'
                      ? 'bg-gradient-to-br from-gray-400 to-gray-500'
                      : 'bg-gradient-to-br from-blue-500 to-blue-600'
                  }`}>
                    {selectedMember.firstName?.[0] || ''}{selectedMember.lastName?.[0] || ''}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedMember.displayName}</h2>
                    <p className="text-muted-foreground">{selectedMember.jobTitle}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedMember(null)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Status Badges */}
              <div className="flex flex-wrap gap-2">
                <Badge variant={selectedMember.status === 'ACTIVE' ? 'default' : selectedMember.status === 'LOCKED' ? 'destructive' : 'secondary'}>
                  {selectedMember.status}
                </Badge>
                {selectedMember.isDirectReport && (
                  <Badge variant="outline">Direct Report</Badge>
                )}
                {selectedMember.riskScore >= 30 && (
                  <Badge variant="destructive" className="gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    High Risk ({selectedMember.riskScore})
                  </Badge>
                )}
                {!selectedMember.mfaEnabled && (
                  <Badge variant="destructive" className="gap-1">
                    <Shield className="h-3 w-3" />
                    No MFA
                  </Badge>
                )}
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="overview" className="p-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="roles">Roles ({selectedMember.roleCount})</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6 mt-6">
                {/* Basic Information */}
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <h3 className="font-semibold text-lg mb-4">Basic Information</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {selectedMember.email && (
                        <div className="flex items-start gap-3">
                          <Mail className="h-4 w-4 text-muted-foreground mt-1" />
                          <div>
                            <p className="text-xs text-muted-foreground">Email</p>
                            <p className="text-sm font-medium">{selectedMember.email}</p>
                          </div>
                        </div>
                      )}
                      
                      {selectedMember.username && (
                        <div className="flex items-start gap-3">
                          <Users className="h-4 w-4 text-muted-foreground mt-1" />
                          <div>
                            <p className="text-xs text-muted-foreground">Username</p>
                            <p className="text-sm font-medium">{selectedMember.username}</p>
                          </div>
                        </div>
                      )}
                      
                      {selectedMember.employeeId && (
                        <div className="flex items-start gap-3">
                          <Briefcase className="h-4 w-4 text-muted-foreground mt-1" />
                          <div>
                            <p className="text-xs text-muted-foreground">Employee ID</p>
                            <p className="text-sm font-medium">{selectedMember.employeeId}</p>
                          </div>
                        </div>
                      )}
                      
                      {selectedMember.department && (
                        <div className="flex items-start gap-3">
                          <Building className="h-4 w-4 text-muted-foreground mt-1" />
                          <div>
                            <p className="text-xs text-muted-foreground">Department</p>
                            <p className="text-sm font-medium">{selectedMember.department}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Employment Information */}
                {(selectedMember.hireDate || selectedMember.terminationDate || selectedMember.managerName) && (
                  <Card>
                    <CardContent className="pt-6 space-y-4">
                      <h3 className="font-semibold text-lg mb-4">Employment</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        {selectedMember.hireDate && new Date(selectedMember.hireDate).toString() !== 'Invalid Date' && (
                          <div className="flex items-start gap-3">
                            <Calendar className="h-4 w-4 text-muted-foreground mt-1" />
                            <div>
                              <p className="text-xs text-muted-foreground">Hire Date</p>
                              <p className="text-sm font-medium">{format(new Date(selectedMember.hireDate), 'MMM dd, yyyy')}</p>
                            </div>
                          </div>
                        )}
                        
                        {selectedMember.terminationDate && new Date(selectedMember.terminationDate).toString() !== 'Invalid Date' && (
                          <div className="flex items-start gap-3">
                            <Calendar className="h-4 w-4 text-muted-foreground mt-1" />
                            <div>
                              <p className="text-xs text-muted-foreground">Termination Date</p>
                              <p className="text-sm font-medium text-orange-600">{format(new Date(selectedMember.terminationDate), 'MMM dd, yyyy')}</p>
                            </div>
                          </div>
                        )}
                        
                        {selectedMember.managerName && (
                          <div className="flex items-start gap-3">
                            <Users className="h-4 w-4 text-muted-foreground mt-1" />
                            <div>
                              <p className="text-xs text-muted-foreground">Manager</p>
                              <p className="text-sm font-medium">{selectedMember.managerName}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Security & Activity */}
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <h3 className="font-semibold text-lg mb-4">Security & Activity</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-start gap-3">
                        <TrendingUp className="h-4 w-4 text-muted-foreground mt-1" />
                        <div>
                          <p className="text-xs text-muted-foreground">Risk Score</p>
                          <p className={`text-sm font-medium ${selectedMember.riskScore >= 30 ? 'text-destructive' : ''}`}>
                            {selectedMember.riskScore}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <Shield className="h-4 w-4 text-muted-foreground mt-1" />
                        <div>
                          <p className="text-xs text-muted-foreground">MFA Status</p>
                          <p className={`text-sm font-medium ${!selectedMember.mfaEnabled ? 'text-destructive' : 'text-green-600'}`}>
                            {selectedMember.mfaEnabled ? 'Enabled' : 'Disabled'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <Clock className="h-4 w-4 text-muted-foreground mt-1" />
                        <div>
                          <p className="text-xs text-muted-foreground">Last Login</p>
                          <p className="text-sm font-medium">
                            {selectedMember.lastLogin == null 
                              ? 'Never' 
                              : new Date(selectedMember.lastLogin).toLocaleString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <Users className="h-4 w-4 text-muted-foreground mt-1" />
                        <div>
                          <p className="text-xs text-muted-foreground">Active Sessions</p>
                          <p className="text-sm font-medium">{selectedMember.activeSessions}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <Key className="h-4 w-4 text-muted-foreground mt-1" />
                        <div>
                          <p className="text-xs text-muted-foreground">Total Permissions</p>
                          <p className="text-sm font-medium">{selectedMember.permissionCount}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Roles Tab */}
              <TabsContent value="roles" className="space-y-4 mt-6">
                {selectedMember.roles && selectedMember.roles.length > 0 ? (
                  selectedMember.roles.map((role) => (
                    <Card key={role.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="font-semibold text-lg">{role.name}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{role.roleType} · {role.scope}</p>
                          </div>
                          <Badge variant={role.isActive ? 'default' : 'secondary'}>
                            {role.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {role.isCritical && (
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-orange-500" />
                              <span className="text-orange-600 font-medium">Critical Role</span>
                            </div>
                          )}
                          
                          {role.riskLevel && (
                            <div className="flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Risk: {role.riskLevel}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2">
                            <Key className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{role.permissionCount} permissions</span>
                          </div>
                          
                          {role.assignedAt && new Date(role.assignedAt).toString() !== 'Invalid Date' && (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                Assigned {format(new Date(role.assignedAt), 'MMM dd, yyyy')}
                              </span>
                            </div>
                          )}
                          
                          {role.assignedBy && (
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">By: {role.assignedBy}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Shield className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No roles assigned</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <ConfirmDialog
        isOpen={isOpen}
        options={options}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />

      <JobTrackerDrawer
        isOpen={jobTracker.isOpen}
        jobs={jobTracker.jobs}
        onClose={jobTracker.closeDrawer}
        onDismiss={jobTracker.dismissJob}
      />
    </div>
  );
};
