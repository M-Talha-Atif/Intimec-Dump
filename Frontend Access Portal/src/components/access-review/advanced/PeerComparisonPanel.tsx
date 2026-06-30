import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import type { PeerComparison } from '@/types/accessReview';

interface PeerComparisonPanelProps {
  comparison: PeerComparison;
}

export const PeerComparisonPanel: React.FC<PeerComparisonPanelProps> = ({ comparison }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Users className="h-4 w-4" />
          Peer Comparison Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-xs text-green-700">Common</p>
                  <p className="text-lg font-bold text-green-600">{comparison.commonEntitlements.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <div>
                  <p className="text-xs text-amber-700">Unique</p>
                  <p className="text-lg font-bold text-amber-600">{comparison.uniqueEntitlements.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-xs text-blue-700">Missing</p>
                  <p className="text-lg font-bold text-blue-600">{comparison.missingEntitlements.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">Similar Users</p>
          <div className="space-y-2">
            {comparison.similarUsers.map(user => (
              <Card key={user.id}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.jobTitle} • {user.department}</p>
                    </div>
                    <Badge variant="secondary">{user.matchScore}% match</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {comparison.recommendedRole && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-3">
              <p className="text-sm font-medium text-blue-800">Recommended Role</p>
              <p className="text-xs text-blue-700 mt-1">{comparison.recommendedRole}</p>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};
