import React, { useState } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  ShoppingCart, Trash2, AlertTriangle,
  Send, X, User, Users, ChevronDown, ChevronUp, Loader2, Info, HelpCircle, RefreshCw
} from 'lucide-react';
import { AccessItem } from '@/data/mock-access-portal';
import { SelectableUser } from '@/data/mock-selectable-users';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getRiskBadgeClass } from '@/utils/getRiskColor';
import { cn } from '@/lib/utils';
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

export interface CartItemWithTarget extends AccessItem {
  requestTarget: 'self' | 'others';
  beneficiaries: SelectableUser[];
  tileId?: string;
  cartId?: string;
}

interface CartSlideoutProps {
  cartItems: CartItemWithTarget[];
  onRemoveFromCart: (itemId: string) => Promise<boolean>;
  onClearCart: () => Promise<boolean>;
  onRefreshCart?: () => Promise<any>;
  onSubmitRequest: (requestData: {
    items: Array<{
      itemId: string;
      cartItemId: string;
      validityDays: number;
      urgency: 'low' | 'medium' | 'high';
      justification: string;
    }>;
    overallJustification: string;
    selfRequestCount: number;
    othersRequestCount: number;
    totalBeneficiaries: number;
  }) => Promise<void>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  submitting?: boolean;
}

interface CartItemRequest {
  itemId: string;
  cartItemId: string;
  justification: string;
  validityDays: number;
  urgency: 'low' | 'medium' | 'high';
}

