
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ShoppingCart, Trash2, AlertTriangle, Clock, 
  Send, X, Shield, Zap
} from 'lucide-react';
import { AccessItem } from '@/data/mock-access-portal';

interface RequestCartProps {
  cartItems: AccessItem[];
  onRemoveFromCart: (itemId: string) => void;
  onClearCart: () => void;
  onSubmitRequest: (requestData: any) => void;
}

interface CartItemRequest {
  itemId: string;
  justification: string;
  validityPeriod: number;
  urgency: 'low' | 'medium' | 'high';
  emergencyAccess: boolean;
}

const RequestCart: React.FC<RequestCartProps> = ({
  cartItems,
  onRemoveFromCart,
  onClearCart,
  onSubmitRequest
}) => {
  const [itemRequests, setItemRequests] = useState<Record<string, CartItemRequest>>({});
  const [globalJustification, setGlobalJustification] = useState('');
  const [emergencyRequest, setEmergencyRequest] = useState(false);

  const updateItemRequest = (itemId: string, field: keyof CartItemRequest, value: any) => {
    setItemRequests(prev => ({
      ...prev,
      [itemId]: {
        itemId,
        justification: '',
        validityPeriod: 30,
        urgency: 'medium',
        emergencyAccess: false,
        ...prev[itemId],
        [field]: value
      }
    }));
  };

  const getItemRequest = (itemId: string): CartItemRequest => {
    return itemRequests[itemId] || {
      itemId,
      justification: '',
      validityPeriod: 30,
      urgency: 'medium',
      emergencyAccess: false
    };
  };

  const calculateRiskScore = () => {
    let totalRisk = 0;
    cartItems.forEach(item => {
      switch (item.riskLevel) {
        case 'low': totalRisk += 25; break;
        case 'medium': totalRisk += 50; break;
        case 'high': totalRisk += 75; break;
        case 'critical': totalRisk += 100; break;
      }
    });
    return Math.min(100, totalRisk / cartItems.length);
  };

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

  const getComplianceIssues = () => {
    const allFlags = new Set<string>();
    cartItems.forEach(item => {
      item.complianceFlags.forEach(flag => allFlags.add(flag));
    });
    return Array.from(allFlags);
  };

  const canSubmit = () => {
    return cartItems.length > 0 && 
           globalJustification.trim() !== '' &&
           cartItems.every(item => getItemRequest(item.id).justification.trim() !== '');
  };

  const handleSubmit = () => {
    const requestData = {
      items: cartItems.map(item => ({
        accessItem: item,
        ...getItemRequest(item.id)
      })),
      globalJustification,
      emergencyRequest,
      riskScore: calculateRiskScore(),
      sodConflicts: detectSODConflicts(),
      complianceFlags: getComplianceIssues()
    };
    
    onSubmitRequest(requestData);
  };

  const riskScore = calculateRiskScore();
  const sodConflicts = detectSODConflicts();
  const complianceFlags = getComplianceIssues();

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
        <p className="text-gray-600">
          Add access items from the catalog to create an access request.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cart Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Request Cart ({cartItems.length} items)
        </h2>
        <Button variant="outline" onClick={onClearCart} size="sm">
          <Trash2 className="h-4 w-4 mr-2" />
          Clear Cart
        </Button>
      </div>

      {/* Risk and Compliance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Request Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                riskScore < 50 ? 'text-green-600' : 
                riskScore < 75 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {Math.round(riskScore)}
              </div>
              <div className="text-sm text-gray-600">Risk Score</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                sodConflicts.length > 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {sodConflicts.length}
              </div>
              <div className="text-sm text-gray-600">SoD Conflicts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {complianceFlags.length}
              </div>
              <div className="text-sm text-gray-600">Compliance Flags</div>
            </div>
          </div>

          {sodConflicts.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Segregation of Duties Conflicts Detected:</strong>
                <ul className="mt-2 ml-4 list-disc">
                  {sodConflicts.map((conflict, index) => (
                    <li key={index}>{conflict}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {complianceFlags.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Compliance Requirements:</span>
              {complianceFlags.map(flag => (
                <Badge key={flag} variant="outline">{flag}</Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cart Items */}
      <div className="space-y-4">
        {cartItems.map((item) => {
          const itemRequest = getItemRequest(item.id);
          return (
            <Card key={item.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-medium">{item.name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={
                        item.riskLevel === 'low' ? 'bg-green-100 text-green-800' :
                        item.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        item.riskLevel === 'high' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {item.riskLevel.toUpperCase()}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        Max {item.maxValidityDays} days
                      </span>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onRemoveFromCart(item.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Validity Period (days)
                    </label>
                    <Input
                      type="number"
                      value={itemRequest.validityPeriod}
                      onChange={(e) => updateItemRequest(item.id, 'validityPeriod', parseInt(e.target.value))}
                      min={1}
                      max={item.maxValidityDays}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Urgency Level
                    </label>
                    <Select 
                      value={itemRequest.urgency} 
                      onValueChange={(value) => updateItemRequest(item.id, 'urgency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <Checkbox 
                      id={`emergency-${item.id}`}
                      checked={itemRequest.emergencyAccess}
                      onCheckedChange={(checked) => updateItemRequest(item.id, 'emergencyAccess', checked === true)}
                    />
                    <label htmlFor={`emergency-${item.id}`} className="text-sm font-medium flex items-center gap-1">
                      <Zap className="h-3 w-3 text-red-500" />
                      Emergency Access
                    </label>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Justification *
                  </label>
                  <Textarea
                    placeholder="Explain why you need this access..."
                    value={itemRequest.justification}
                    onChange={(e) => updateItemRequest(item.id, 'justification', e.target.value)}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Global Request Details */}
      <Card>
        <CardHeader>
          <CardTitle>Request Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Overall Justification *
            </label>
            <Textarea
              placeholder="Provide an overall justification for this access request..."
              value={globalJustification}
              onChange={(e) => setGlobalJustification(e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="emergency-request"
              checked={emergencyRequest}
              onCheckedChange={(checked) => setEmergencyRequest(checked === true)}
            />
            <label htmlFor="emergency-request" className="text-sm font-medium flex items-center gap-1">
              <Zap className="h-4 w-4 text-red-500" />
              This is an emergency request (requires immediate attention)
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={onClearCart}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={!canSubmit()}
          className="min-w-32"
        >
          <Send className="h-4 w-4 mr-2" />
          Submit Request
        </Button>
      </div>
    </div>
  );
};

export default RequestCart;
