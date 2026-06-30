import React, { useEffect, useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Clock,
  CheckCircle,
  XCircle,
  Download,
  Settings,
  Share2,
  User,
  FileText,
  Shield,
  Activity,
  Calendar,
  Loader2,
  Package,
  Info,
  Layers,
  Users,
  UserCheck,
  MessageSquare,
  CheckSquare,
  Mail
} from 'lucide-react';
import { format } from 'date-fns';
import { useRequestDetails, RequestDetails } from '@/hooks/useRequestDetails';
import { BackendAccessRequest } from '@/hooks/useRequestHistory';
import WithdrawRequestDialog from './WithdrawRequestDialog';
import { useWithdrawRequest } from '@/hooks/useWithdrawRequest';
import { useCart } from '@/hooks/useCart';
import { cn } from "@/lib/utils";
import { getRiskColor } from '@/components/app-permissions/role-management/utils/roleUtils';
import { getDecisionColor, getDecisionBadgeVariant, getDecisionIconColor } from '@/utils/decisionColors';
import { getStatusColor, getStatusBadgeVariant } from '@/utils/statusColors';
import { getRiskBadgeClass, getRiskIconColor } from '@/utils/getRiskColor';

interface RequestDetailsModalProps {
  request: BackendAccessRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWithdraw?: () => void;
  onDuplicate?: () => void;
  onExtend?: () => void;
}

const RequestDetailsModal: React.FC<RequestDetailsModalProps> = ({
  request,
  open,
  onOpenChange,
  onWithdraw,
  onDuplicate,
  onExtend,
}) => {
  const { fetchRequestDetails, loading } = useRequestDetails();
  const [details, setDetails] = useState<RequestDetails | null>(null);
  const { withdrawRequest, withdrawing } = useWithdrawRequest();
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const { refreshCart } = useCart();

  useEffect(() => {
    if (open && request?.id) {
      loadDetails();
    } else {
      setDetails(null);
    }
  }, [open, request?.id]);

  const loadDetails = async () => {
    if (!request?.id) return;
    const data = await fetchRequestDetails(request.id);
    if (data) {
      setDetails(data);
    }
  };

  if (!request) return null;

  const getStatusIcon = (status: string) => {
    const normalizedStatus = status.toLowerCase().replace('_', '-');
    switch (normalizedStatus) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'submitted':
      case 'pending-approval':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'provisioned':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      default:
        return <Activity className="h-5 w-5" />;
    }
  };

  const getRiskBadgeVariant = (score: number) => {
    if (score >= 80) return 'destructive';
    if (score >= 60) return 'default';
    return 'secondary';
  };

  const getProvisioningStatusBadge = (status: string) => {
    const normalizedStatus = status.toLowerCase();

    switch (status) {
      case 'COMPLETED':
        return (
          <Badge
            variant="default"
            className={cn(
              getStatusColor('provisioned').bg,
              getStatusColor('provisioned').text,
              "border-0"
            )}
          >
            Provisioned
          </Badge>
        );
      case 'IN_PROGRESS':
        return (
          <Badge
            variant="secondary"
            className={cn(
              getStatusColor('inProgress').bg,
              getStatusColor('inProgress').text
            )}
          >
            In Progress
          </Badge>
        );
      case 'FAILED':
        return (
          <Badge
            variant="destructive"
            className={cn(
              getStatusColor('failed').bg,
              getStatusColor('failed').text
            )}
          >
            Failed
          </Badge>
        );
      case 'CANCELLED':
        return (
          <Badge
            variant="destructive"
            className={cn(
              getStatusColor('withdrawn').bg,
              getStatusColor('withdrawn').text
            )}
          >
            Cancelled
          </Badge>
        );
      case 'PENDING':
        return (
          <Badge
            variant="outline"
            className={cn(
              getStatusColor('pending').bg,
              getStatusColor('pending').text
            )}
          >
            Pending
          </Badge>
        );
      case 'SCHEDULED':
        return (
          <Badge
            variant="secondary"
            className={cn(
              getStatusColor('pending').bg,
              getStatusColor('pending').text
            )}
          >
            Scheduled
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className={cn(
              getStatusColor('default').bg,
              getStatusColor('default').text
            )}
          >
            Not Started
          </Badge>
        );
    }
  };


  const displayStatus = request.status.toLowerCase().replace('_', '-');
  const statusColors = getStatusColor(displayStatus);
  // const riskScore = details?.metadata?.riskScore || 0;

  const handleWithdrawConfirm = async (reason: string) => {
    if (!request?.id) return;

    const success = await withdrawRequest(request.id, reason);

    if (success) {
      setWithdrawDialogOpen(false);
      onOpenChange(false); // Close details modal

      await refreshCart();
      if (onWithdraw) {
        onWithdraw(); // Reload requests list
      }
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-2xl flex flex-col p-0 h-full">
          <div className="flex flex-col h-full">
            {/* Fixed Header Section */}
            <div className="flex-shrink-0 px-6 py-4">
              <SheetHeader className="!p-0">
                <div className="flex items-start justify-between">
                  <div>
                    <SheetTitle className="text-2xl flex items-center gap-2">
                      {getStatusIcon(displayStatus)}
                      Request #{request.id.slice(-8)}
                    </SheetTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge
                        variant={getStatusBadgeVariant(displayStatus)}
                        className={cn(
                          statusColors.bg,
                          statusColors.text
                        )}
                      >
                        {displayStatus.replace('-', ' ').toUpperCase()}
                      </Badge>

                      {/* <Badge variant={getRiskBadgeVariant(riskScore)}>
                        Risk: {riskScore}/100
                      </Badge> */}
                    </div>
                  </div>
                </div>
              </SheetHeader>
            </div>

            {/* Loading State (if needed) */}
            {loading && (
              <div className="flex-1 flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading details...</span>
              </div>
            )}

            {/* Main Content - Only show when not loading */}
            {!loading && details && (
              <>
                {/* Fixed Tabs Navigation */}
                <div className="flex-shrink-0 px-6 pt-4">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="details">Details</TabsTrigger>
                      <TabsTrigger value="approval">
                        Approval
                        {(() => {
                          const totalSteps = details.items.reduce(
                            (sum, item) => sum + (item.approvalSteps?.length || 0),
                            0
                          );
                          return totalSteps > 0 && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              {totalSteps}
                            </Badge>
                          );
                        })()}
                      </TabsTrigger>
                      <TabsTrigger value="provisioning">
                        Provisioning
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {details.items.length}
                        </Badge>
                      </TabsTrigger>
                      <TabsTrigger value="audit">
                        Audit
                        {details.auditLog.length > 0 && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {details.auditLog.length}
                          </Badge>
                        )}
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* Scrollable Tab Content Area */}
                <div className="flex-1 min-h-0 px-6 overflow-y-auto">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
                    {/* Details Tab */}
                    <TabsContent value="details" className="space-y-4 mt-4 pb-4 pl-2">
                      {/* Requester Information */}
                      <div className="rounded-lg">
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Requester Information
                        </h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Name:</span>
                            <p className="font-medium">{details.requestedByUserName}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Status:</span>
                            <p className="font-medium capitalize">{displayStatus.replace('-', ' ')}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Requested:</span>
                            <p className="font-medium">{format(new Date(details.requestedAt), 'PPp')}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Last Updated:</span>
                            <p className="font-medium">{format(new Date(details.lastUpdatedAt), 'PPp')}</p>
                          </div>
                        </div>
                      </div>

                      {/* Justification */}
                      <div>
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Business Justification
                        </h3>
                        <p className="text-sm pl-6">{details.overallJustification}</p>
                      </div>

                      {/* Requested Items */}
                      <div className="space-y-2">
                        <h3 className="font-semibold flex items-center gap-2">
                          Requested Items ({details.items.length})
                        </h3>
                        {details.items.map((item, index) => {

                          return (
                            <div key={index} className="border rounded-lg p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h4 className="font-medium">{item.itemName}</h4>
                                  {item.itemDescription && (
                                    <p className="text-sm text-muted-foreground">{item.itemDescription}</p>
                                  )}
                                </div>
                                {/* {overallStatus && getProvisioningStatusBadge(overallStatus)} */}
                              </div>

                              <div className="grid grid-cols-3 gap-4 text-sm mt-3">
                                <div>
                                  <span className="text-muted-foreground">Type:</span>
                                  <p className="font-medium capitalize">
                                    {item.itemType.toLowerCase().replace('_', ' ')}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Urgency:</span>
                                  <p className="font-medium capitalize">{item.urgency.toLowerCase()}</p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Validity:</span>
                                  <p className="font-medium">{item.validityDays} days</p>
                                </div>
                              </div>

                              {/* Beneficiaries Section (for OTHERS requests) */}
                              {item.requestTarget === 'OTHERS' &&
                                item.beneficiaryUserNames &&
                                item.beneficiaryUserNames.length > 0 && (
                                  <div className="mt-3 pt-3">
                                    <span className="text-sm text-muted-foreground">Requested for:</span>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                      {item.beneficiaryUserNames.map((name, idx) => (
                                        <Badge key={idx} variant="secondary" className="text-xs">
                                          <User className="h-3 w-3 mr-1" />
                                          {name}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}

                              {/* Justification */}
                              {item.justification && item.justification.trim() !== '' && (
                                <div className="mt-3 pt-3">
                                  <span className="text-sm text-muted-foreground">Item Justification:</span>
                                  <p className="text-sm mt-1">{item.justification}</p>
                                </div>
                              )}

                            </div>
                          );
                        })}
                      </div>

                      {/* Risk & Compliance */}
                      {(details.metadata.hasSODConflicts || details.metadata.hasComplianceFlags) && (
                        <div className="bg-destructive/10 border-destructive/30 border rounded-lg p-4">
                          <h3 className="font-semibold mb-3 flex items-center gap-2 text-destructive">
                            <Shield className="h-4 w-4" />
                            Risk & Compliance Warnings
                          </h3>
                          {details.metadata.hasSODConflicts && (
                            <div className="mb-3">
                              <h4 className="text-sm font-medium mb-2">SoD Conflicts Detected</h4>
                              <p className="text-sm">This request contains segregation of duties conflicts that require additional review.</p>
                            </div>
                          )}
                          {details.metadata.hasComplianceFlags && (
                            <div>
                              <h4 className="text-sm font-medium mb-2">Compliance Flags</h4>
                              <p className="text-sm">This request has compliance considerations that require attention.</p>
                            </div>
                          )}
                        </div>
                      )}
                    </TabsContent>

                    {/* Approval Tab */}
                    <TabsContent value="approval" className="space-y-4 mt-4 pb-4">
                      {/* Check if ANY item has approval steps */}
                      {details.items.some(item => item.approvalSteps && item.approvalSteps.length > 0) ? (
                        <div className="space-y-6">
                          {/* Request Overview Card - Clean white background */}
                          <Card>
                            <CardHeader >
                              <CardTitle className="text-sm flex items-center gap-2">
                                <Info className="h-4 w-4 text-muted-foreground" />
                                Request Summary
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              {/* Approval Progress */}
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Overall Approval Progress</p>
                                <div className="flex items-center gap-1.5">
                                  <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                                  <span className="text-sm font-medium">
                                    {details.metadata?.completedApprovalSteps || 0} of {details.metadata?.totalApprovalSteps || 0} steps complete
                                  </span>
                                </div>
                              </div>

                              {/* Total Items */}
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Items Requested</p>
                                <div className="flex items-center gap-1.5">
                                  <Package className="h-3.5 w-3.5 text-muted-foreground" />
                                  <span className="text-sm font-medium">
                                    {details.items.length} item{details.items.length !== 1 ? 's' : ''}
                                  </span>
                                </div>
                              </div>

                              {/* Items with Approval Steps */}
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Items Requiring Approval</p>
                                <div className="flex items-center gap-1.5">
                                  <CheckSquare className="h-3.5 w-3.5 text-muted-foreground" />
                                  <span className="text-sm font-medium">
                                    {details.items.filter(item => item.approvalSteps && item.approvalSteps.length > 0).length} items
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Iterate over each item that has approval steps */}
                          {details.items.map((item, itemIndex) => {
                            // Safely check if approvalSteps exists and has items
                            const approvalSteps = item.approvalSteps || [];

                            return approvalSteps.length > 0 ? (
                              <Card key={item.itemId || itemIndex}>
                                {/* Item Header */}
                                <CardHeader>
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-2">
                                        <Badge variant="outline" className="text-xs font-normal">
                                          {item.itemType?.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) || 'Access Item'}
                                        </Badge>
                                        <Badge variant="secondary" className="text-xs">
                                          {approvalSteps.length} approval step{approvalSteps.length !== 1 ? 's' : ''}
                                        </Badge>
                                      </div>
                                      <h3 className="font-semibold text-base">{item.itemName}</h3>
                                      {item.itemDescription && (
                                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.itemDescription}</p>
                                      )}
                                      {item.requestTarget === 'OTHERS' && item.beneficiaryUserNames && item.beneficiaryUserNames.length > 0 && (
                                        <div className="flex items-center gap-1.5 mt-2">
                                          <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                          <p className="text-xs text-muted-foreground">
                                            <span className="font-medium">For:</span> {item.beneficiaryUserNames.join(', ')}
                                          </p>
                                        </div>
                                      )}
                                    </div>

                                    {/* Item Validity & Urgency Badges */}
                                    <div className="flex flex-col items-end gap-1 shrink-0">
                                      <Badge variant="outline" className="text-xs">
                                        <Calendar className="h-3 w-3 mr-1" />
                                        {item.validityDays || 90} days validity
                                      </Badge>

                                      <Badge className={cn('text-xs px-2 py-0.5', getRiskBadgeClass(item.urgency))}>
                                      {item.urgency
                                          ? item.urgency.toLowerCase().replace(/^\w/, c => c.toUpperCase())
                                          : "Medium"}{" "}
                                        Priority
                                      </Badge>
                                    </div>
                                  </div>
                                </CardHeader>

                                {/* Approval Steps for this Item */}
                                <CardContent >
                                  <div className="space-y-4">
                                    {approvalSteps
                                      .sort((a, b) => a.stepOrder - b.stepOrder)
                                      .map((step, stepIndex) => {
                                        const getDecisionBadgeVariant = (decision: string) => {
                                          switch (decision) {
                                            case 'APPROVED':
                                              return 'default';
                                            case 'REJECTED':
                                              return 'destructive';
                                            case 'PENDING':
                                            default:
                                              return 'secondary';
                                          }
                                        };

                                        const isLastStep = stepIndex === approvalSteps.length - 1;
                                        const isPending = step.decision === 'PENDING';

                                        return (
                                          <div key={step.stepId} className="relative">
                                            {/* Connecting Line */}
                                            {/* {!isLastStep && (
                                              <div className="absolute left-4 top-16 bottom-0 w-0.5 bg-border -translate-x-1/2 z-0" />
                                            )} */}

                                            <div className={cn(
                                              "relative rounded-lg p-5 border"
                                            )}>
                                              {/* Step Header */}
                                              <div className="flex items-start justify-between gap-4 mb-4">
                                                <div className="flex items-start gap-3 flex-1">
                                                  {/* Step Number Circle */}
                                                  <div
                                                    className={cn(
                                                      "flex items-center justify-center w-10 h-10 rounded-full font-semibold text-sm",
                                                      getDecisionColor(step.decision).bg,
                                                      getDecisionColor(step.decision).text,
                                                      getDecisionColor(step.decision).border
                                                    )}
                                                  >

                                                    {step.stepOrder}
                                                  </div>

                                                  {/* Approver Info - Name first, then role as badge */}
                                                  <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                      {step.assignedApproverName ? (
                                                        <>
                                                          <span className="font-semibold text-base">
                                                            {step.assignedApproverName}
                                                          </span>
                                                          <Badge variant="outline" className="text-xs font-normal">
                                                            {step.approverRole?.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) || 'Approver'}
                                                          </Badge>
                                                        </>
                                                      ) : (
                                                        <>
                                                          <span className="font-semibold text-base text-muted-foreground">
                                                            Not Assigned
                                                          </span>
                                                          <Badge variant="outline" className="text-xs font-normal">
                                                            {step.approverRole?.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) || 'Approver'}
                                                          </Badge>
                                                        </>
                                                      )}

                                                      {isPending && (
                                                        <Badge
                                                          variant="secondary"
                                                          className="text-[10px] px-1.5 py-0 h-5
             bg-primary/10 text-primary hover:bg-primary/10"
                                                        >
                                                          Awaiting Response
                                                        </Badge>

                                                      )}
                                                    </div>

                                                    {step.assignedApproverEmail && (
                                                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                        <Mail className="h-3 w-3 shrink-0" />
                                                        <span>{step.assignedApproverEmail}</span>
                                                      </div>
                                                    )}

                                                    {step.targetUserName && (
                                                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                                                        <UserCheck className="h-3 w-3 shrink-0" />
                                                        <span>Approving for: <span className="font-medium">{step.targetUserName}</span></span>
                                                      </div>
                                                    )}
                                                  </div>
                                                </div>

                                                {/* Decision Badge */}
                                                <Badge
                                                  variant={getDecisionBadgeVariant(step.decision)}
                                                  className={cn(
                                                    "flex items-center gap-1.5 shrink-0 px-3 py-1",
                                                    getDecisionColor(step.decision).bg,
                                                    getDecisionColor(step.decision).text,
                                                    getDecisionColor(step.decision).border
                                                  )}
                                                >

                                                  <span className="font-medium">
                                                    {step.decision === 'PENDING' ? 'Pending' : step.decision.toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                                                  </span>
                                                </Badge>
                                              </div>

                                              {/* Timeline Information */}
                                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mt-4 pt-4">
                                                {step.createdAt && (
                                                  <div className="flex items-start gap-2">
                                                    <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                                                    <div>
                                                      <span className="text-xs text-muted-foreground block">Assigned Time</span>
                                                      <p className="font-medium text-sm">
                                                        {format(new Date(step.createdAt), 'MMM dd, yyyy')}
                                                      </p>
                                                      <p className="text-xs text-muted-foreground">
                                                        {format(new Date(step.createdAt), 'h:mm a')}
                                                      </p>
                                                    </div>
                                                  </div>
                                                )}

                                                {step.respondedAt ? (
                                                  <div className="flex items-start gap-2">
                                                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                                                    <div>
                                                      <span className="text-xs text-muted-foreground block">
                                                        Approval Completed
                                                      </span>
                                                      <p className="font-medium text-sm">
                                                        {format(new Date(step.respondedAt), "MMM dd, yyyy")}
                                                      </p>
                                                      <p className="text-xs text-muted-foreground">
                                                        {format(new Date(step.respondedAt), "h:mm a")}
                                                      </p>
                                                    </div>
                                                  </div>
                                                ) : isPending && (
                                                  <div className="flex items-start gap-2">
                                                    <Clock className="h-4 w-4 text-primary mt-0.5 shrink-0 animate-pulse" />
                                                    <div>
                                                      <span className="text-xs text-primary font-medium block">
                                                        Awaiting Approval
                                                      </span>
                                                      <p className="text-xs text-muted-foreground mt-0.5">
                                                        The approver has not responded yet. Approval time will be available once a decision is made.
                                                      </p>
                                                    </div>
                                                  </div>
                                                )}

                                              </div>

                                              {/* Comments Section */}
                                              {step.comments && step.comments.trim() !== '' && (
                                                <div className="mt-4 pt-4">
                                                  <div className="flex items-start gap-2">
                                                    <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                                                    <div className="flex-1">
                                                      <span className="text-xs font-medium text-muted-foreground block mb-2">
                                                        Approval Comments
                                                      </span>
                                                      <div className="bg-muted/30 rounded-lg p-3 text-sm border">
                                                        {step.comments}
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      })}
                                  </div>
                                </CardContent>
                              </Card>
                            ) : null;
                          })}
                        </div>
                      ) : (
                        <div className="bg-muted/50 rounded-lg p-8 text-center">
                          <Clock className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                          <p className="text-muted-foreground">No approval steps configured for this request.</p>
                        </div>
                      )}
                    </TabsContent>

                    {/* Provisioning Tab */}
                    <TabsContent value="provisioning" className="space-y-4 mt-4 pb-4">
                      {details.items.length === 0 ? (
                        <Card className="bg-muted/40">
                          <CardContent className="p-8 text-center">
                            <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                            <p className="text-sm text-muted-foreground">
                              No provisioning information available.
                            </p>
                          </CardContent>
                        </Card>
                      ) : (
                        <div className="space-y-4">
                          {details.items.map((item, itemIndex) => {
                            //  Normalize once
                            const provisioningStatuses = item.provisioningStatuses ?? [];

                            return (
                              <Card
                                key={itemIndex}
                                className="bg-muted/30 hover:bg-muted/40 transition-colors"
                              >
                                <CardContent className="p-4 space-y-4">
                                  {/* Item Header */}
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <Package className="h-5 w-5 text-muted-foreground" />
                                      <div>
                                        <p className="font-medium">{item.itemName}</p>
                                        <p className="text-xs text-muted-foreground capitalize">
                                          {item.itemType.toLowerCase().replace("_", " ")}
                                        </p>
                                      </div>
                                    </div>

                                    {provisioningStatuses.length > 0 && (
                                      <Badge variant="secondary" className="text-xs">
                                        {provisioningStatuses.length} user
                                        {provisioningStatuses.length !== 1 && "s"}
                                      </Badge>
                                    )}
                                  </div>

                                  {/* Provisioning Records */}
                                  {provisioningStatuses.length > 0 ? (
                                    <div className="space-y-3">
                                      {provisioningStatuses.map((provisioning, provIndex) => {
                                        const userIndex =
                                          item.beneficiaryUserIds?.indexOf(
                                            provisioning.targetUserId
                                          ) ?? -1;

                                        const userName =
                                          userIndex >= 0 && item.beneficiaryUserNames
                                            ? item.beneficiaryUserNames[userIndex]
                                            : provisioning.targetUserId;

                                        return (
                                          <div
                                            key={provIndex}
                                            className="bg-background/80 rounded-lg p-4 space-y-3"
                                          >
                                            {/* User Header */}
                                            <div className="flex items-start justify-between">
                                              <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-muted-foreground" />
                                                <p className="font-medium text-sm">{userName}</p>
                                              </div>
                                              {getProvisioningStatusBadge(provisioning.status)}
                                            </div>

                                            {/* Provisioning Metadata */}
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                              {provisioning.targetSystem && (
                                                <div>
                                                  <p className="text-xs text-muted-foreground">
                                                    Target System
                                                  </p>
                                                  <p className="font-medium">
                                                    {provisioning.targetSystem}
                                                  </p>
                                                </div>
                                              )}

                                              {provisioning.externalTicketId && (
                                                <div>
                                                  <p className="text-xs text-muted-foreground">
                                                    Ticket ID
                                                  </p>
                                                  <p className="font-medium">
                                                    {provisioning.externalTicketId}
                                                  </p>
                                                </div>
                                              )}

                                              {provisioning.provisioningStartedAt && (
                                                <div>
                                                  <p className="text-xs text-muted-foreground">
                                                    Started
                                                  </p>
                                                  <p className="font-medium">
                                                    {format(
                                                      new Date(provisioning.provisioningStartedAt),
                                                      "MMM dd, yyyy · h:mm a"
                                                    )}
                                                  </p>
                                                </div>
                                              )}

                                              {provisioning.provisioningCompletedAt && (
                                                <div>
                                                  <p className="text-xs text-muted-foreground">
                                                    Completed
                                                  </p>
                                                  <p className="font-medium">
                                                    {format(
                                                      new Date(
                                                        provisioning.provisioningCompletedAt
                                                      ),
                                                      "MMM dd, yyyy · h:mm a"
                                                    )}
                                                  </p>
                                                </div>
                                              )}

                                              {provisioning.accessExpiresAt && (
                                                <div>
                                                  <p className="text-xs text-muted-foreground">
                                                    Access Expires
                                                  </p>
                                                  <p className="font-medium">
                                                    {format(
                                                      new Date(provisioning.accessExpiresAt),
                                                      "MMM dd, yyyy · h:mm a"
                                                    )}
                                                  </p>
                                                </div>
                                              )}
                                            </div>

                                            {/* Error State */}
                                            {provisioning.errorMessage && (
                                              <div className="bg-destructive/10 rounded-lg p-3">
                                                <p className="text-xs font-medium text-destructive">
                                                  Provisioning Error
                                                </p>
                                                <p className="text-sm text-destructive/90 mt-1">
                                                  {provisioning.errorMessage}
                                                </p>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
                                      Provisioning has not been initiated for this item yet.
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      )}
                    </TabsContent>


                    {/* Audit Tab */}
                    <TabsContent value="audit" className="space-y-4 mt-4 pb-4">
                      {details.auditLog.length === 0 ? (
                        <Card className="bg-muted/40">
                          <CardContent className="p-8 text-center">
                            <Activity className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                            <p className="text-sm text-muted-foreground">
                              No audit activity has been recorded for this request.
                            </p>
                          </CardContent>
                        </Card>
                      ) : (


                        <div className="space-y-3">
                          {details.auditLog
                            .sort(
                              (a, b) =>
                                new Date(b.performedAt).getTime() -
                                new Date(a.performedAt).getTime()
                            )
                            .map((log, index, arr) => {
                              const isSystem = !log.performedBy || log.performedBy === "System"

                              return (
                                <div key={log.logId} className="flex gap-4">
                                  {/* Timeline */}
                                  <div className="relative flex flex-col items-center">
                                    {/* Top connector (except first) */}
                                    {index !== 0 && (
                                      <span className="absolute -top-3 h-3 w-px bg-border" />
                                    )}

                                    {/* Dot */}
                                    <span className="h-2.5 w-2.5 rounded-full bg-primary" />

                                    {/* Bottom connector (except last) */}
                                    {index !== arr.length - 1 && (
                                      <span className="absolute top-3 h-full w-px bg-border" />
                                    )}
                                  </div>

                                  {/* Content */}
                                  <div className="flex-1 space-y-1">
                                    {/* Action */}
                                    <p className="text-sm font-medium leading-tight">
                                      {log.action
                                        .replace(/_/g, " ")
                                        .toLowerCase()
                                        .replace(/\b\w/g, l => l.toUpperCase())}
                                    </p>

                                    {/* Meta */}
                                    <div className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                                      <span className="flex items-center gap-1">
                                        {isSystem ? (
                                          <Settings className="h-3.5 w-3.5" />
                                        ) : (
                                          <User className="h-3.5 w-3.5" />
                                        )}
                                        <span>
                                          By{" "}
                                          <span className="font-medium text-foreground">
                                            {isSystem ? "System" : log.performedBy}
                                          </span>
                                        </span>
                                      </span>

                                      <span>•</span>

                                      <span className="flex items-center gap-1">
                                        <Clock className="h-3.5 w-3.5" />
                                        {format(
                                          new Date(log.performedAt),
                                          "MMM dd, yyyy · h:mm a"
                                        )}
                                      </span>
                                    </div>

                                    {/* Details */}
                                    {log.details && (
                                      <p className="text-sm text-muted-foreground leading-snug">
                                        {log.details}
                                      </p>
                                    )}

                                    {/* Status transition */}
                                    {log.previousStatus && log.newStatus && (
                                      <p className="text-xs text-muted-foreground">
                                        Status changed from{" "}
                                        <span className="font-medium text-foreground">
                                          {log.previousStatus.replace("-", " ")}
                                        </span>{" "}
                                        →{" "}
                                        <span className="font-medium text-foreground">
                                          {log.newStatus.replace("-", " ")}
                                        </span>
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                        </div>

                      )}
                    </TabsContent>

                  </Tabs>
                </div>

                {/* Fixed Footer with Separator and Actions */}
                <div className="flex-shrink-0 px-6 py-4">
                  <div className="flex justify-between">
                    <div className="flex gap-2">
                      {(displayStatus === 'submitted' || displayStatus === 'pending-approval') && (
                        <Button
                          variant="destructive"
                          onClick={() => setWithdrawDialogOpen(true)}
                          disabled={withdrawing}
                        >
                          {withdrawing ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Withdrawing...
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 mr-2" />
                              Withdraw Request
                            </>
                          )}
                        </Button>
                      )}
                      {onDuplicate && (
                        <Button variant="outline" onClick={onDuplicate}>
                          <FileText className="h-4 w-4 mr-2" />
                          Duplicate
                        </Button>
                      )}
                      {(displayStatus === 'approved' || displayStatus === 'provisioned') && onExtend && (
                        <Button variant="outline" onClick={onExtend}>
                          <Calendar className="h-4 w-4 mr-2" />
                          Extend Access
                        </Button>
                      )}
                    </div>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                      Close
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Withdrawal Dialog */}
      <WithdrawRequestDialog
        open={withdrawDialogOpen}
        onOpenChange={setWithdrawDialogOpen}
        onConfirm={handleWithdrawConfirm}
        loading={withdrawing}
        requestId={request?.id || ''}
      />

    </>
  );
};

export default RequestDetailsModal;