const CartSlideout: React.FC<CartSlideoutProps> = ({
  cartItems,
  onRemoveFromCart,
  onClearCart,
  onRefreshCart,
  onSubmitRequest,
  open,
  onOpenChange,
  submitting = false,
}) => {
  const [itemRequests, setItemRequests] = useState<Record<string, CartItemRequest>>({});
  const [globalJustification, setGlobalJustification] = useState('');
  const [expandedBeneficiaries, setExpandedBeneficiaries] = useState<Record<string, boolean>>({});
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());
  const [clearingCart, setClearingCart] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [pendingOpenState, setPendingOpenState] = useState<boolean | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  /**
 * Check if there are any unsaved changes
 */
  const hasUnsavedChanges = () => {
    // Check if any item has non-default justification
    const hasItemJustifications = Object.values(itemRequests).some(
      req => req.justification && req.justification.trim() !== ''
    );

    // Check if any urgency is not default (medium)
    const hasNonDefaultUrgency = Object.values(itemRequests).some(
      req => req.urgency !== 'medium'
    );

    // Check if any validity days is not default (30)
    const hasNonDefaultValidity = Object.values(itemRequests).some(
      req => req.validityDays !== 30
    );

    // Check if global justification has content
    const hasGlobalJustification = globalJustification.trim() !== '';

    return hasItemJustifications || hasNonDefaultUrgency || hasNonDefaultValidity || hasGlobalJustification;
  };

  const handleRefreshCart = async () => {
    if (refreshing || !onRefreshCart) return;
    setRefreshing(true);
    try {
      await onRefreshCart();
    } finally {
      setRefreshing(false);
    }
  };

  /**
 * Handle sheet open change with unsaved changes check
 */
  const handleOpenChange = (newOpen: boolean) => {
    // If trying to close and there are unsaved changes
    if (!newOpen && hasUnsavedChanges() && cartItems.length > 0) {
      setShowDiscardConfirm(true);
      setPendingOpenState(newOpen);
      return;
    }

    // Otherwise, just close
    onOpenChange?.(newOpen);
  };

  /**
   * Handle keeping edits when discard dialog is cancelled
   */
  const handleKeepEditing = () => {
    setShowDiscardConfirm(false);
    setPendingOpenState(null);
  };

  /**
   * Handle discarding changes and closing
   */
  /**
 * Handle discarding changes and closing
 */
  const handleDiscardChanges = () => {
    // Reset all form states to default
    setItemRequests({}); // Clear all item-specific requests
    setGlobalJustification(""); // Clear global justification
    setExpandedBeneficiaries({}); // Reset expanded beneficiaries state
    setShowDiscardConfirm(false);

    if (pendingOpenState !== null) {
      onOpenChange?.(pendingOpenState);
      setPendingOpenState(null);
    }
  };


  const MAX_LENGTH = 256;

  const getCharacterCounter = (current: string, max: number = MAX_LENGTH) => {
    const remaining = max - current.length;
    const isNearLimit = remaining <= 20;
    const isAtLimit = remaining < 0;

    return (
      <div className={`text-xs text-right mt-1 ${isAtLimit ? 'text-destructive font-bold' : isNearLimit ? 'text-amber-600' : 'text-muted-foreground'}`}>
        {current.length}/{max} characters {remaining < 0 && `(exceeded by ${Math.abs(remaining)})`}
      </div>
    );
  };


  /**
   * Update individual item request details
   */
  const updateItemRequest = (itemId: string, field: keyof CartItemRequest, value: any) => {
    setItemRequests(prev => ({
      ...prev,
      [itemId]: {
        itemId,
        cartItemId: '',
        justification: '',
        validityDays: 30,
        urgency: 'medium',
        ...prev[itemId],
        [field]: value
      }
    }));
  };

  /**
   * Get item request details with defaults
   */
  const getItemRequest = (itemId: string): CartItemRequest => {
    return itemRequests[itemId] || {
      itemId,
      cartItemId: '',
      justification: '',
      validityDays: 30,
      urgency: 'medium',
    };
  };

  /**
   * Toggle beneficiaries list expansion
   */
  const toggleBeneficiaries = (itemId: string) => {
    setExpandedBeneficiaries(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  /**
   * Handle removing a single item
   */
  const handleRemoveItem = async (cartId: string) => {
    if (removingItems.has(cartId)) {
      return;
    }

    setRemovingItems(prev => new Set(prev).add(cartId));

    try {
      const success = await onRemoveFromCart(cartId);
      if (!success) {
        setRemovingItems(prev => {
          const next = new Set(prev);
          next.delete(cartId);
          return next;
        });
      }
    } catch (error) {
      setRemovingItems(prev => {
        const next = new Set(prev);
        next.delete(cartId);
        return next;
      });
    }
  };

  /**
   * Handle clearing entire cart
   */
  const handleClearCart = async () => {
    if (clearingCart) {
      return;
    }

    setClearingCart(true);

    try {
      await onClearCart();
    } finally {
      setClearingCart(false);
    }
  };

  /**
   * Calculate average risk score across all cart items
   */
  const calculateRiskScore = () => {
    if (cartItems.length === 0) return 0;
    let totalRisk = 0;
    cartItems.forEach(item => {
      switch (item.riskLevel) {
        case 'low': totalRisk += 25; break;
        case 'medium': totalRisk += 50; break;
        case 'high': totalRisk += 75; break;
      }
    });
    return Math.min(100, totalRisk / cartItems.length);
  };

  /**
   * Detect segregation of duties conflicts
   */
  const detectSODConflicts = () => {
    const conflicts: string[] = [];
    for (let i = 0; i < cartItems.length; i++) {
      for (let j = i + 1; j < cartItems.length; j++) {
        const item1 = cartItems[i];
        const item2 = cartItems[j];
        if (item1.toxicCombinations?.includes(item2.name) ||
          item2.toxicCombinations?.includes(item1.name)) {
          conflicts.push(`${item1.name} conflicts with ${item2.name}`);
        }
      }
    }
    return conflicts;
  };

  /**
   * Check if form can be submitted
   */
  const canSubmit = () => {
    return cartItems.length > 0 &&
      globalJustification.trim() !== '' &&
      globalJustification.length <= MAX_LENGTH &&
      !submitting &&
      !clearingCart &&
      removingItems.size === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async () => {
    const selfRequests = cartItems.filter(item => item.requestTarget === 'self');
    const othersRequests = cartItems.filter(item => item.requestTarget === 'others');

    const requestData = {
      items: cartItems.map(item => {
        const itemReq = getItemRequest(item.cartId || item.id);
        return {
          cartItemId: item.cartId!,
          itemId: item.id,
          validityDays: itemReq.validityDays,
          urgency: itemReq.urgency,
          justification: itemReq.justification,
        };
      }),
      overallJustification: globalJustification,
      selfRequestCount: selfRequests.length,
      othersRequestCount: othersRequests.length,
      totalBeneficiaries: [...new Set(othersRequests.flatMap(r => r.beneficiaries.map(b => b.id)))].length,
    };

    await onSubmitRequest(requestData);

    setItemRequests({});
    setGlobalJustification('');
    setExpandedBeneficiaries({});
  };

  // Clean up removingItems when cartItems changes
  React.useEffect(() => {
    const currentCartIds = new Set(cartItems.map(item => item.cartId).filter(Boolean));
    setRemovingItems(prev => {
      const next = new Set(prev);
      Array.from(next).forEach(id => {
        if (!currentCartIds.has(id)) {
          next.delete(id);
        }
      });
      return next;
    });
  }, [cartItems]);

  const riskScore = calculateRiskScore();
  const sodConflicts = detectSODConflicts();

  const selfRequestCount = cartItems.filter(item => item.requestTarget === 'self').length;
  const othersRequestCount = cartItems.filter(item => item.requestTarget === 'others').length;
  const totalBeneficiaries = [...new Set(
    cartItems
      .filter(item => item.requestTarget === 'others')
      .flatMap(item => item.beneficiaries.map(b => b.id))
  )].length;

  const anyOperationInProgress = submitting || clearingCart || removingItems.size > 0 || refreshing;

  return (
    <TooltipProvider>
      {/* Discard Changes Confirmation */}
      <AlertDialog open={showDiscardConfirm} onOpenChange={setShowDiscardConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard Changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes in your cart request. Are you sure you want to close without saving?
              Your changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleKeepEditing}>Keep Editing</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDiscardChanges}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent className="w-full sm:max-w-xl flex flex-col p-0 h-full">
          <div className="flex flex-col h-full">
            {/* Fixed Header */}

            <div className="flex-shrink-0 px-4 py-4">
              <SheetHeader className="p-0">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  <SheetTitle>Request Cart ({cartItems.length})</SheetTitle>
                  {cartItems.length > 0 && onRefreshCart && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={handleRefreshCart}
                          disabled={anyOperationInProgress}
                        >
                          {refreshing ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <RefreshCw className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>Refresh cart to get latest item names</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
                <SheetDescription>
                  Review and submit your access requests
                </SheetDescription>
              </SheetHeader>
            </div>

            {/* Empty State */}
            {cartItems.length === 0 ? (
              <div className="flex-1 flex items-center justify-center px-4">
                <div className="flex flex-col items-center justify-center text-center">
                  <ShoppingCart className="h-16 w-16 text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">Your cart is empty</h3>
                  <p className="text-sm text-muted-foreground">
                    Add access items from the catalog to create a request.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Request Summary Badges with Tooltips */}
                {(selfRequestCount > 0 || othersRequestCount > 0) && (
                  <div className="flex-shrink-0 px-4 pt-3 flex gap-2 flex-wrap">
                    {selfRequestCount > 0 && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="outline" className="gap-1 cursor-help">
                            <User className="h-3 w-3" />
                            {selfRequestCount} for self
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Requests for your own access</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                    {othersRequestCount > 0 && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="secondary" className="gap-1 cursor-help">
                            <Users className="h-3 w-3" />
                            {othersRequestCount} for others ({totalBeneficiaries} user{totalBeneficiaries !== 1 ? 's' : ''})
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Requests on behalf of {totalBeneficiaries} user{totalBeneficiaries !== 1 ? 's' : ''}</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                )}

                {/* Risk Score Alert with Tooltip */}
                {/* {riskScore > 50 && (
                  <div className="flex-shrink-0 px-4 pt-3">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Alert variant="destructive" className="py-2 cursor-help">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription className="text-xs">
                            High risk score ({Math.round(riskScore)}%) - Review required
                          </AlertDescription>
                        </Alert>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Combined risk level across all items. High risk requests may require additional approval.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                )} */}

                {/* SOD Conflicts Alert with Tooltip */}
                {/* {sodConflicts.length > 0 && (
                  <div className="flex-shrink-0 px-4 pt-3">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Alert variant="destructive" className="py-2 cursor-help">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription className="text-xs">
                            {sodConflicts.length} segregation of duties conflict{sodConflicts.length > 1 ? 's' : ''} detected
                          </AlertDescription>
                        </Alert>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="max-w-xs">
                          <p className="font-medium mb-1">Conflicts detected:</p>
                          <ul className="list-disc pl-4 text-xs">
                            {sodConflicts.map((conflict, index) => (
                              <li key={index}>{conflict}</li>
                            ))}
                          </ul>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                )} */}

                {/* Scrollable Content Area */}
                <ScrollArea className="flex-1 min-h-0 px-4">
                  <div className="space-y-4 py-3">
                    {/* Cart Items */}
                    <div className="space-y-2">
                      {cartItems.map((item) => {
                        const itemId = item.cartId || item.id;
                        const itemRequest = getItemRequest(itemId);
                        const isExpanded = expandedBeneficiaries[itemId] ?? false;
                        const hasBeneficiaries = item.requestTarget === 'others' && item.beneficiaries.length > 0;
                        const isRemoving = removingItems.has(itemId);

                        return (
                          <div
                            key={itemId}
                            className={`border rounded-lg p-3 transition-opacity ${isRemoving ? 'opacity-50' : 'opacity-100'
                              }`}
                          >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-1">
                                  <span className="font-medium text-sm truncate">{item.name}</span>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Badge
                                        variant="secondary"
                                        className={cn(
                                          "text-[10px] px-1.5 h-4 shrink-0 cursor-help capitalize",
                                          getRiskBadgeClass(item.riskLevel)
                                        )}
                                      >
                                        {item.riskLevel?.charAt(0).toUpperCase() + item.riskLevel?.slice(1).toLowerCase()}
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                      <p>Risk Level: {item.riskLevel?.charAt(0).toUpperCase() + item.riskLevel?.slice(1).toLowerCase()}</p>
                                    </TooltipContent>
                                  </Tooltip>

                                  {/* {item.maxValidityDays && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Badge variant="outline" className="text-[10px] px-1.5 h-4 cursor-help">
                                          Max {item.maxValidityDays}d
                                        </Badge>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Maximum validity period: {item.maxValidityDays} days</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  )} */}
                                </div>

                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge
                                      variant={item.requestTarget === 'self' ? 'outline' : 'secondary'}
                                      className="text-[10px] px-1.5 h-4 gap-0.5 font-normal cursor-help"
                                    >
                                      {item.requestTarget === 'self' ? (
                                        <>
                                          <User className="h-2.5 w-2.5" />
                                          Self
                                        </>
                                      ) : (
                                        <>
                                          <Users className="h-2.5 w-2.5" />
                                          {item.beneficiaries.length} user{item.beneficiaries.length !== 1 ? 's' : ''}
                                        </>
                                      )}
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {item.requestTarget === 'self' ? (
                                      <p>Requesting access for yourself</p>
                                    ) : (
                                      <p>Requesting access for {item.beneficiaries.length} user{item.beneficiaries.length !== 1 ? 's' : ''}</p>
                                    )}
                                  </TooltipContent>
                                </Tooltip>
                              </div>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 -mt-1 -mr-1 shrink-0"
                                    onClick={() => handleRemoveItem(itemId)}
                                    disabled={anyOperationInProgress}
                                  >
                                    {isRemoving ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      <X className="h-3.5 w-3.5" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="left">
                                  <p>Remove item from cart</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>

                            {/* Beneficiaries */}
                            {hasBeneficiaries && (
                              <div className="mb-3">
                                <Collapsible open={isExpanded} onOpenChange={() => toggleBeneficiaries(itemId)}>
                                  <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                      <Users className="h-3.5 w-3.5" />
                                      Beneficiaries ({item.beneficiaries.length})
                                    </span>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => toggleBeneficiaries(itemId)}
                                          className="h-6 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
                                          disabled={anyOperationInProgress}
                                        >
                                          {isExpanded ? (
                                            <>
                                              <ChevronUp className="h-3.5 w-3.5" />
                                              Hide
                                            </>
                                          ) : (
                                            <>
                                              <ChevronDown className="h-3.5 w-3.5" />
                                              View all
                                            </>
                                          )}
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent side="bottom">
                                        <p className="text-xs">{isExpanded ? 'Collapse' : 'Expand'} beneficiary list</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </div>

                                  {/* Preview of first few beneficiaries when collapsed */}
                                  {!isExpanded && (
                                    <div className="flex flex-wrap gap-1.5 mb-2">
                                      {item.beneficiaries.slice(0, 3).map((user) => (
                                        <Tooltip key={user.id}>
                                          <TooltipTrigger asChild>
                                            <Badge variant="secondary" className="gap-1 px-2 py-0 h-6 text-xs font-normal cursor-help">
                                              <User className="h-2.5 w-2.5" />
                                              {user.name}
                                            </Badge>
                                          </TooltipTrigger>
                                          <TooltipContent side="top" className="text-xs">
                                            <p>{user.name}</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      ))}
                                      {item.beneficiaries.length > 3 && (
                                        <Badge variant="outline" className="h-6 px-2 text-xs font-normal">
                                          +{item.beneficiaries.length - 3} more
                                        </Badge>
                                      )}
                                    </div>
                                  )}

                                  {/* Expanded full list */}
                                  <CollapsibleContent>
                                    <div className="mt-2">
                                      <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                                        {item.beneficiaries.map((user) => (
                                          <Tooltip key={user.id}>
                                            <TooltipTrigger asChild>
                                              <div className="flex items-center gap-2 text-xs bg-muted/30 rounded px-2 py-1.5 cursor-help hover:bg-muted/50 transition-colors">
                                                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                                                  <User className="h-3 w-3 text-primary" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                  <p className="font-medium truncate">{user.name}</p>
                                                </div>
                                              </div>
                                            </TooltipTrigger>
                                            <TooltipContent side="right" className="text-xs">
                                              <p>{user.name}</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        ))}
                                      </div>
                                      <p className="text-[10px] text-muted-foreground text-right pt-1">
                                        Total: {item.beneficiaries.length} beneficiary{item.beneficiaries.length !== 1 ? 'ies' : 'y'}
                                      </p>
                                    </div>
                                  </CollapsibleContent>
                                </Collapsible>
                              </div>
                            )}

                            {/* Request Details */}
                            <div className="space-y-2">
                              <div className="grid grid-cols-2 gap-2">
                                <div className="w-full">
                                  <div className="flex items-center gap-1">
                                    <label className="text-[10px] font-medium text-muted-foreground">Days</label>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <HelpCircle className="h-3 w-3 text-muted-foreground/50" />
                                      </TooltipTrigger>
                                      <TooltipContent side="top">
                                        <p>Number of days this access is needed for</p>
                                        {/* <p className="text-xs text-muted-foreground">Max: {item.maxValidityDays || 365} days</p> */}
                                      </TooltipContent>
                                    </Tooltip>
                                  </div>
                                  <Input
                                    type="number"
                                    className="h-7 text-xs mt-0.5 px-2 w-full"
                                    value={itemRequest.validityDays}
                                    onChange={(e) => updateItemRequest(itemId, 'validityDays', parseInt(e.target.value))}
                                    min={1}
                                    max={item.maxValidityDays || 365}
                                    disabled={anyOperationInProgress}
                                  />
                                </div>
                                <div className="w-full">
                                  <div className="flex items-center gap-1">
                                    <label className="text-[10px] font-medium text-muted-foreground">Urgency</label>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <HelpCircle className="h-3 w-3 text-muted-foreground/50" />
                                      </TooltipTrigger>
                                      <TooltipContent side="top">
                                        <p>Priority level for this request</p>
                                        <ul className="list-disc pl-4 text-xs mt-1">
                                          <li>Low: Standard processing</li>
                                          <li>Medium: Expedited if possible</li>
                                          <li>High: Urgent, immediate attention</li>
                                        </ul>
                                      </TooltipContent>
                                    </Tooltip>
                                  </div>
                                  <Select
                                    value={itemRequest.urgency}
                                    onValueChange={(value) => updateItemRequest(itemId, 'urgency', value)}
                                    disabled={anyOperationInProgress}
                                  >
                                    <SelectTrigger className="h-7 text-xs mt-0.5 px-2 w-full [&[data-size]]:h-7">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="low" className="text-xs">Low</SelectItem>
                                      <SelectItem value="medium" className="text-xs">Medium</SelectItem>
                                      <SelectItem value="high" className="text-xs">High</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              <div className="w-full">
                                <div className="flex items-center gap-1">
                                  <label className="text-[10px] font-medium text-muted-foreground">Justification (Optional)</label>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <HelpCircle className="h-3 w-3 text-muted-foreground/50" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Provide a reason for requesting this specific access</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                                <Textarea
                                  className="text-xs mt-0.5 whitespace-pre-wrap break-words"
                                  placeholder="Optional: Why do you need this access?"
                                  value={itemRequest.justification}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    if (value.length <= MAX_LENGTH) {
                                      updateItemRequest(itemId, 'justification', value);
                                    }
                                  }}
                                  disabled={anyOperationInProgress}
                                  maxLength={MAX_LENGTH}
                                />
                                {getCharacterCounter(itemRequest.justification)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Global Justification with Tooltip */}
                    <div className="space-y-3 pt-2">
                      <div>
                        <div className="flex items-center gap-1">
                          <label className="text-sm font-medium">Overall Justification *</label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-muted-foreground/50" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">
                                Provide a business justification for this entire request.
                                This will be reviewed by approvers.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Textarea
                          className="mt-2 text-xs whitespace-pre-wrap break-words"
                          placeholder="Provide an overall justification for this access request..."
                          value={globalJustification}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value.length <= MAX_LENGTH) {
                              setGlobalJustification(value);
                            }
                          }}
                          disabled={anyOperationInProgress}
                          maxLength={MAX_LENGTH}
                        />
                        {getCharacterCounter(globalJustification)}
                      </div>
                    </div>
                  </div>
                </ScrollArea>

                {/* Fixed Footer with Action Buttons */}
                <div className="flex-shrink-0 px-4 py-4">
                  <div className="flex gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          onClick={handleClearCart}
                          className="flex-1"
                          disabled={anyOperationInProgress}
                        >
                          {clearingCart ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Clearing...
                            </>
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Clear
                            </>
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>Remove all items from cart</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={handleSubmit}
                          disabled={!canSubmit()}
                          className="flex-1"
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              Submit
                            </>
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        {!canSubmit() ? (
                          <div className="text-xs">
                            {cartItems.length === 0 && "Add items to cart first"}
                            {cartItems.length > 0 && globalJustification.trim() === '' && "Overall justification is required"}
                            {anyOperationInProgress && "Please wait for current operation to complete"}
                          </div>
                        ) : (
                          <p>Submit all requests for approval</p>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </TooltipProvider>
  );
};

export default CartSlideout;