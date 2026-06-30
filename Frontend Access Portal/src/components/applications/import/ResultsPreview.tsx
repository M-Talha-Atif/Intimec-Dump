
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  BarChart3, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Shield, 
  Users, 
  Bot,
  Eye,
  ExternalLink,
  Loader2,
  UserCheck,
  Building,
  TrendingUp,
  AlertCircle,
  Info,
  ChevronDown,
  Zap,
  Database
} from 'lucide-react';

interface ResultsPreviewProps {
  results: any[];
  isLoading: boolean;
  type: 'accounts' | 'entitlements';
  identityType: 'employee' | 'non-employee' | 'non-human';
  filters: any;
  onViewAll: () => void;
  onReviewRisk: () => void;
}

export function ResultsPreview({ 
  results, 
  isLoading, 
  type, 
  identityType, 
  filters,
  onViewAll,
  onReviewRisk 
}: ResultsPreviewProps) {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [showFullModal, setShowFullModal] = useState(false);

  const getRiskBadgeColor = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'outline';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'expired': return 'destructive';
      case 'pending': return 'outline';
      case 'on-leave': return 'secondary';
      case 'terminated': return 'destructive';
      default: return 'outline';
    }
  };

  const getMatchIcon = (matched: boolean) => {
    return matched ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <AlertTriangle className="h-4 w-4 text-yellow-500" />
    );
  };

  const getIdentityIcon = () => {
    switch (identityType) {
      case 'employee': return Users;
      case 'non-employee': return UserCheck;
      case 'non-human': return Bot;
      default: return Users;
    }
  };

  const getIdentityLabel = () => {
    switch (identityType) {
      case 'employee': return 'Employee';
      case 'non-employee': return 'Non-Employee';
      case 'non-human': return 'Non-Human';
      default: return 'Identity';
    }
  };

  const getContextualInfo = (result: any) => {
    switch (identityType) {
      case 'employee':
        return result.department ? `Dept: ${result.department}` : null;
      case 'non-employee':
        return result.sponsor ? `Sponsor: ${result.sponsor}` : null;
      case 'non-human':
        return result.owner ? `Owner: ${result.owner}` : null;
      default:
        return null;
    }
  };

  const getAnomalyBadges = (anomalies: string[] = []) => {
    const anomalyMap = {
      'unusual_access_pattern': { label: 'Unusual Access', color: 'text-orange-600 border-orange-300' },
      'elevated_privileges': { label: 'Elevated Privs', color: 'text-red-600 border-red-300' },
      'stale_account': { label: 'Stale', color: 'text-yellow-600 border-yellow-300' },
      'token_near_expiry': { label: 'Token Expiry', color: 'text-red-600 border-red-300' },
      'excessive_privileges': { label: 'Excessive Privs', color: 'text-red-600 border-red-300' },
      'rarely_assigned': { label: 'Rarely Used', color: 'text-blue-600 border-blue-300' },
      'high_cost': { label: 'High Cost', color: 'text-purple-600 border-purple-300' },
      'underutilized': { label: 'Underused', color: 'text-yellow-600 border-yellow-300' },
      'missing_expiry_date': { label: 'No Expiry', color: 'text-orange-600 border-orange-300' },
      'admin_level_access': { label: 'Admin Access', color: 'text-red-600 border-red-300' },
      'no_rotation_policy': { label: 'No Rotation', color: 'text-yellow-600 border-yellow-300' }
    };

    return anomalies.map(anomaly => {
      const config = anomalyMap[anomaly as keyof typeof anomalyMap];
      return config ? (
        <Badge key={anomaly} variant="outline" className={`text-xs ${config.color}`}>
          {config.label}
        </Badge>
      ) : null;
    }).filter(Boolean);
  };

  const toggleExpanded = (id: number) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const IdentityIcon = getIdentityIcon();

  if (isLoading) {
    return (
      <Card className="h-full sticky top-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Results Preview</span>
          </CardTitle>
          <CardDescription>Live preview of {getIdentityLabel().toLowerCase()} {type}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <IdentityIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">Processing {getIdentityLabel().toLowerCase()} {type}...</p>
              <p className="text-sm text-muted-foreground">Results will appear here as they're processed</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (results.length === 0) {
    return (
      <Card className="h-full sticky top-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Results Preview</span>
          </CardTitle>
          <CardDescription>Live preview of {getIdentityLabel().toLowerCase()} {type}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-2">
              <BarChart3 className="h-12 w-12 text-muted-foreground" />
              <IdentityIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No {getIdentityLabel().toLowerCase()} {type} found</p>
            <p className="text-sm text-muted-foreground">
              {filters.status?.length > 0 || filters.entitlementType?.length > 0 
                ? 'Try adjusting your filters or start import to see results'
                : 'Start import to see aggregation results or adjust your filters'
              }
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const matchedCount = results.filter(r => r.matched).length;
  const unmatchedCount = results.length - matchedCount;
  const highRiskCount = results.filter(r => ['critical', 'high'].includes(r.risk?.toLowerCase())).length;
  const criticalRiskCount = results.filter(r => r.risk?.toLowerCase() === 'critical').length;
  const anomalousCount = results.filter(r => r.anomalies && r.anomalies.length > 0).length;

  // Smart summary generation
  const generateSmartSummary = () => {
    const summaries = [];
    if (criticalRiskCount > 0) {
      summaries.push(`${criticalRiskCount} critical risk ${type} detected`);
    }
    if (anomalousCount > 0) {
      summaries.push(`${anomalousCount} items with anomalies`);
    }
    if (unmatchedCount > matchedCount) {
      summaries.push(`High unmatched ratio (${unmatchedCount}/${results.length})`);
    }
    return summaries;
  };

  const smartSummaries = generateSmartSummary();

  return (
    <>
      <Card className="h-full sticky top-0 flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <IdentityIcon className="h-4 w-4" />
            <span>Results Preview</span>
          </CardTitle>
          <CardDescription>
            Found {results.length} {getIdentityLabel().toLowerCase()} {type} • {matchedCount} matched • {highRiskCount} high risk
          </CardDescription>
          
          {/* Smart Summary Alerts */}
          {smartSummaries.length > 0 && (
            <div className="space-y-1 mt-2">
              {smartSummaries.map((summary, index) => (
                <div key={index} className="bg-amber-50 border border-amber-200 rounded px-2 py-1">
                  <div className="flex items-center space-x-2">
                    <Zap className="h-3 w-3 text-amber-600" />
                    <span className="text-xs text-amber-800 font-medium">{summary}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col space-y-4 min-h-0">
          {/* Enhanced Summary Stats */}
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="text-xl font-bold text-green-600">{matchedCount}</div>
              <div className="text-xs text-green-600">Matched</div>
              <div className="flex items-center justify-center mt-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
              </div>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="text-xl font-bold text-yellow-600">{unmatchedCount}</div>
              <div className="text-xs text-yellow-600">Unmatched</div>
              <div className="flex items-center justify-center mt-1">
                <AlertTriangle className="h-3 w-3 text-yellow-500" />
              </div>
            </div>
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="text-xl font-bold text-red-600">{highRiskCount}</div>
              <div className="text-xs text-red-600">High Risk</div>
              <div className="flex items-center justify-center mt-1">
                <Shield className="h-3 w-3 text-red-500" />
              </div>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-xl font-bold text-purple-600">{anomalousCount}</div>
              <div className="text-xs text-purple-600">Anomalies</div>
              <div className="flex items-center justify-center mt-1">
                <AlertCircle className="h-3 w-3 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Risk Distribution Alert */}
          {criticalRiskCount > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-800">
                  {criticalRiskCount} critical risk {type} detected
                </span>
              </div>
              <p className="text-xs text-red-700 mt-1">
                Review these items before completing the import
              </p>
            </div>
          )}

          <Separator />

          {/* Scrollable Results List */}
          <div className="flex-1 min-h-0">
            <ScrollArea className="h-full">
              <div className="space-y-3 pr-4">
                {results.slice(0, 10).map((result, index) => (
                  <div key={result.id || index} className="border rounded-lg p-3 space-y-2 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          {getMatchIcon(result.matched)}
                          <p className="font-medium text-sm truncate" title={result.name}>
                            {result.name}
                          </p>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-5 w-5 p-0"
                            onClick={() => toggleExpanded(result.id || index)}
                          >
                            <ChevronDown className={`h-3 w-3 transition-transform ${
                              expandedItems.has(result.id || index) ? 'rotate-180' : ''
                            }`} />
                          </Button>
                        </div>
                        <div className="flex items-center space-x-1 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {result.type}
                          </Badge>
                          <Badge variant={getRiskBadgeColor(result.risk)} className="text-xs">
                            {result.risk}
                          </Badge>
                        </div>
                        {result.scope && (
                          <p className="text-xs text-muted-foreground">Scope: {result.scope}</p>
                        )}
                        {getContextualInfo(result) && (
                          <p className="text-xs text-muted-foreground">{getContextualInfo(result)}</p>
                        )}
                        
                        {/* Anomaly Badges */}
                        {result.anomalies && result.anomalies.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {getAnomalyBadges(result.anomalies)}
                          </div>
                        )}
                        
                        {/* Expanded Details */}
                        {expandedItems.has(result.id || index) && (
                          <div className="mt-2 p-2 bg-muted/50 rounded text-xs space-y-1">
                            <div><strong>Source:</strong> {result.source || 'N/A'}</div>
                            {result.assignedCount && (
                              <div><strong>Assigned Count:</strong> {result.assignedCount}</div>
                            )}
                            {result.anomalies && result.anomalies.length > 0 && (
                              <div><strong>Anomalies:</strong> {result.anomalies.join(', ')}</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <Badge variant={getStatusBadgeColor(result.status)} className="text-xs">
                          {result.status}
                        </Badge>
                        {result.lastSeen && (
                          <span className="text-muted-foreground flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{result.lastSeen}</span>
                          </span>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {/* Load More Button for Pagination */}
                {results.length > 10 && (
                  <div className="text-center pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs"
                      onClick={() => setShowFullModal(true)}
                    >
                      <TrendingUp className="h-3 w-3 mr-1" />
                      View All {results.length} Results
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 border-t">
            <div className="flex flex-col space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs w-full"
                onClick={() => setShowFullModal(true)}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                View All {results.length} {getIdentityLabel()} {type}
              </Button>
              {highRiskCount > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs w-full text-red-600 border-red-200 hover:bg-red-50"
                  onClick={onReviewRisk}
                >
                  <Shield className="h-3 w-3 mr-1" />
                  Review High Risk Items ({highRiskCount})
                </Button>
              )}
              {anomalousCount > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs w-full text-purple-600 border-purple-200 hover:bg-purple-50"
                >
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Review Anomalies ({anomalousCount})
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Full Results Modal */}
      <Dialog open={showFullModal} onOpenChange={setShowFullModal}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>All {getIdentityLabel()} {type} Results</span>
              <Badge variant="outline">{results.length} items</Badge>
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Matched</TableHead>
                  <TableHead>Anomalies</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result, index) => (
                  <TableRow key={result.id || index}>
                    <TableCell className="font-medium">{result.name}</TableCell>
                    <TableCell>{result.type}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeColor(result.status)}>
                        {result.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRiskBadgeColor(result.risk)}>
                        {result.risk}
                      </Badge>
                    </TableCell>
                    <TableCell>{getMatchIcon(result.matched)}</TableCell>
                    <TableCell>
                      {result.anomalies && result.anomalies.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {getAnomalyBadges(result.anomalies)}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">None</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
