import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Application } from '@/data/mock-applications';
import { mockEntitlements, Entitlement } from '@/data/mock-entitlements';
import { mockUsers, User } from '@/data/mock-users';
import { getADMatrixUsers, getADMatrixEntitlements } from '@/data/mock-ad-matrix-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, Filter, Download, Eye, Shield, AlertTriangle, CheckCircle, Clock, Sparkles, Pin, Users, FileText, Brain, Loader, X, ChevronDown, ChevronUp, LayoutGrid, List, ZoomIn, ZoomOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import AIReportModal from './ai-analysis/AIReportModal';
import { runAIAnalysisOnAccessMatrix, buildAccessMatrix, AIAnalysisResponse } from '@/services/aiAnalysisService';
import { StandardPagination } from '@/components/shared/StandardPagination';
import { getSeverityBadgeClass, getStatusBadgeClass, getPrivilegeBadgeClass } from '@/utils/getBadgeClass';
import { toast } from '@/hooks/use-toast';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

type ApplicationAccessMatrixTabProps = {
  application: Application;
};

type FilterState = {
  searchTerm: string;
  riskLevel: string;
  department: string;
  status: string;
  // Role-mining filters
  entitlementType: string;
  classification: string;
  provisioningSource: string;
  privilegeLevel: string;
  entitlementOwner: string;
  accessSource: string;
};

const DEFAULT_FILTERS: FilterState = {
  searchTerm: '',
  riskLevel: 'all',
  department: 'all',
  status: 'all',
  entitlementType: 'all',
  classification: 'all',
  provisioningSource: 'all',
  privilegeLevel: 'all',
  entitlementOwner: 'all',
  accessSource: 'all',
};

type CellStatus = 'approved' | 'temporary' | 'violation' | 'not-applicable' | 'high-risk';

const BASE_ROW_HEIGHT = 52;
const BASE_COL_WIDTH = 140;
const BASE_IDENTITY_COL_WIDTH = 260;
const OVERSCAN = 10;
const ZOOM_STEPS = [0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.1, 1.25, 1.5];

