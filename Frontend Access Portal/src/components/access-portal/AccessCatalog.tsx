
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Search, Filter, Plus, Shield, AlertTriangle,
  Clock, Sparkles, Star, Users, Settings, Calculator, FileText
} from 'lucide-react';
import { AccessItem } from '@/data/mock-access-portal';

interface AccessCatalogProps {
  accessItems: AccessItem[];
  onAddToCart: (item: AccessItem) => void;
  cartItems: AccessItem[];
}

const AccessCatalog: React.FC<AccessCatalogProps> = ({
  accessItems,
  onAddToCart,
  cartItems
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showRecommendedOnly, setShowRecommendedOnly] = useState(false);
  const [showNewOnly, setShowNewOnly] = useState(false);

  const filteredItems = useMemo(() => {
    return accessItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesDepartment = selectedDepartment === 'all' || item.department === selectedDepartment;
      const matchesRiskLevel = selectedRiskLevel === 'all' || item.riskLevel === selectedRiskLevel;
      const matchesType = selectedType === 'all' || item.type === selectedType;
      const matchesRecommended = !showRecommendedOnly || item.isRecommended;
      const matchesNew = !showNewOnly || item.isNew;

      return matchesSearch && matchesDepartment && matchesRiskLevel &&
        matchesType && matchesRecommended && matchesNew;
    });
  }, [accessItems, searchTerm, selectedDepartment, selectedRiskLevel, selectedType, showRecommendedOnly, showNewOnly]);

  const departments = Array.from(new Set(accessItems.map(item => item.department)));
  const riskLevels = ['low', 'medium', 'high', 'critical'];
  const types = ['application', 'role', 'group', 'entitlement'];

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'application': return <FileText className="h-4 w-4" />;
      case 'role': return <Shield className="h-4 w-4" />;
      case 'group': return <Users className="h-4 w-4" />;
      case 'entitlement': return <Settings className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const isInCart = (itemId: string) => {
    // return cartItems.some(item => item.id === itemId);
    return false;
  };

  /**
 * Get count of how many times this item is in the cart
 */
  const getCartCount = (itemId: string) => {
    return cartItems.filter(item => item.id === itemId).length;
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filter Access Items
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search applications, roles, groups..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedRiskLevel} onValueChange={setSelectedRiskLevel}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Risk Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk Levels</SelectItem>
                  {riskLevels.map(risk => (
                    <SelectItem key={risk} value={risk}>{risk}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {types.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="recommended"
                checked={showRecommendedOnly}
                onCheckedChange={(checked) => setShowRecommendedOnly(checked === true)}
              />
              <label htmlFor="recommended" className="text-sm font-medium flex items-center gap-1">
                <Star className="h-3 w-3 text-yellow-500" />
                Recommended Only
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="new"
                checked={showNewOnly}
                onCheckedChange={(checked) => setShowNewOnly(checked === true)}
              />
              <label htmlFor="new" className="text-sm font-medium flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-blue-500" />
                New Items Only
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Access Catalog ({filteredItems.length} items)
        </h2>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Sparkles className="h-4 w-4 text-blue-500" />
          AI recommendations based on your role and peers
        </div>
      </div>

      {/* Access Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <Card key={item.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-brand-teal/10 rounded-lg">
                    {getTypeIcon(item.type)}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      {item.name}
                      {item.isRecommended && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                      {item.isNew && <Badge variant="secondary" className="text-xs">NEW</Badge>}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Details */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium">Owner:</span>
                  <div className="text-gray-600">{item.owner}</div>
                </div>
                <div>
                  <span className="font-medium">Department:</span>
                  <div className="text-gray-600">{item.department}</div>
                </div>
              </div>

              {/* Risk and Compliance */}
              <div className="flex items-center justify-between">
                <Badge className={getRiskBadgeColor(item.riskLevel)}>
                  {item.riskLevel.toUpperCase()} RISK
                </Badge>
                {item.complianceFlags.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Shield className="h-3 w-3 text-blue-600" />
                    <span className="text-xs text-blue-600">
                      {item.complianceFlags.join(', ')}
                    </span>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {item.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {item.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{item.tags.length - 3}
                  </Badge>
                )}
              </div>

              {/* Workflow Info */}
              <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>Max {item.maxValidityDays} days</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-3 w-3" />
                  <span>{item.requestCount} requests</span>
                </div>
              </div>

              {/* Warnings */}
              {(item.prerequisites?.length || item.toxicCombinations?.length) && (
                <div className="flex items-start gap-2 p-2 bg-yellow-50 rounded-md">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div className="text-xs text-yellow-800">
                    {item.prerequisites?.length && (
                      <div>Prerequisites: {item.prerequisites.join(', ')}</div>
                    )}
                    {item.toxicCombinations?.length && (
                      <div>Conflicts with: {item.toxicCombinations.join(', ')}</div>
                    )}
                  </div>
                </div>
              )}
              {/* Add to cart button */}
              <Button
                onClick={() => onAddToCart(item)}
                className="w-full"
                variant={getCartCount(item.id) > 0 ? "outline" : "default"}
              >
                <Plus className="h-4 w-4 mr-2" />
                {getCartCount(item.id) > 0
                  ? `In Cart (${getCartCount(item.id)})`
                  : 'Add to Cart'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No access items found</h3>
          <p className="text-gray-600">
            Try adjusting your search criteria or filters to find what you're looking for.
          </p>
        </div>
      )}
    </div>
  );
};

export default AccessCatalog;
