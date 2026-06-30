import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Users, Shield } from 'lucide-react';
import { aiService } from '@/services/accessReviewService';
import type { RoleMiningResult } from '@/types/accessReview';
import { toast } from 'sonner';

export const RoleMiningPanel: React.FC = () => {
  const [results, setResults] = useState<RoleMiningResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      const data = await aiService.getRoleMiningResults();
      setResults(data);
    } catch (error) {
      toast.error('Failed to load role mining results');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-amber-100 text-amber-700';
      case 'high': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return <Card><CardContent className="p-8 text-center">Analyzing access patterns...</CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          AI Role Mining Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {results.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No role suggestions available yet
          </div>
        ) : (
          results.map(result => (
            <Card key={result.id}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{result.suggestedRoleName}</p>
                      <p className="text-xs text-muted-foreground mt-1">{result.businessJustification}</p>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      <Badge variant="secondary">{result.confidence}% confidence</Badge>
                      <Badge className={getRiskColor(result.riskLevel)} variant="secondary">
                        {result.riskLevel} risk
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="p-2">
                        <div className="flex items-center gap-2">
                          <Users className="h-3 w-3 text-blue-600" />
                          <div>
                            <p className="text-xs text-blue-700">Potential Members</p>
                            <p className="text-sm font-bold text-blue-600">{result.potentialMembers}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="p-2">
                        <div className="flex items-center gap-2">
                          <Shield className="h-3 w-3 text-green-600" />
                          <div>
                            <p className="text-xs text-green-700">Entitlements</p>
                            <p className="text-sm font-bold text-green-600">{result.commonEntitlements.length}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div>
                    <p className="text-xs font-medium mb-1">Common Entitlements:</p>
                    <div className="flex flex-wrap gap-1">
                      {result.commonEntitlements.slice(0, 3).map((ent, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {ent}
                        </Badge>
                      ))}
                      {result.commonEntitlements.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{result.commonEntitlements.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Button size="sm" className="w-full">Create Role</Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </CardContent>
    </Card>
  );
};
