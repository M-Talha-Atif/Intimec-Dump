import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { shortDate } from "@/utils/dateFormat";
import { RolePermissionsList } from './access-items/RolePermissionsList';
import {
  Info,
  Shield,
  Users,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  FileText,
  ExternalLink,
  ShoppingCart,
  Calendar,
  HelpCircle,
  Loader2,
  Key,
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { AccessItem } from '@/data/mock-access-portal';
import { Progress } from '@/components/ui/progress';
import { useRoleDetails } from '@/hooks/useRoleDetails';
import { useEntitlementDetail } from '@/hooks/useEntitlements';
import { Loader } from '@/components/ui/Loader';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getRiskColorForAccessItem } from '@/components/app-permissions/role-management/utils/roleUtils';
import { getRiskBadgeClass, getRiskIconColor } from '@/utils/getRiskColor';
import EntitlementOverviewViewer from '@/components/entitlements/viewer/EntitlementOverviewViewer';
import EntitlementAttributesViewer from '@/components/entitlements/viewer/EntitlementAttributesViewer';
import EntitlementRiskViewer from '@/components/entitlements/viewer/EntitlementRiskViewer';
import EntitlementMembersViewer from '@/components/entitlements/viewer/EntitlementMembersViewer';
import IconTabs from '@/components/shared/IconTabs';
import {
  Eye,
  Bot,
  LayoutDashboard,
  ShieldCheck,
  Link,
  Target,
} from 'lucide-react';

interface AccessItemDetailsModalProps {
  item: AccessItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddToCart: (item: AccessItem) => void;
  isInCart: boolean;
  getCartCount?: (itemId: string) => number;
}

const AccessItemDetailsModal: React.FC<AccessItemDetailsModalProps> = ({
  item,
  open,
  onOpenChange,
  onAddToCart,
  isInCart,
  getCartCount,
}) => {
  const [activeTab, setActiveTab] = useState('details');
  const [entitlementTab, setEntitlementTab] = useState('overview');

  // Fetch role details if item is a role
  const isRoleType = item?.type === 'role' || item?.type === ('internal_role' as any);
  const { roleDetails, loading: roleLoading } = useRoleDetails(
    isRoleType ? item.id : null
  );

  // Fetch entitlement details if item is an entitlement
  const { entitlement, loading: entitlementLoading, error: entitlementError } = useEntitlementDetail(
    open && item?.type === 'entitlement' ? item.id : null
  );

  if (!item) return null;

  const isEntitlement = item.type === 'entitlement';
  const Icon = isEntitlement
    ? Key
    : ((LucideIcons as any)[item.icon] || LucideIcons.Box);
  const cartCount = getCartCount ? getCartCount(item.id) : 0;

  // Safe array accessors with default empty arrays
  const tags = item.tags || [];
  const complianceFlags = item.complianceFlags || [];
  const approvalWorkflow = item.approvalWorkflow || [];
  const targetSystems = item.targetSystems || [];
  const requiredTraining = item.requiredTraining || [];

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRiskColor = (risk: string) => {
    switch (risk.toUpperCase()) {
      case "HIGH": return "bg-destructive/10 text-destructive border-destructive/20";
      case "MEDIUM": return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400";
      case "LOW": return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400";
      default: return "bg-muted text-muted-foreground";
    }
  };

  // Entitlement view
  if (isEntitlement) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="flex flex-col p-0 h-full sm:max-w-3xl">
          <div className="flex flex-col h-full">
            {/* Fixed Header with Add to Cart */}
            <div className="flex-shrink-0 px-6 py-4">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/10 flex-shrink-0">
                  <Key className={cn("h-6 w-6", getRiskIconColor(item.riskLevel))} />
                </div>
                <div className="flex-1 min-w-0">
                  <SheetTitle className="text-xl font-semibold truncate">{item.name}</SheetTitle>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="capitalize text-xs px-2 py-0.5">
                      Entitlement
                    </Badge>
                    <Badge className={cn('text-xs px-2 py-0.5', getRiskBadgeClass(item.riskLevel))}>
                      {item.riskLevel?.charAt(0).toUpperCase() + item.riskLevel?.slice(1)}
                    </Badge>
                    <Badge variant="outline" className="border-blue-300 bg-blue-50 text-blue-700 text-xs px-2 py-0.5">
                      <Eye className="h-3 w-3 mr-1" />
                      Viewing
                    </Badge>
                  </div>
                  <SheetDescription className="text-sm line-clamp-2 mt-2">
                    {item.description}
                  </SheetDescription>
                </div>
                <Button size="default" onClick={() => onAddToCart(item)} className="shrink-0 mr-4">
                  <ShoppingCart className="h-4 w-4 mr-4" />
                  {cartCount > 0 ? `In Cart (${cartCount})` : 'Add to Cart'}
                </Button>
              </div>
            </div>

            {/* Scrollable Entitlement Content */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              {entitlementLoading && (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2 text-sm text-muted-foreground">Loading entitlement details...</span>
                </div>
              )}

              {entitlementError && (
                <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                  <AlertTriangle className="h-12 w-12 text-destructive mb-3" />
                  <p className="font-medium text-destructive">Failed to load entitlement</p>
                  <p className="text-sm text-muted-foreground mt-1">{entitlementError}</p>
                </div>
              )}

              {!entitlementLoading && !entitlementError && entitlement && (
                <div className="px-6 pb-6 space-y-0">
                  {/* Entitlement Viewer Header Content */}
                  <div>
                    {/* Description */}
                    <p className="text-slate-600 mb-4 max-w-3xl">
                      {entitlement.description}
                    </p>

                    {/* AI summary */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <div className="flex items-start space-x-3">
                        <Bot className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <h3 className="font-medium text-blue-900 mb-1">
                            AI-generated Summary
                          </h3>
                          <p className="text-sm text-blue-800">
                            This entitlement provides access to {entitlement.resourceName ?? '-'} with{' '}
                            {(entitlement.riskLevel ?? 'Low').toLowerCase()} business impact.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Metadata grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                      {/* Resource */}
                      <div className="flex items-center space-x-3">
                        <FileText className="h-4 w-4 text-slate-500" />
                        <div>
                          <div className="text-xs text-slate-500 uppercase tracking-wide">
                            Resource
                          </div>
                          <div className="font-medium">{entitlement.resourceName ?? '-'}</div>
                        </div>
                      </div>

                      {/* Type */}
                      <div className="flex items-center space-x-3">
                        <Target className="h-4 w-4 text-slate-500" />
                        <div>
                          <div className="text-xs text-slate-500 uppercase tracking-wide">
                            Type
                          </div>
                          <div className="font-medium">
                            {entitlement.kind ??
                              (entitlement.attributes as any)?.type ??
                              entitlement.objectClass ??
                              'Standard'}
                          </div>
                        </div>
                      </div>

                      {/* Risk */}
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="h-4 w-4 text-slate-500" />
                        <div>
                          <div className="text-xs text-slate-500 uppercase tracking-wide">
                            Risk
                          </div>
                          <Badge
                            variant="outline"
                            className={cn("px-2 py-0.5 mt-0.5 font-normal", getRiskColor(entitlement.riskLevel ?? 'Low'))}
                          >
                            {(entitlement.riskLevel ?? 'Low').charAt(0).toUpperCase() + (entitlement.riskLevel ?? 'Low').slice(1)}
                          </Badge>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="flex items-center space-x-3">
                        <ShieldCheck className="h-4 w-4 text-slate-500" />
                        <div>
                          <div className="text-xs text-slate-500 uppercase tracking-wide">
                            Status
                          </div>
                          <Badge
                            variant="outline"
                            className={
                              entitlement.lifecycle === "Active"
                                ? "mt-0.5 px-2 py-0.5 bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 font-normal"
                                : "mt-0.5 px-2 py-0.5 bg-muted text-muted-foreground border-border font-normal"
                            }
                          >
                            {entitlement.lifecycle ?? "Unknown"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Classification tags */}
                    <div className="flex items-center space-x-2 mb-4">
                      <span className="text-sm font-medium text-slate-700">Tags:</span>
                      {(entitlement.classification ?? []).length > 0 ? (
                        entitlement.classification!.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-slate-400">Unclassified</span>
                      )}
                    </div>
                  </div>

                  {/* Entitlement Tabs */}
                  <Tabs value={entitlementTab} onValueChange={setEntitlementTab}>
                    <div>
                      <IconTabs
                        columns={4}
                        tabs={[
                          { value: "overview", label: "Overview", icon: LayoutDashboard },
                          { value: "attributes", label: "Attributes", icon: ShieldCheck },
                          { value: "members", label: "Members", icon: Users },
                          { value: "risk", label: "Risk Analysis", icon: AlertTriangle },
                        ]}
                      />
                    </div>
                    <div>
                      <TabsContent value="overview" className="mt-4">
                        <EntitlementOverviewViewer entitlement={entitlement} />
                      </TabsContent>
                      <TabsContent value="attributes" className="mt-4">
                        <EntitlementAttributesViewer entitlement={entitlement} />
                      </TabsContent>
                      <TabsContent value="members" className="mt-4">
                        <EntitlementMembersViewer entitlement={entitlement} readOnly/>
                      </TabsContent>
                      <TabsContent value="risk" className="mt-4">
                        <EntitlementRiskViewer entitlement={entitlement} />
                      </TabsContent>
                    </div>
                  </Tabs>
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Internal role type view
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col p-0 h-full">
        <div className="flex flex-col h-full">
          {/* Fixed Header Section */}
          <div className="flex-shrink-0 px-6 py-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/10 flex-shrink-0">
                <Icon className={cn("h-6 w-6", getRiskIconColor(item.riskLevel))} />
              </div>
              <div className="flex-1 min-w-0">
                <SheetTitle className="text-xl font-semibold truncate">{item.name}</SheetTitle>

                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="capitalize text-xs px-2 py-0.5">
                    {item.type === 'internal-role'
                      ? 'Internal Role'
                      : item.type?.charAt(0).toUpperCase() + item.type?.slice(1)}
                  </Badge>
                  <Badge className={cn('text-xs px-2 py-0.5', getRiskBadgeClass(item.riskLevel))}>
                    {item.riskLevel?.charAt(0).toUpperCase() + item.riskLevel?.slice(1)}
                  </Badge>
                </div>
                <SheetDescription className="text-sm line-clamp-2 mt-2">
                  {item.description}
                </SheetDescription>
              </div>
              <Button size="default" onClick={() => onAddToCart(item)} className="shrink-0 mr-4">
                <ShoppingCart className="h-4 w-4 mr-4" />
                {cartCount > 0 ? `In Cart (${cartCount})` : 'Add to Cart'}
              </Button>
            </div>
          </div>

          {/* Fixed Tabs Navigation */}
          <div className="flex-shrink-0 px-6 pt-3">
            <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-muted/50">
                <TabsTrigger value="details" className="text-xs py-2 data-[state=active]:bg-background">
                  Details
                </TabsTrigger>
                <TabsTrigger value="permissions" className="text-xs py-2 data-[state=active]:bg-background">
                  Permissions
                </TabsTrigger>
                <TabsTrigger value="approval" className="text-xs py-2 data-[state=active]:bg-background">
                  Approval
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Scrollable Tab Content Area */}
          <div className="flex-1 min-h-0 px-6 overflow-y-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">

              {/* Details Tab */}
              <TabsContent value="details" className="space-y-3 mt-4 pb-6">
                {/* Role Details Section */}
                {isRoleType  && (
                  <>
                    {roleLoading ? (
                      <Card>
                        <CardContent className="flex items-center justify-center py-16">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          <span className="ml-2 text-sm text-muted-foreground">Loading details...</span>
                        </CardContent>
                      </Card>
                    ) : roleDetails ? (
                      <div className="space-y-6">
                        {/* Role Information */}
                        <Card>
                          <CardHeader className="px-6">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                              <Shield className="h-4 w-4 text-muted-foreground" />
                              Role Information
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/50 cursor-help ml-1" />
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-xs">
                                  <p>Core details and configuration of this role</p>
                                </TooltipContent>
                              </Tooltip>
                            </CardTitle>
                          </CardHeader>

                          <CardContent className="px-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4 text-sm">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1">
                                  <p className="text-xs font-medium text-muted-foreground">Role Name</p>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <HelpCircle className="h-3 w-3 text-muted-foreground/30 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="text-xs">
                                      <p>The unique identifier and display name of this role</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                                <p className="text-sm font-medium">{roleDetails.roleName}</p>
                              </div>

                              <div className="space-y-1">
                                <div className="flex items-center gap-1">
                                  <p className="text-xs font-medium text-muted-foreground">Role Type</p>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <HelpCircle className="h-3 w-3 text-muted-foreground/30 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="text-xs">
                                      <p>Classification of the role (e.g., Business, Technical, System)</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                                <Badge variant="outline" className="text-xs font-normal">
                                  {roleDetails.roleType}
                                </Badge>
                              </div>

                              <div className="space-y-1">
                                <div className="flex items-center gap-1">
                                  <p className="text-xs font-medium text-muted-foreground">Risk Level</p>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <HelpCircle className="h-3 w-3 text-muted-foreground/30 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="text-xs">
                                      <p>Indicates the potential security and compliance impact</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                                <Badge
                                  className={cn(
                                    'text-xs font-medium',
                                    getRiskBadgeClass(roleDetails.riskLevel)
                                  )}
                                >
                                  {roleDetails.riskLevel}
                                </Badge>
                              </div>

                              <div className="space-y-1">
                                <div className="flex items-center gap-1">
                                  <p className="text-xs font-medium text-muted-foreground">Status</p>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <HelpCircle className="h-3 w-3 text-muted-foreground/30 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="text-xs">
                                      <p>Current state of the role (Active roles are available for assignment)</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                                <Badge
                                  variant={roleDetails.isActive ? 'default' : 'secondary'}
                                  className="text-xs font-normal"
                                >
                                  {roleDetails.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1">
                                  <p className="text-xs font-medium text-muted-foreground">Description</p>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <HelpCircle className="h-3 w-3 text-muted-foreground/30 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="text-xs">
                                      <p>Detailed explanation of the role's purpose and scope</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                                {roleDetails.description ? (
                                  <p className="text-sm leading-relaxed">{roleDetails.description}</p>
                                ) : (
                                  <p className="text-sm text-muted-foreground italic">No description provided</p>
                                )}
                              </div>

                              <div className="space-y-1">
                                <div className="flex items-center gap-1">
                                  <p className="text-xs font-medium text-muted-foreground">
                                    Business Justification
                                  </p>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <HelpCircle className="h-3 w-3 text-muted-foreground/30 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="text-xs">
                                      <p>The business reason for creating and maintaining this role</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                                {roleDetails.businessJustification ? (
                                  <p className="text-sm leading-relaxed">{roleDetails.businessJustification}</p>
                                ) : (
                                  <p className="text-sm text-muted-foreground italic">No business justification provided</p>
                                )}
                              </div>
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center gap-1">
                                <p className="text-xs font-medium text-muted-foreground">Owners</p>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <HelpCircle className="h-3 w-3 text-muted-foreground/30 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="text-xs">
                                    <p>Users responsible for managing and approving this role</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>

                              {roleDetails.ownersData && roleDetails.ownersData.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {roleDetails.ownersData.map((owner) => (
                                    <Badge key={owner.id} variant="outline" className="text-xs">
                                      {owner.displayName || `${owner.firstName} ${owner.lastName}`}
                                    </Badge>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-muted-foreground italic">No owners assigned</p>
                              )}
                            </div>

                          </CardContent>
                        </Card>

                        {/* Usage Statistics */}
                        <Card>
                          <CardHeader className="px-6">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              Usage Statistics
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/50 cursor-help ml-1" />
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-xs">
                                  <p>Metrics showing how this role is being used</p>
                                </TooltipContent>
                              </Tooltip>
                            </CardTitle>
                          </CardHeader>

                          <CardContent className="px-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1">
                                  <p className="text-xs font-medium text-muted-foreground">Users Assigned</p>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <HelpCircle className="h-3 w-3 text-muted-foreground/30 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="text-xs">
                                      <p>Total number of users currently assigned this role</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                                <p className="text-lg font-semibold text-foreground">
                                  {roleDetails.userCount}
                                </p>
                              </div>

                              <div className="space-y-1">
                                <div className="flex items-center gap-1">
                                  <p className="text-xs font-medium text-muted-foreground">Permissions</p>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <HelpCircle className="h-3 w-3 text-muted-foreground/30 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="text-xs">
                                      <p>Number of individual permissions included in this role</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                                <p className="text-lg font-semibold text-foreground">
                                  {roleDetails.permissionsCount}
                                </p>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1">
                                  <p className="text-xs font-medium text-muted-foreground">Manual Assignments</p>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <HelpCircle className="h-3 w-3 text-muted-foreground/30 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="text-xs">
                                      <p>Whether users can be manually assigned to this role</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                                <Badge
                                  variant={roleDetails.hasManualAssignments ? 'default' : 'secondary'}
                                  className="text-xs font-normal"
                                >
                                  {roleDetails.hasManualAssignments ? 'Yes' : 'No'}
                                </Badge>
                              </div>

                              <div className="space-y-1">
                                <div className="flex items-center gap-1">
                                  <p className="text-xs font-medium text-muted-foreground">Dynamic Rules</p>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <HelpCircle className="h-3 w-3 text-muted-foreground/30 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="text-xs">
                                      <p>Whether automated rules exist for assigning this role</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                                <Badge
                                  variant={roleDetails.hasDynamicRules ? 'default' : 'secondary'}
                                  className="text-xs font-normal"
                                >
                                  {roleDetails.hasDynamicRules ? 'Yes' : 'No'}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Role Tags */}
                        {roleDetails.tags?.length > 0 && (
                          <Card>
                            <CardHeader className="px-6">
                              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                Role Tags
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/50 cursor-help ml-1" />
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="text-xs">
                                    <p>Labels used for categorization and search</p>
                                  </TooltipContent>
                                </Tooltip>
                              </CardTitle>
                            </CardHeader>

                            <CardContent className="px-6">
                              <div className="flex flex-wrap gap-2">
                                {roleDetails.tags.map((tag) => (
                                  <Badge
                                    key={tag}
                                    variant="secondary"
                                    className="text-xs font-normal px-2 py-0.5"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Audit Information */}
                        <Card>
                          <CardHeader className="px-6">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              Audit Information
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/50 cursor-help ml-1" />
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-xs">
                                  <p>Creation and modification tracking details</p>
                                </TooltipContent>
                              </Tooltip>
                            </CardTitle>
                          </CardHeader>

                          <CardContent className="px-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1">
                                <p className="text-xs font-medium text-muted-foreground">Created By</p>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <HelpCircle className="h-3 w-3 text-muted-foreground/30 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="text-xs">
                                    <p>User who originally created this role</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                              <p className="text-sm font-medium">{roleDetails.createdByName}</p>
                              <p className="text-xs text-muted-foreground/70">
                                {formatDate(roleDetails.createdAt)}
                              </p>
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center gap-1">
                                <p className="text-xs font-medium text-muted-foreground">Last Updated By</p>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <HelpCircle className="h-3 w-3 text-muted-foreground/30 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="text-xs">
                                    <p>User who last modified this role</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                              <p className="text-sm font-medium">{roleDetails.updatedByName}</p>
                              <p className="text-xs text-muted-foreground/70">
                                {formatDate(roleDetails.updatedAt)}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ) : null}
                  </>
                )}
              </TabsContent>

              {/* Access & Permissions Tab */}
              <TabsContent value="permissions" className="space-y-4 mt-4 pb-6">
                {isRoleType  && roleDetails ? (
                  <RolePermissionsList
                    roleId={item.id}
                    permissionsCount={roleDetails.permissionsCount}
                  />
                ) : (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <Shield className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {item.type === 'role'
                          ? 'Loading permissions...'
                          : 'Permissions not available for this item type'}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Approval Workflow Tab */}
              <TabsContent value="approval" className="space-y-4 mt-4 pb-6">
                <Card className="shadow-sm border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2 text-foreground">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      Approval Workflow
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {approvalWorkflow.length > 0 ? (
                      <div className="space-y-3">
                        {approvalWorkflow.map((approver, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-semibold shrink-0">
                              {index + 1}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{approver}</p>
                              <p className="text-xs text-muted-foreground">Approval required</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground py-2">
                        No approval workflow configured
                      </p>
                    )}
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-4">
                  <Card className="shadow-sm border-border/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2 text-foreground">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        Provisioning
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-2xl font-bold text-primary">
                        {item.provisioningTime || 2}h
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Estimated time</p>
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm border-border/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2 text-foreground">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        Validity
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-2xl font-bold text-primary">{item.maxValidityDays}d</p>
                      <p className="text-xs text-muted-foreground mt-1">Maximum duration</p>
                    </CardContent>
                  </Card>
                </div>

                {targetSystems.length > 0 && (
                  <Card className="shadow-sm border-border/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-foreground">Target Systems</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex flex-wrap gap-1.5">
                        {targetSystems.map((system) => (
                          <Badge key={system} variant="outline" className="text-xs px-2 py-0.5">
                            {system}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AccessItemDetailsModal;