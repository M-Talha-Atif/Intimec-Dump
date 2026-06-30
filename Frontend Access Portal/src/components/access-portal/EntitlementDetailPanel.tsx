import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Loader } from '@/components/ui/Loader';
import {
  Key,
  ShoppingCart,
  Shield,
  Clock,
  Users,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  Globe,
  Tag,
  Lock,
  Timer,
} from 'lucide-react';
import { useEntitlementDetail } from '@/hooks/useEntitlements';
import { getRiskBadgeClass } from '@/utils/getRiskColor';
import { cn } from '@/lib/utils';
import { AccessItem } from '@/data/mock-access-portal';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface EntitlementDetailPanelProps {
  entitlementId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddToCart?: (item: AccessItem) => void;
  cartCount?: number;
  tileId?: string;
  category?: string;
  allowRequestForOthers?: boolean;
}

const capitalize = (s: string) => {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
};

const formatDuration = (ms: number | null) => {
  if (!ms || ms === 0) return 'Unlimited';
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h`;
};

const formatDate = (epochMs: number | null) => {
  if (!epochMs) return 'N/A';
  return new Date(epochMs).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const EntitlementDetailPanel: React.FC<EntitlementDetailPanelProps> = ({
  entitlementId,
  open,
  onOpenChange,
  onAddToCart,
  cartCount = 0,
  tileId,
  category,
  allowRequestForOthers,
}) => {
  const { entitlement, loading, error } = useEntitlementDetail(open ? entitlementId : null);

  const handleAddToCart = () => {
    if (!entitlement || !onAddToCart) return;

    const accessItem: AccessItem = {
      id: entitlement.id,
      name: entitlement.displayName,
      type: 'entitlement',
      description: entitlement.description || '',
      category: category || '',
      icon: 'Key',
      riskLevel: (entitlement.riskLevel?.toLowerCase() || 'low') as 'low' | 'medium' | 'high' | 'critical',
      owner: entitlement.ownerId || 'Unowned',
      department: '',
      requestCount: 0,
      tags: entitlement.classification || [],
      approvalWorkflow: [],
      allowRequestForOthers: allowRequestForOthers ?? false,
      tileId: tileId || '',
      childCount: 0,
      hierarchyLevel: 'entitlement',
      hierarchyPath: [],
      applicationName: entitlement.resourceName || '',
      expiringUsers: 0,
      parentId: undefined,
      ownerEmail: '',
      ownerDepartment: '',
      businessJustification: '',
      customIcon: '',
      lastUsedDate: '',
      avgUsagePerMonth: 0,
      provisioningTime: 0,
      approvalRate: 0,
      totalRequests: 0,
    };

    onAddToCart(accessItem);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl flex flex-col p-0 h-full">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-6 py-4">
            <SheetHeader className="p-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10">
                  <Key className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <SheetTitle className="text-lg truncate">
                    {loading ? 'Loading...' : entitlement?.displayName || 'Entitlement Details'}
                  </SheetTitle>
                  <SheetDescription className="truncate">
                    {loading ? 'Fetching entitlement details' : entitlement?.kind ? capitalize(entitlement.kind) : 'Entitlement'}
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>
          </div>

          {/* Scrollable Content */}
          <ScrollArea className="flex-1 min-h-0">
            <div className="px-6 pb-6 space-y-6">
              {loading && (
                <div className="flex items-center justify-center py-16">
                  <Loader size="lg" />
                </div>
              )}

              {error && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <AlertCircle className="h-12 w-12 text-destructive mb-3" />
                  <p className="font-medium text-destructive">Failed to load entitlement</p>
                  <p className="text-sm text-muted-foreground mt-1">{error}</p>
                </div>
              )}

              {!loading && !error && entitlement && (
                <>
                  {/* Status Badges Row */}
                  <div className="flex flex-wrap gap-2">
                    {entitlement.riskLevel && (
                      <Badge className={cn('font-medium', getRiskBadgeClass(entitlement.riskLevel))}>
                        {capitalize(entitlement.riskLevel)} Risk
                      </Badge>
                    )}
                    {entitlement.lifecycle && (
                      <Badge variant={entitlement.lifecycle === 'Active' ? 'default' : 'secondary'}>
                        {entitlement.lifecycle}
                      </Badge>
                    )}
                    {entitlement.kind && (
                      <Badge variant="outline">
                        {capitalize(entitlement.kind)}
                      </Badge>
                    )}
                    <Badge variant={entitlement.requestable ? 'default' : 'secondary'}>
                      {entitlement.requestable ? 'Requestable' : 'Not Requestable'}
                    </Badge>
                  </div>

                  {/* Description */}
                  {entitlement.description && (
                    <div>
                      <h4 className="text-sm font-medium mb-1.5">Description</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {entitlement.description}
                      </p>
                    </div>
                  )}

                  <Separator />

                  {/* General Information */}
                  <div>
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      General Information
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <DetailField
                        label="Application"
                        value={entitlement.resourceName || 'N/A'}
                        icon={<Globe className="h-3.5 w-3.5" />}
                      />
                      <DetailField
                        label="Object Class"
                        value={entitlement.objectClass || 'N/A'}
                        icon={<Tag className="h-3.5 w-3.5" />}
                      />
                      <DetailField
                        label="Source UID"
                        value={entitlement.sourceUid || 'N/A'}
                        icon={<Key className="h-3.5 w-3.5" />}
                        truncate
                      />
                      <DetailField
                        label="Identity Type"
                        value={entitlement.identityType ? capitalize(entitlement.identityType) : 'N/A'}
                        icon={<Users className="h-3.5 w-3.5" />}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Governance */}
                  <div>
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Governance
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <DetailField
                        label="Owner"
                        value={entitlement.ownerId || 'Unowned'}
                        icon={<Users className="h-3.5 w-3.5" />}
                        truncate
                      />
                      <DetailField
                        label="Privilege Level"
                        value={entitlement.privilegeLevel ? capitalize(entitlement.privilegeLevel) : 'N/A'}
                        icon={<Lock className="h-3.5 w-3.5" />}
                      />
                      <DetailField
                        label="Require Approval"
                        value={entitlement.requireApproval ? 'Yes' : 'No'}
                        icon={entitlement.requireApproval
                          ? <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                          : <XCircle className="h-3.5 w-3.5 text-muted-foreground" />}
                      />
                      <DetailField
                        label="Auto Grant"
                        value={entitlement.allowedAutomatedGrant ? 'Allowed' : 'Not Allowed'}
                        icon={entitlement.allowedAutomatedGrant
                          ? <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                          : <XCircle className="h-3.5 w-3.5 text-muted-foreground" />}
                      />
                    </div>
                  </div>

                  {/* Classification Tags */}
                  {entitlement.classification && entitlement.classification.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                          <Tag className="h-4 w-4" />
                          Classification
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {entitlement.classification.map((tag, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Risk Information */}
                  {entitlement.riskReason && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="text-sm font-medium mb-1.5 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          Risk Reason
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {entitlement.riskReason}
                        </p>
                      </div>
                    </>
                  )}

                  <Separator />

                  {/* Duration and Assignment */}
                  <div>
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <Timer className="h-4 w-4" />
                      Duration and Assignment
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <DetailField
                        label="Max Duration"
                        value={formatDuration(entitlement.maxDurationMs)}
                        icon={<Clock className="h-3.5 w-3.5" />}
                      />
                      <DetailField
                        label="Auto Expire"
                        value={formatDuration(entitlement.autoExpireDurationMs)}
                        icon={<Timer className="h-3.5 w-3.5" />}
                      />
                      <DetailField
                        label="Assigned Users"
                        value={String(entitlement.assignedUsersCount ?? 0)}
                        icon={<Users className="h-3.5 w-3.5" />}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Timestamps */}
                  <div>
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Timestamps
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <DetailField
                        label="Created"
                        value={formatDate(entitlement.createdAt)}
                      />
                      <DetailField
                        label="Last Updated"
                        value={formatDate(entitlement.updatedAt)}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </ScrollArea>

          {/* Footer with Add to Cart */}
          {!loading && !error && entitlement && onAddToCart && (
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {entitlement.requestable ? (
                  <span className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Available for request
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                    Not available for request
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handleAddToCart}
                        disabled={!entitlement.requestable}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        {cartCount > 0 ? `In Cart (${cartCount})` : 'Add to Cart'}
                      </Button>
                    </TooltipTrigger>
                    {!entitlement.requestable && (
                      <TooltipContent>
                        <p>This entitlement is not available for self-service request</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          )}

          {/* Footer for error/loading state */}
          {(loading || error) && (
            <div className="px-6 py-4 flex justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

/** Reusable detail field used in the grid sections */
const DetailField: React.FC<{
  label: string;
  value: string;
  icon?: React.ReactNode;
  truncate?: boolean;
}> = ({ label, value, icon, truncate }) => (
  <div className="space-y-1">
    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
      {icon}
      {label}
    </p>
    <p className={cn('text-sm font-medium', truncate && 'truncate')} title={truncate ? value : undefined}>
      {value}
    </p>
  </div>
);

export default EntitlementDetailPanel;