const ApplicationAccessMatrixTab = ({ application }: ApplicationAccessMatrixTabProps) => {
  const [filters, setFilters] = useState<FilterState>({ ...DEFAULT_FILTERS });
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const [viewMode, setViewMode] = useState<'scroll' | 'paginated'>('scroll');
  const [aiModeEnabled, setAiModeEnabled] = useState(false);
  const [pinnedColumns, setPinnedColumns] = useState<Set<string>>(new Set());
  const [selectedCell, setSelectedCell] = useState<{ user: User; entitlement: Entitlement } | null>(null);
  const [aiReport, setAiReport] = useState<AIAnalysisResponse | null>(null);
  const [showAiReportModal, setShowAiReportModal] = useState(false);
  const [isRunningAnalysis, setIsRunningAnalysis] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Derived zoom dimensions
  const ROW_HEIGHT = Math.round(BASE_ROW_HEIGHT * zoomLevel);
  const COL_WIDTH = Math.round(BASE_COL_WIDTH * zoomLevel);
  const IDENTITY_COL_WIDTH = Math.round(BASE_IDENTITY_COL_WIDTH * zoomLevel);

  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => {
      const idx = ZOOM_STEPS.indexOf(prev);
      return idx < ZOOM_STEPS.length - 1 ? ZOOM_STEPS[idx + 1] : prev;
    });
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => {
      const idx = ZOOM_STEPS.indexOf(prev);
      return idx > 0 ? ZOOM_STEPS[idx - 1] : prev;
    });
  }, []);

  const handleZoomReset = useCallback(() => setZoomLevel(1), []);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);

  // Virtual scroll state
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [containerHeight, setContainerHeight] = useState(600);
  const [containerWidth, setContainerWidth] = useState(800);

  // Debounced search
  const handleSearchChange = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, searchTerm: value }));
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setCurrentPage(1);
    }, 300);
  }, []);

  // Measure container
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height);
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const isActiveDirectory = application.name === 'Active Directory';

  // Data preparation — use large generated dataset for AD, standard mocks otherwise
  const appEntitlements = useMemo(() => {
    if (isActiveDirectory) return getADMatrixEntitlements();
    return mockEntitlements.filter(e => e.application === application.name);
  }, [application.name, isActiveDirectory]);

  const allUsersInApp = useMemo(() => {
    if (isActiveDirectory) return getADMatrixUsers();
    const accountsWithUsers = mockUsers.flatMap(user =>
      (user.accounts || [])
        .filter(acc => acc.appName === application.name)
        .map(account => ({ ...account, user }))
    );
    const userIds = new Set(accountsWithUsers.map(a => a.user.id));
    return mockUsers.filter(u => userIds.has(u.id));
  }, [application.name, isActiveDirectory]);

  // Unique filter options
  const departments = useMemo(() => [...new Set(allUsersInApp.map(u => u.department))], [allUsersInApp]);
  const entitlementTypes = useMemo(() => [...new Set(appEntitlements.map(e => e.type))], [appEntitlements]);
  const classifications = useMemo(() => {
    const all = new Set<string>();
    appEntitlements.forEach(e => e.classification?.forEach(c => all.add(c)));
    return [...all];
  }, [appEntitlements]);
  const privilegeLevels = useMemo(() => {
    const all = new Set<string>();
    appEntitlements.forEach(e => { if (e.privilegeLevel) all.add(e.privilegeLevel); });
    return [...all];
  }, [appEntitlements]);
  const entitlementOwners = useMemo(() => {
    const all = new Set<string>();
    appEntitlements.forEach(e => { if (e.owner) all.add(e.owner); });
    return [...all];
  }, [appEntitlements]);

  // Risk analysis
  const riskAnalysis = useMemo(() => {
    const analysis = new Map<string, {
      isOutlier: boolean;
      riskScore: number;
      violations: string[];
      toxicCombinations: string[];
      orphanedAccess: boolean;
      elevatedPrivileges: boolean;
    }>();

    for (const user of allUsersInApp) {
      const peers = allUsersInApp.filter(p => p.department === user.department && p.id !== user.id);
      const userEntitlements = (user.access || []).filter(a => appEntitlements.some(e => e.displayName === a.name));

      let riskScore = 0;
      const violations: string[] = [];
      const toxicCombinations: string[] = [];
      let isOutlier = false;
      let orphanedAccess = false;
      let elevatedPrivileges = false;

      if (peers.length > 0) {
        for (const entitlement of userEntitlements) {
          const peersWithEnt = peers.filter(p => (p.access || []).some(a => a.name === entitlement.name));
          if (peersWithEnt.length / peers.length < 0.1) {
            isOutlier = true;
            riskScore += 20;
          }
        }
      }

      const adminEnts = userEntitlements.filter(e =>
        e.name.toLowerCase().includes('admin') ||
        e.name.toLowerCase().includes('super') ||
        e.risk === 'High'
      );
      if (adminEnts.length > 2) {
        elevatedPrivileges = true;
        riskScore += 30;
        violations.push('Excessive administrative privileges');
      }

      const financialAccess = userEntitlements.some(e => e.name.toLowerCase().includes('financial'));
      const auditAccess = userEntitlements.some(e => e.name.toLowerCase().includes('audit'));
      if (financialAccess && auditAccess) {
        toxicCombinations.push('Financial + Audit Access');
        riskScore += 40;
        violations.push('SoD violation: Finance + Audit');
      }

      if (user.status === 'Inactive' && userEntitlements.length > 0) {
        orphanedAccess = true;
        riskScore += 25;
        violations.push('Inactive user with active access');
      }

      analysis.set(user.id, { isOutlier, riskScore, violations, toxicCombinations, orphanedAccess, elevatedPrivileges });
    }
    return analysis;
  }, [allUsersInApp, appEntitlements]);

  // Filter entitlements (columns) based on role-mining filters
  const filteredEntitlements = useMemo(() => {
    return appEntitlements.filter(ent => {
      if (filters.entitlementType !== 'all' && ent.type !== filters.entitlementType) return false;
      if (filters.classification !== 'all' && !ent.classification?.includes(filters.classification as any)) return false;
      if (filters.privilegeLevel !== 'all' && ent.privilegeLevel !== filters.privilegeLevel) return false;
      if (filters.entitlementOwner !== 'all') {
        if (filters.entitlementOwner === '__unowned__' && ent.owner) return false;
        if (filters.entitlementOwner !== '__unowned__' && ent.owner !== filters.entitlementOwner) return false;
      }
      return true;
    });
  }, [appEntitlements, filters.entitlementType, filters.classification, filters.privilegeLevel, filters.entitlementOwner]);

  // Filter users (rows)
  const filteredUsers = useMemo(() => {
    return allUsersInApp.filter(user => {
      const userRisk = riskAnalysis.get(user.id);
      if (debouncedSearch && !user.name.toLowerCase().includes(debouncedSearch.toLowerCase())) return false;
      if (filters.department !== 'all' && user.department !== filters.department) return false;
      if (filters.riskLevel !== 'all') {
        const score = userRisk?.riskScore || 0;
        if (filters.riskLevel === 'high' && score < 50) return false;
        if (filters.riskLevel === 'medium' && (score < 20 || score >= 50)) return false;
        if (filters.riskLevel === 'low' && score >= 20) return false;
      }
      if (filters.status !== 'all') {
        if (filters.status === 'violation' && !userRisk?.violations.length) return false;
        if (filters.status === 'outlier' && !userRisk?.isOutlier) return false;
      }
      // Access source filter: filter users who have at least one matching access item
      if (filters.accessSource !== 'all' || filters.provisioningSource !== 'all') {
        const userAccess = (user.access || []).filter(a => filteredEntitlements.some(e => e.displayName === a.name));
        if (filters.accessSource !== 'all' && !userAccess.some(a => a.source === filters.accessSource)) return false;
        if (filters.provisioningSource !== 'all' && !userAccess.some(a => a.provisioningSource === filters.provisioningSource)) return false;
      }
      return true;
    });
  }, [allUsersInApp, debouncedSearch, filters, riskAnalysis, filteredEntitlements]);

  // Reset page on filter change
  useEffect(() => { setCurrentPage(1); }, [filteredUsers.length]);

  const getCellStatus = useCallback((user: User, entitlementName: string): CellStatus => {
    const userAccess = (user.access || []).find(a => a.name === entitlementName);
    if (!userAccess) return 'not-applicable';
    const userRisk = riskAnalysis.get(user.id);
    if (userRisk?.violations.length) return 'violation';
    if ((userRisk?.riskScore || 0) > 50) return 'high-risk';
    if (userAccess.provisioningSource === 'Exception') return 'temporary';
    return 'approved';
  }, [riskAnalysis]);

  const getCellColor = (status: CellStatus) => {
    switch (status) {
      case 'approved': return 'bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 border-green-300 dark:border-green-700';
      case 'temporary': return 'bg-yellow-100 dark:bg-yellow-900/30 hover:bg-yellow-200 dark:hover:bg-yellow-900/50 border-yellow-300 dark:border-yellow-700';
      case 'violation': return 'bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 border-red-300 dark:border-red-700';
      case 'high-risk': return 'bg-orange-100 dark:bg-orange-900/30 hover:bg-orange-200 dark:hover:bg-orange-900/50 border-orange-300 dark:border-orange-700';
      case 'not-applicable': return 'bg-muted/50 hover:bg-muted border-border';
      default: return 'bg-background hover:bg-muted';
    }
  };

  const getCellIcon = (status: CellStatus) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />;
      case 'temporary': return <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
      case 'violation': return <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />;
      case 'high-risk': return <Shield className="h-4 w-4 text-orange-600 dark:text-orange-400" />;
      default: return null;
    }
  };

  const handlePinColumn = (entitlementId: string) => {
    setPinnedColumns(prev => {
      const next = new Set(prev);
      if (next.has(entitlementId)) next.delete(entitlementId);
      else next.add(entitlementId);
      return next;
    });
  };

  const exportMatrix = (format: 'pdf' | 'csv' | 'json') => {
    toast({ title: 'Export started', description: `Exporting matrix as ${format.toUpperCase()}...` });
  };

  const handleRunAIAnalysis = async () => {
    setIsRunningAnalysis(true);
    try {
      const fullMatrixPayload = {
        users: allUsersInApp,
        entitlements: appEntitlements,
        matrix: buildAccessMatrix(allUsersInApp, appEntitlements),
        applicationName: application.name,
      };
      const aiResponse = await runAIAnalysisOnAccessMatrix(fullMatrixPayload);
      setAiReport(aiResponse);
      setShowAiReportModal(true);
    } catch (error) {
      toast({ title: 'AI Analysis Failed', description: 'Could not complete analysis. Please try again.', variant: 'destructive' });
    } finally {
      setIsRunningAnalysis(false);
    }
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.riskLevel !== 'all') count++;
    if (filters.department !== 'all') count++;
    if (filters.status !== 'all') count++;
    if (filters.entitlementType !== 'all') count++;
    if (filters.classification !== 'all') count++;
    if (filters.provisioningSource !== 'all') count++;
    if (filters.privilegeLevel !== 'all') count++;
    if (filters.entitlementOwner !== 'all') count++;
    if (filters.accessSource !== 'all') count++;
    if (filters.searchTerm) count++;
    return count;
  }, [filters]);

  // Sorted entitlements: pinned first
  const sortedEntitlements = useMemo(() => {
    const pinned = filteredEntitlements.filter(e => pinnedColumns.has(e.id));
    const unpinned = filteredEntitlements.filter(e => !pinnedColumns.has(e.id));
    return [...pinned, ...unpinned];
  }, [filteredEntitlements, pinnedColumns]);

  // Virtual scroll computations
  const displayUsers = viewMode === 'paginated'
    ? filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : filteredUsers;

  const totalContentHeight = displayUsers.length * ROW_HEIGHT;
  const totalContentWidth = IDENTITY_COL_WIDTH + sortedEntitlements.length * COL_WIDTH;

  const visibleRowStart = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
  const visibleRowEnd = Math.min(displayUsers.length, Math.ceil((scrollTop + containerHeight) / ROW_HEIGHT) + OVERSCAN);

  const visibleColStart = Math.max(0, Math.floor(Math.max(0, scrollLeft) / COL_WIDTH) - OVERSCAN);
  const visibleColEnd = Math.min(sortedEntitlements.length, Math.ceil((scrollLeft + containerWidth - IDENTITY_COL_WIDTH) / COL_WIDTH) + OVERSCAN);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
    setScrollLeft(e.currentTarget.scrollLeft);
  }, []);

  if (allUsersInApp.length === 0 || appEntitlements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Shield className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No Access Data Available</h3>
        <p className="text-muted-foreground">Not enough data to build an access matrix for this application.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-foreground">Access Matrix</h3>
            <Badge variant="outline" className="text-xs">
              {filteredUsers.length} identities × {sortedEntitlements.length} entitlements
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            {/* View mode toggle */}
            <div className="flex items-center border border-border rounded-md overflow-hidden">
              <Button
                variant={viewMode === 'scroll' ? 'default' : 'ghost'}
                size="sm"
                className="rounded-none h-8"
                onClick={() => setViewMode('scroll')}
              >
                <LayoutGrid className="h-3.5 w-3.5 mr-1" />
                Virtual
              </Button>
              <Button
                variant={viewMode === 'paginated' ? 'default' : 'ghost'}
                size="sm"
                className="rounded-none h-8"
                onClick={() => setViewMode('paginated')}
              >
                <List className="h-3.5 w-3.5 mr-1" />
                Paged
              </Button>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={aiModeEnabled ? 'default' : 'outline'}
                  size="sm"
                  className={aiModeEnabled ? 'bg-purple-600 hover:bg-purple-700 text-white' : ''}
                  disabled={isRunningAnalysis}
                >
                  {isRunningAnalysis ? <Loader className="h-4 w-4 mr-1 animate-spin" /> : <Sparkles className="h-4 w-4 mr-1" />}
                  AI Mode
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setAiModeEnabled(!aiModeEnabled)}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {aiModeEnabled ? 'Disable' : 'Enable'} Risk Overlay
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleRunAIAnalysis} disabled={isRunningAnalysis}>
                  <Brain className="h-4 w-4 mr-2" />
                  {isRunningAnalysis ? 'Analyzing...' : 'Analyze Full Matrix'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => exportMatrix('csv')}>
                  <FileText className="h-4 w-4 mr-2" /> CSV/Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportMatrix('pdf')}>
                  <FileText className="h-4 w-4 mr-2" /> PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportMatrix('json')}>
                  <FileText className="h-4 w-4 mr-2" /> JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Zoom controls */}
            <div className="flex items-center border border-border rounded-md overflow-hidden">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-none h-8 px-2"
                onClick={handleZoomOut}
                disabled={zoomLevel <= ZOOM_STEPS[0]}
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-none h-8 px-2 text-xs min-w-[3rem] font-mono"
                onClick={handleZoomReset}
              >
                {Math.round(zoomLevel * 100)}%
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-none h-8 px-2"
                onClick={handleZoomIn}
                disabled={zoomLevel >= ZOOM_STEPS[ZOOM_STEPS.length - 1]}
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Primary Filters Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 mb-2">
          <div className="relative lg:col-span-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search identities..."
              value={filters.searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <Select value={filters.riskLevel} onValueChange={v => setFilters(p => ({ ...p, riskLevel: v }))}>
            <SelectTrigger className="h-9"><SelectValue placeholder="Risk Level" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risk Levels</SelectItem>
              <SelectItem value="high">High Risk</SelectItem>
              <SelectItem value="medium">Medium Risk</SelectItem>
              <SelectItem value="low">Low Risk</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.department} onValueChange={v => setFilters(p => ({ ...p, department: v }))}>
            <SelectTrigger className="h-9"><SelectValue placeholder="Department" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filters.status} onValueChange={v => setFilters(p => ({ ...p, status: v }))}>
            <SelectTrigger className="h-9"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="violation">Policy Violations</SelectItem>
              <SelectItem value="outlier">Access Outliers</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            {activeFilterCount > 0 && (
              <Button variant="outline" size="sm" className="h-9" onClick={() => { setFilters({ ...DEFAULT_FILTERS }); setDebouncedSearch(''); }}>
                <X className="h-3.5 w-3.5 mr-1" />
                Clear ({activeFilterCount})
              </Button>
            )}
          </div>
        </div>

        {/* Advanced / Role-Mining Filters */}
        <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-7 px-2">
              {advancedOpen ? <ChevronUp className="h-3 w-3 mr-1" /> : <ChevronDown className="h-3 w-3 mr-1" />}
              Role Mining Filters
              {(filters.entitlementType !== 'all' || filters.classification !== 'all' || filters.provisioningSource !== 'all' || filters.privilegeLevel !== 'all' || filters.entitlementOwner !== 'all' || filters.accessSource !== 'all') && (
                <Badge className={cn(getSeverityBadgeClass('info'), 'border text-xs ml-1.5')}>Active</Badge>
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mt-2 pt-2 border-t border-border">
              <Select value={filters.entitlementType} onValueChange={v => setFilters(p => ({ ...p, entitlementType: v }))}>
                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Ent. Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {entitlementTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filters.classification} onValueChange={v => setFilters(p => ({ ...p, classification: v }))}>
                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Classification" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classifications</SelectItem>
                  {classifications.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filters.provisioningSource} onValueChange={v => setFilters(p => ({ ...p, provisioningSource: v }))}>
                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Prov. Source" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="Birthright">Birthright</SelectItem>
                  <SelectItem value="Manager Assignment">Manager Assignment</SelectItem>
                  <SelectItem value="User Request">User Request</SelectItem>
                  <SelectItem value="Exception">Exception</SelectItem>
                  <SelectItem value="Automated Rule">Automated Rule</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.privilegeLevel} onValueChange={v => setFilters(p => ({ ...p, privilegeLevel: v }))}>
                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Privilege" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {privilegeLevels.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filters.entitlementOwner} onValueChange={v => setFilters(p => ({ ...p, entitlementOwner: v }))}>
                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Owner" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Owners</SelectItem>
                  <SelectItem value="__unowned__">Unowned</SelectItem>
                  {entitlementOwners.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filters.accessSource} onValueChange={v => setFilters(p => ({ ...p, accessSource: v }))}>
                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Access Source" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="Direct">Direct</SelectItem>
                  <SelectItem value="Inherited">Inherited</SelectItem>
                  <SelectItem value="Nested">Nested</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* AI Risk Summary */}
        {aiModeEnabled && (
          <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium text-purple-900 dark:text-purple-300">AI Insights Active</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Badge className={cn(getSeverityBadgeClass('critical'), 'border text-xs')}>
                  {filteredUsers.filter(u => riskAnalysis.get(u.id)?.violations.length).length} Violations
                </Badge>
                <Badge className={cn(getSeverityBadgeClass('high'), 'border text-xs')}>
                  {filteredUsers.filter(u => (riskAnalysis.get(u.id)?.riskScore || 0) > 50).length} High Risk
                </Badge>
                <Badge className={cn(getSeverityBadgeClass('warning'), 'border text-xs')}>
                  {filteredUsers.filter(u => riskAnalysis.get(u.id)?.isOutlier).length} Outliers
                </Badge>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Virtualized Matrix */}
      <div className="border border-border rounded-lg overflow-hidden bg-card">
        {/* Legend */}
        <div className="flex items-center gap-3 px-4 py-2 border-b border-border bg-muted/30 text-xs text-muted-foreground flex-wrap">
          <span className="font-medium">Legend:</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700" /> Approved</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700" /> Temporary</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-orange-100 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-700" /> High Risk</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700" /> Violation</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-muted border border-border" /> No Access</span>
        </div>

      <div
          ref={scrollContainerRef}
          className="relative overflow-auto"
          style={{ height: '70vh' }}
          onScroll={handleScroll}
        >
          {/* Total content size for scrollbar */}
          <div style={{ width: totalContentWidth, height: totalContentHeight + ROW_HEIGHT, position: 'relative' }}>
          {/* Sticky header row - CSS Grid */}
            <div
              className="sticky top-0 z-20 bg-muted/80 backdrop-blur-sm border-b-2 border-border"
              style={{
                display: 'grid',
                gridTemplateColumns: `${IDENTITY_COL_WIDTH}px repeat(${sortedEntitlements.length}, ${COL_WIDTH}px)`,
                height: ROW_HEIGHT,
                width: totalContentWidth,
              }}
            >
              {/* Identity header - sticky left */}
              <div
                className="sticky left-0 z-30 bg-muted/95 backdrop-blur-sm border-r-2 border-border flex items-center px-3 font-semibold text-sm text-foreground"
                style={{ minWidth: IDENTITY_COL_WIDTH }}
              >
                {zoomLevel >= 0.8 && <Users className="h-4 w-4 mr-2 text-muted-foreground" />}
                <span className={cn(zoomLevel < 0.7 ? 'text-[10px]' : 'text-xs')}>Identity</span>
              </div>
              {/* Column headers — spacer spans for non-visible, real headers for visible */}
              {(() => {
                const headers: React.ReactNode[] = [];
                
                if (visibleColStart > 0) {
                  headers.push(<div key="h-spacer-left" className="border-r border-border" style={{ gridColumn: `span ${visibleColStart}` }} />);
                }
                
                for (let colIdx = visibleColStart; colIdx < visibleColEnd; colIdx++) {
                  const ent = sortedEntitlements[colIdx];
                  if (!ent) continue;
                  const isPinned = pinnedColumns.has(ent.id);
                  const isCompact = zoomLevel < 0.8;
                  
                  headers.push(
                    <div
                      key={ent.id}
                      className={cn(
                        'flex items-center justify-center text-center group relative border-r border-border',
                        isPinned && 'bg-blue-50 dark:bg-blue-950/30'
                      )}
                      style={{ minWidth: Math.max(COL_WIDTH, 16) }}
                    >
                      <TooltipProvider delayDuration={100}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            {isCompact ? (
                              <div 
                                className="flex items-center justify-center h-full w-full cursor-help px-0.5"
                                style={{ writingMode: 'vertical-lr', textOrientation: 'mixed' }}
                              >
                                <span className={cn(
                                  'font-semibold text-muted-foreground truncate',
                                  zoomLevel < 0.6 ? 'text-[8px]' : 'text-[10px]'
                                )}>
                                  {ent.displayName.length > 12 ? ent.displayName.slice(0, 12) + '…' : ent.displayName}
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 px-1 cursor-help">
                                <span className="text-xs font-semibold text-muted-foreground truncate max-w-[100px]">{ent.displayName}</span>
                                {!ent.owner && <AlertTriangle className="h-3 w-3 text-orange-500 flex-shrink-0" />}
                                <button
                                  className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                                  onClick={() => handlePinColumn(ent.id)}
                                >
                                  <Pin className={cn('h-3 w-3', isPinned ? 'text-blue-600' : 'text-muted-foreground')} />
                                </button>
                              </div>
                            )}
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="space-y-1 text-xs">
                              <p className="font-bold">{ent.displayName}</p>
                              <p>{ent.description || 'No description'}</p>
                              <p>Type: {ent.type} {ent.privilegeLevel && `• ${ent.privilegeLevel}`}</p>
                              {ent.classification?.length > 0 && <p>Tags: {ent.classification.join(', ')}</p>}
                              {!ent.owner && <p className="text-orange-600">⚠ Unowned Entitlement</p>}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  );
                }
                
                const rightCount = sortedEntitlements.length - visibleColEnd;
                if (rightCount > 0) {
                  headers.push(<div key="h-spacer-right" style={{ gridColumn: `span ${rightCount}` }} />);
                }
                
                return headers;
              })()}
            </div>

            {/* Rows - absolutely positioned for perfect grid alignment */}
            {displayUsers.slice(visibleRowStart, visibleRowEnd).map((user, idx) => {
              const userRisk = riskAnalysis.get(user.id);
              const actualIdx = visibleRowStart + idx;
              const isEvenRow = actualIdx % 2 === 0;
              const rowBg = aiModeEnabled
                ? userRisk?.violations.length ? 'bg-red-50/50 dark:bg-red-950/20'
                  : (userRisk?.riskScore || 0) > 50 ? 'bg-orange-50/50 dark:bg-orange-950/20'
                    : userRisk?.isOutlier ? 'bg-yellow-50/50 dark:bg-yellow-950/20'
                      : isEvenRow ? 'bg-muted/20' : 'bg-card'
                : isEvenRow ? 'bg-muted/20' : 'bg-card';

              // Identity cell background must match row for seamless stripes
              const identityBg = aiModeEnabled
                ? userRisk?.violations.length ? 'bg-red-50/50 dark:bg-red-950/20'
                  : (userRisk?.riskScore || 0) > 50 ? 'bg-orange-50/50 dark:bg-orange-950/20'
                    : userRisk?.isOutlier ? 'bg-yellow-50/50 dark:bg-yellow-950/20'
                      : isEvenRow ? 'bg-muted/20' : 'bg-card'
                : isEvenRow ? 'bg-muted/20' : 'bg-card';

              return (
                <div
                  key={user.id}
                  className={cn('border-b border-border hover:bg-muted/30 transition-colors', rowBg)}
                  style={{
                    position: 'absolute',
                    top: actualIdx * ROW_HEIGHT + ROW_HEIGHT, // offset by header height
                    left: 0,
                    width: totalContentWidth,
                    display: 'grid',
                    gridTemplateColumns: `${IDENTITY_COL_WIDTH}px repeat(${sortedEntitlements.length}, ${COL_WIDTH}px)`,
                    height: ROW_HEIGHT,
                    boxSizing: 'border-box',
                  }}
                >
                  {/* Identity cell - sticky left, inherits row background */}
                  <div
                    className={cn(
                      'sticky left-0 z-10 border-r-2 border-border flex items-center gap-2',
                      identityBg,
                      zoomLevel < 0.7 ? 'px-1' : 'px-3'
                    )}
                    style={{ minWidth: IDENTITY_COL_WIDTH }}
                  >
                    {zoomLevel >= 0.6 ? (
                      <div className={cn(
                        'rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0',
                        zoomLevel < 0.8 ? 'w-5 h-5 text-[9px]' : 'w-7 h-7 text-xs'
                      )}>
                        {user.name.charAt(0)}
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-[7px] font-semibold flex-shrink-0">
                        {user.name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className={cn(
                        'font-medium text-foreground truncate',
                        zoomLevel < 0.6 ? 'text-[9px]' : zoomLevel < 0.8 ? 'text-[11px]' : 'text-sm'
                      )}>
                        {zoomLevel < 0.6 ? user.name.slice(0, 10) : user.name}
                      </div>
                      {zoomLevel >= 0.8 && (
                        <div className="text-xs text-muted-foreground truncate">{user.department}</div>
                      )}
                    </div>
                    {aiModeEnabled && zoomLevel >= 0.7 && userRisk && (userRisk.riskScore > 50 || userRisk.violations.length > 0) && (
                      <Badge className={cn(getSeverityBadgeClass(userRisk.riskScore > 50 ? 'critical' : 'high'), 'border text-[10px] flex-shrink-0')}>
                        {userRisk.riskScore}
                      </Badge>
                    )}
                  </div>

                  {/* Column cells — spacer spans for non-visible, real cells for visible */}
                  {(() => {
                    const cells: React.ReactNode[] = [];
                    
                    // Left spacer for non-visible columns
                    if (visibleColStart > 0) {
                      cells.push(
                        <div
                          key="spacer-left"
                          className="border-r border-b border-border"
                          style={{ gridColumn: `span ${visibleColStart}` }}
                        />
                      );
                    }
                    
                    // Visible cells
                    for (let colIdx = visibleColStart; colIdx < visibleColEnd; colIdx++) {
                      const ent = sortedEntitlements[colIdx];
                      if (!ent) continue;
                      
                      const hasAccess = (user.access || []).some(a => a.name === ent.displayName);
                      const cellStatus = hasAccess ? getCellStatus(user, ent.displayName) : 'not-applicable';
                      const isPinned = pinnedColumns.has(ent.id);
                      const cellMinSize = Math.max(16, Math.round(16 * zoomLevel));

                      if (zoomLevel < 0.6) {
                        cells.push(
                          <div
                            key={ent.id}
                            className={cn('border-r border-b border-border flex items-center justify-center', isPinned && 'bg-blue-50/30 dark:bg-blue-950/20')}
                            style={{ minWidth: cellMinSize, minHeight: cellMinSize }}
                            onClick={() => hasAccess && setSelectedCell({ user, entitlement: ent })}
                          >
                            {hasAccess ? (
                              <div className={cn(
                                'w-full h-full cursor-pointer',
                                cellStatus === 'approved' && 'bg-green-200 dark:bg-green-800/50',
                                cellStatus === 'temporary' && 'bg-yellow-200 dark:bg-yellow-800/50',
                                cellStatus === 'violation' && 'bg-red-200 dark:bg-red-800/50',
                                cellStatus === 'high-risk' && 'bg-orange-200 dark:bg-orange-800/50',
                              )} />
                            ) : (
                              <div className="w-full h-full bg-muted/20" />
                            )}
                          </div>
                        );
                      } else if (zoomLevel < 0.8) {
                        const dotSize = Math.max(8, Math.round(12 * zoomLevel));
                        cells.push(
                          <div
                            key={ent.id}
                            className={cn('border-r border-b border-border flex items-center justify-center', isPinned && 'bg-blue-50/30 dark:bg-blue-950/20')}
                            style={{ minWidth: cellMinSize, minHeight: cellMinSize }}
                            onClick={() => hasAccess && setSelectedCell({ user, entitlement: ent })}
                          >
                            {hasAccess ? (
                              <div
                                className={cn(
                                  'rounded-sm cursor-pointer',
                                  cellStatus === 'approved' && 'bg-green-400 dark:bg-green-500',
                                  cellStatus === 'temporary' && 'bg-yellow-400 dark:bg-yellow-500',
                                  cellStatus === 'violation' && 'bg-red-400 dark:bg-red-500',
                                  cellStatus === 'high-risk' && 'bg-orange-400 dark:bg-orange-500',
                                )}
                                style={{ width: dotSize, height: dotSize }}
                              />
                            ) : (
                              <div
                                className="rounded-sm bg-muted/40"
                                style={{ width: dotSize, height: dotSize }}
                              />
                            )}
                          </div>
                        );
                      } else {
                        cells.push(
                          <div
                            key={ent.id}
                            className={cn('flex items-center justify-center border-r border-b border-border p-1', isPinned && 'bg-blue-50/30 dark:bg-blue-950/20')}
                            style={{ minWidth: cellMinSize }}
                            onClick={() => hasAccess && setSelectedCell({ user, entitlement: ent })}
                          >
                            {hasAccess ? (
                              <div className={cn('w-full h-9 rounded-md border flex items-center justify-center cursor-pointer transition-all hover:scale-105', getCellColor(cellStatus))}>
                                {getCellIcon(cellStatus)}
                              </div>
                            ) : (
                              <div className="w-full h-9 rounded-md bg-muted/30 border border-border" />
                            )}
                          </div>
                        );
                      }
                    }
                    
                    // Right spacer for non-visible columns
                    const rightCount = sortedEntitlements.length - visibleColEnd;
                    if (rightCount > 0) {
                      cells.push(
                        <div
                          key="spacer-right"
                          className="border-b border-border"
                          style={{ gridColumn: `span ${rightCount}` }}
                        />
                      );
                    }
                    
                    return cells;
                  })()}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pagination (paged mode) */}
      {viewMode === 'paginated' && (
        <StandardPagination
          totalItems={filteredUsers.length}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[50, 100, 200, 500]}
        />
      )}

      {/* Results summary */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground bg-card rounded-lg border border-border">
          <Filter className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p>No identities match the current filters.</p>
        </div>
      ) : (
        <div className="text-sm text-muted-foreground bg-card p-3 rounded-lg border border-border">
          Showing {viewMode === 'paginated' ? `page ${currentPage} of ${Math.ceil(filteredUsers.length / pageSize)} — ` : ''}
          {filteredUsers.length} of {allUsersInApp.length} identities × {sortedEntitlements.length} of {appEntitlements.length} entitlements
        </div>
      )}

      {/* AI Report Modal */}
      {showAiReportModal && aiReport && (
        <AIReportModal
          report={aiReport}
          onClose={() => setShowAiReportModal(false)}
          onRerun={() => { setShowAiReportModal(false); handleRunAIAnalysis(); }}
        />
      )}

      {/* Cell Detail Modal */}
      <Dialog open={!!selectedCell} onOpenChange={() => setSelectedCell(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Access Details</DialogTitle>
          </DialogHeader>
          {selectedCell && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium text-foreground">User</h5>
                  <p className="text-foreground">{selectedCell.user.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedCell.user.department}</p>
                </div>
                <div>
                  <h5 className="font-medium text-foreground">Entitlement</h5>
                  <p className="text-foreground">{selectedCell.entitlement.displayName}</p>
                  <p className="text-sm text-muted-foreground">{selectedCell.entitlement.description}</p>
                  <div className="flex gap-1 mt-1">
                    <Badge className={cn(getPrivilegeBadgeClass(selectedCell.entitlement.privilegeLevel || 'read'), 'border text-xs')}>
                      {selectedCell.entitlement.privilegeLevel || 'Read'}
                    </Badge>
                    <Badge variant="outline" className="text-xs">{selectedCell.entitlement.type}</Badge>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" size="sm">
                  <Eye className="h-4 w-4 mr-2" /> View Audit History
                </Button>
                <Button variant="outline" className="flex-1" size="sm">
                  <Shield className="h-4 w-4 mr-2" /> Launch Review
                </Button>
                <Button variant="destructive" className="flex-1" size="sm">
                  <AlertTriangle className="h-4 w-4 mr-2" /> Revoke Access
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApplicationAccessMatrixTab;
