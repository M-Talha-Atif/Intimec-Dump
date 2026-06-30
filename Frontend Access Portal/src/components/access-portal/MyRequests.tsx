import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { getStatusColor, getStatusBadgeVariant } from '@/utils/statusColors';
import { getStatusIcon } from '@/utils/statusIcons';
import {
  Clock,
  Calendar,
  HelpCircle,
  AlertCircle,
  Search,
  Loader2,
  LayoutGrid,
  List
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import RequestDetailsModal from './RequestDetailsModal';
import { useToast } from '@/hooks/use-toast';
import { useRequestHistory, BackendAccessRequest } from '@/hooks/useRequestHistory';
import CustomPagination from "@/components/applications/common/CustomPagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface MyRequestsProps {
  onWithdrawSuccess?: () => void;
}

const MyRequests: React.FC<MyRequestsProps> = ({ onWithdrawSuccess }) => {

  const { toast } = useToast();
  const { fetchRequestHistory, loading } = useRequestHistory();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRequest, setSelectedRequest] = useState<BackendAccessRequest | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid'); // New state for view mode

  // Backend data state
  const [requests, setRequests] = useState<BackendAccessRequest[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const loadRequests = useCallback(async () => {
    const result = await fetchRequestHistory(
      statusFilter,
      currentPage,
      itemsPerPage
    );

    if (result) {
      setRequests(result.items);
      setTotalPages(result.totalPages);
      setTotalItems(result.totalItems);
    }
  }, [
    fetchRequestHistory,
    statusFilter,
    currentPage,
    itemsPerPage,
  ]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const filteredRequests = searchQuery
    ? requests.filter(req =>
      req.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.requestedByUserName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.overallJustification.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : requests;


  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleViewDetails = (request: BackendAccessRequest) => {
    setSelectedRequest(request);
    setDetailsModalOpen(true);
  };

  const handleWithdraw = () => {
    toast({
      title: "Request withdrawn",
      description: "Your access request has been withdrawn successfully."
    });

    setDetailsModalOpen(false);
    loadRequests(); // Reload requests

    if (onWithdrawSuccess) {
      onWithdrawSuccess();
    }
  };

  const handleDuplicate = () => {
    toast({
      title: "Request duplicated",
      description: "A copy of this request has been added to your cart."
    });
    setDetailsModalOpen(false);
  };

  const handleExtend = () => {
    toast({
      title: "Extension requested",
      description: "Your extension request has been submitted for approval."
    });
    setDetailsModalOpen(false);
  };


  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(0); // Reset to first page
  };

  // Get status display text
  const getStatusDisplay = (status: string) => {
    const normalizedStatus = status.toLowerCase().replace('_', '-');
    return normalizedStatus.replace('-', ' ');
  };

  return (
    <div className="space-y-6">
      {/* Header Card with Filters */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-semibold tracking-tight">
                Access Request History
              </CardTitle>
              {totalItems > 0 && (
                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-medium">{filteredRequests.length}</span> of{' '}
                  <span className="font-medium">{totalItems}</span> total requests
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Items Per Page with Tooltip */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground whitespace-nowrap">Requests per page:</span>
                      <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                        <SelectTrigger className="w-[70px] h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent align="end">
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="25">25</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                          <SelectItem value="200">200</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Number of requests displayed per page</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* View Toggle with Tooltip */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <ToggleGroup
                      type="single"
                      variant="outline"
                      value={viewMode}
                      onValueChange={(value) => {
                        if (value === 'grid' || value === 'table') {
                          setViewMode(value);
                        }
                      }}
                      className="border rounded-lg"
                    >
                      <ToggleGroupItem value="grid" aria-label="Grid view" className="px-3">
                        <LayoutGrid className="h-4 w-4" />
                      </ToggleGroupItem>
                      <ToggleGroupItem value="table" aria-label="Table view" className="px-3">
                        <List className="h-4 w-4" />
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Switch between {viewMode === 'grid' ? 'grid' : 'table'} and {viewMode === 'grid' ? 'table' : 'grid'} view</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-2">
            {/* Search with Tooltip */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative flex-1 min-w-[240px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search requests..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-9"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p>Search by request ID, requester name, or business justification</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Status Filter with Tooltip */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-full sm:w-[180px]">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full h-9">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-muted-foreground" />
                          <SelectValue placeholder="All statuses" />
                        </div>
                      </SelectTrigger>
                      <SelectContent align="end">
                        <SelectItem value="all">All Requests</SelectItem>
                        <SelectItem value="SUBMITTED">Submitted</SelectItem>
                        <SelectItem value="PENDING_APPROVAL">Pending Approval</SelectItem>
                        {/* <SelectItem value="APPROVED">Approved</SelectItem> */}
                        <SelectItem value="REJECTED">Rejected</SelectItem>
                        <SelectItem value="PROVISIONED">Provisioned</SelectItem>
                        <SelectItem value="WITHDRAWN">Withdrawn</SelectItem>
                        <SelectItem value="PARTIALLY_PROVISIONED">Partially Provisioned</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Filter requests by their current lifecycle status</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Date Range Filter with Tooltip */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-full sm:w-[180px]">
                    <Select defaultValue="30">
                      <SelectTrigger className="w-full h-9">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <SelectValue placeholder="Date range" />
                        </div>
                      </SelectTrigger>
                      <SelectContent align="end">
                        <SelectItem value="7">Last 7 days</SelectItem>
                        <SelectItem value="30">Last 30 days</SelectItem>
                        <SelectItem value="90">Last 90 days</SelectItem>
                        <SelectItem value="365">This year</SelectItem>
                        <SelectItem value="all">All time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Filter requests by submission date</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Status Legend */}
          <div className="flex flex-wrap items-center gap-4 pt-3 mt-2">
            <span className="text-xs font-medium text-muted-foreground">Status meanings:</span>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 cursor-help">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor('submitted').dot}`} />
                    <span className={`text-xs ${getStatusColor('submitted').text}`}>Submitted</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs max-w-xs">
                  <p className="font-medium">Submitted</p>
                  <p className="text-muted-foreground">Request has been submitted and approvers are getting assigned</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 cursor-help">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor('pending').dot}`} />
                    <span className={`text-xs ${getStatusColor('pending').text}`}>Pending Approval</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs max-w-xs">
                  <p className="font-medium">Pending Approval</p>
                  <p className="text-muted-foreground">Request is currently under review by approvers</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 cursor-help">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor('approved').dot}`} />
                    <span className={`text-xs ${getStatusColor('approved').text}`}>Approved</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs max-w-xs">
                  <p className="font-medium">Approved</p>
                  <p className="text-muted-foreground">All requested roles have been approved</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider> */}

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 cursor-help">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor('rejected').dot}`} />
                    <span className={`text-xs ${getStatusColor('rejected').text}`}>Rejected</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs max-w-xs">
                  <p className="font-medium">Rejected</p>
                  <p className="text-muted-foreground">All requested roles were rejected - no roles were granted</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 cursor-help">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor('provisioned').dot}`} />
                    <span className={`text-xs ${getStatusColor('provisioned').text}`}>Provisioned</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs max-w-xs">
                  <p className="font-medium">Provisioned</p>
                  <p className="text-muted-foreground">All approved roles have been successfully granted to users</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 cursor-help">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor('partial').dot}`} />
                    <span className={`text-xs ${getStatusColor('partial').text}`}>Partially Provisioned</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs max-w-xs">
                  <p className="font-medium">Partially Provisioned</p>
                  <p className="text-muted-foreground">Some roles were approved while others were rejected - check request details to see which roles were granted</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 cursor-help">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor('withdrawn').dot}`} />
                    <span className={`text-xs ${getStatusColor('withdrawn').text}`}>Withdrawn</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs max-w-xs">
                  <p className="font-medium">Withdrawn</p>
                  <p className="text-muted-foreground">Request was withdrawn by the user (currently not implemented - workflow does not support taking back from approvers)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Active Filters Summary */}
          {(statusFilter !== 'all' && statusFilter !== '') && (
            <div className="flex items-center gap-2 pt-2">
              <span className="text-xs text-muted-foreground">Active filters:</span>
              <Badge variant="secondary" className="text-xs gap-1">
                Status: {statusFilter.toLowerCase().replace('_', ' ')}
                <button
                  onClick={() => setStatusFilter('all')}
                  className="ml-1 hover:text-destructive focus:outline-none"
                  aria-label="Remove status filter"
                >
                  ×
                </button>
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setStatusFilter('all');
                  setSearchQuery('');
                }}
              >
                Clear all filters
              </Button>
            </div>
          )}
        </CardHeader>
      </Card>


      {/* Loading State */}
      {/* {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading requests...</span>
        </div>
      )} */}

      {/* Empty State */}
      {/* {!loading && filteredRequests.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Clock className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No requests found</h3>
            <p className="text-sm text-muted-foreground">
              {statusFilter !== 'all'
                ? `No ${statusFilter} requests at the moment.`
                : 'You haven\'t submitted any access requests yet.'}
            </p>
          </CardContent>
        </Card>
      )} */}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {

              loading ? (
                // Loading state
                <div className="col-span-full flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Loading requests...</span>
                </div>
              ) :

                filteredRequests.length > 0 ? (


                  <TooltipProvider>
                    {filteredRequests.map(request => {
                      // const riskScore = calculateRiskScore(request);
                      const displayStatus = request.status.toLowerCase().replace('_', '-');
                      const statusColors = getStatusColor(displayStatus);

                      return (
                        <Card
                          key={request.id}
                          className={cn(
                            "group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
                            "hover:border-primary/30 cursor-pointer"
                          )}
                          onClick={() => handleViewDetails(request)}
                        >
                          <CardHeader className="pb-3 pt-5">
                            <div className="flex items-start gap-4">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className={cn(
                                    "p-3 rounded-xl flex-shrink-0 transition-colors cursor-help",
                                    statusColors.bg // Use dynamic background from statusColors
                                  )}>
                                    {getStatusIcon(displayStatus)}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="left" className="text-xs">
                                  <p>Request Status: {displayStatus.replace('-', ' ')}</p>
                                </TooltipContent>
                              </Tooltip>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <CardTitle className="text-lg font-semibold text-foreground leading-tight truncate">
                                    Request #{request.id.slice(-8)}
                                  </CardTitle>

                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Badge variant="outline" className="text-xs gap-1 cursor-help">
                                        <HelpCircle className="h-3 w-3" />
                                        {request.items?.length || 0}
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="text-xs">
                                      <p>{request.items?.length || 0} item{request.items?.length !== 1 ? 's' : ''} in this request</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex items-center gap-1 cursor-help">
                                        <Calendar className="h-3 w-3" />
                                        {formatDate(request.requestedAt)}
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom" className="text-xs">
                                      <p>Requested on: {new Date(request.requestedAt).toLocaleString()}</p>
                                    </TooltipContent>
                                  </Tooltip>

                                  {request.lastUpdatedAt && (
                                    <>
                                      <span>•</span>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <div className="flex items-center gap-1 cursor-help">
                                            <Clock className="h-3 w-3" />
                                            Updated
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent side="bottom" className="text-xs">
                                          <p>Last updated: {new Date(request.lastUpdatedAt).toLocaleString()}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardHeader>

                          <CardContent className="space-y-4 px-5 pb-3">
                            {/* Justification with Tooltip */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 min-h-[2.5rem] cursor-help bg-muted/30 p-2 rounded-md">
                                  {request.overallJustification || "No justification provided"}
                                </p>
                              </TooltipTrigger>
                              <TooltipContent side="bottom" className="text-xs max-w-sm">
                                <p className="font-medium mb-1">Business Justification:</p>
                                <p className="text-muted-foreground">{request.overallJustification || "No justification provided for this request"}</p>
                              </TooltipContent>
                            </Tooltip>

                            {/* Status Grid */}
                            <div className="grid grid-cols-1 gap-3 pt-2">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="bg-muted/30 rounded-lg p-2 hover:bg-muted/50 transition-colors cursor-help">
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                                      <AlertCircle className="h-3 w-3" />
                                      <span>Status</span>
                                    </div>



                                    <Badge
                                      variant={getStatusBadgeVariant(displayStatus)}
                                      className={cn(
                                        statusColors.bg,
                                        statusColors.text
                                      )}
                                    >
                                      <span className="flex items-center gap-1">
                                        {getStatusIcon(displayStatus)}
                                        {displayStatus.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
                                      </span>
                                    </Badge>
                                  </div>
                                </TooltipTrigger>

                                <TooltipContent side="bottom" className="text-xs">
                                  <p>Current request status</p>
                                  <p className="text-muted-foreground">
                                    {displayStatus === "approved" && "Request has been approved"}
                                    {displayStatus === "rejected" && "Request was rejected"}
                                    {displayStatus === "pending-approval" && "Waiting for approver response"}
                                    {displayStatus === "provisioned" && "Access has been provisioned"}
                                    {displayStatus === "submitted" && "Request submitted, pending review"}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </div>

                            {/* Request Items Summary with Tooltips */}
                            <div className="space-y-2">
                              <div className="flex items-center gap-1">
                                <span className="text-xs font-medium text-muted-foreground">Requested Items</span>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <HelpCircle className="h-3 w-3 text-muted-foreground/50 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent side="right" className="text-xs">
                                    <p>Items included in this request</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {request.items?.slice(0, 3).map((item, idx) => (
                                  <Tooltip key={idx}>
                                    <TooltipTrigger asChild>
                                      <Badge
                                        variant="secondary"
                                        className="text-xs px-2 py-1 cursor-help hover:bg-secondary/80 transition-colors"
                                      >
                                        {item.itemName}
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="text-xs">
                                      <p className="font-medium">{item.itemName}</p>
                                      {item.itemDescription && (
                                        <p className="text-muted-foreground">{item.itemDescription}</p>
                                      )}
                                    </TooltipContent>
                                  </Tooltip>
                                ))}
                                {request.items && request.items.length > 3 && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Badge variant="outline" className="text-xs px-2 py-1 cursor-help">
                                        +{request.items.length - 3} more
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="text-xs">
                                      <p>{request.items.length - 3} additional item{request.items.length - 3 !== 1 ? 's' : ''}</p>
                                      <ul className="list-disc pl-4 mt-1">
                                        {request.items.slice(3, 6).map((item, idx) => (
                                          <li key={idx} className="text-muted-foreground">{item.itemName}</li>
                                        ))}
                                        {request.items.length > 6 && (
                                          <li className="text-muted-foreground">and more...</li>
                                        )}
                                      </ul>
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                              </div>
                            </div>

                            {/* Footer with View Button */}
                            <div className="flex items-center justify-end pt-3">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewDetails(request);
                                    }}
                                  >
                                    View Details
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="left" className="text-xs">
                                  <p>View complete request details including approval steps and provisioning status</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </CardContent>

                          {/* Hover Overlay Effect */}
                          <div className="absolute inset-0 rounded-lg pointer-events-none bg-gradient-to-t from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </Card>
                      );
                    })}
                  </TooltipProvider>
                ) : (
                  // Empty state when no requests match filters
                  <div className="col-span-full flex flex-col items-center justify-center py-12">
                    <Clock className="h-16 w-16 text-muted-foreground/30 mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No requests found</h3>
                    <p className="text-sm text-muted-foreground">
                      {statusFilter !== 'all'
                        ? `No ${statusFilter.toLowerCase().replace('_', ' ')} requests at the moment.`
                        : 'You haven\'t submitted any access requests yet.'}
                    </p>
                    {(searchQuery || statusFilter !== 'all') && (
                      <Button
                        variant="link"
                        className="mt-2"
                        onClick={() => {
                          setSearchQuery('');
                          setStatusFilter('all');
                        }}
                      >
                        Clear all filters
                      </Button>
                    )}
                  </div>
                )}
          </div>
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && !loading && filteredRequests.length > 0 && (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="py-3 pl-4">Request ID</TableHead>
                <TableHead className="py-3">Status</TableHead>
                <TableHead className="py-3">Items</TableHead>
                <TableHead className="py-3">Submitted On</TableHead>
                <TableHead className="py-3 pr-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => {
                const displayStatus = getStatusDisplay(request.status);
                const statusColors = getStatusColor(displayStatus);

                return (
                  <TableRow
                    key={request.id}
                    className="hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => handleViewDetails(request)}
                  >
                    <TableCell className="font-medium pl-4 py-3">
                      <span className="text-sm">#{request.id.slice(-8)}</span>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(request.status)}
                        <Badge
                          variant={getStatusBadgeVariant(displayStatus)}
                          className={cn(
                            "px-2 py-0.5 text-xs",
                            statusColors.bg,
                            statusColors.text,
                            "border-0"
                          )}
                        >
                          <span className="flex items-center gap-1">
                            {displayStatus.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge variant="outline" className="text-xs font-normal px-2 py-0.5">
                        {request.items?.length || 0} item{request.items?.length !== 1 ? 's' : ''}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground py-3">
                      {formatDate(request.requestedAt)}
                    </TableCell>
                    <TableCell className="text-right pr-4 py-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(request);
                        }}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Optional footer with summary */}
          {filteredRequests.length > 0 && (
            <div className="border-t px-4 py-2 text-xs text-muted-foreground bg-muted/20">
              Showing {filteredRequests.length} of {totalItems} requests
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <CustomPagination
          totalElements={totalItems}
          totalPages={totalPages}
          useCallbackMode={true}
          page={currentPage}
          size={itemsPerPage}
          defaultSize={10}
          onPageChange={(newPage) => setCurrentPage(newPage)}
          onSizeChange={(newSize) => {
            setItemsPerPage(newSize);
            setCurrentPage(0);
          }}
        />
      )}

      {/* Request Details Modal */}
      <RequestDetailsModal
        request={selectedRequest}
        open={detailsModalOpen}
        onOpenChange={setDetailsModalOpen}
        onWithdraw={handleWithdraw}
        onDuplicate={handleDuplicate}
        onExtend={handleExtend}
      />
    </div>
  );
};

export default MyRequests;