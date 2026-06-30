
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, Database, Activity } from 'lucide-react';
import { type User } from '@/data/mock-users';
import useIdentityShadows from '@/hooks/identities/useIdentityShadows';

interface IdentityQuickStatsCardProps {
  user: User;
}

const IdentityQuickStatsCard: React.FC<IdentityQuickStatsCardProps> = ({ user }) => {
  const { data: shadowsResponse } = useIdentityShadows(user.id);
  const accountsCount = shadowsResponse?.totalCount ?? 0;
  const rolesCount = user.access?.filter(a => a.type === 'Role').length || 0;
  const recentActivityCount = user.activity?.length || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {/* <Activity className="h-5 w-5" /> */}
          <span>Quick Stats</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="text-2xl font-bold text-blue-600">{rolesCount}</span>
            </div>
            <div className="text-sm text-blue-800">Roles</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Database className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-bold text-green-600">{accountsCount}</span>
            </div>
            <div className="text-sm text-green-800">Accounts</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Shield className="h-5 w-5 text-purple-600" />
              <span className="text-2xl font-bold text-gray-500">
                —
              </span>
            </div>
            <div className="text-sm text-purple-800">Risk Score</div>
          </div>
          
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Activity className="h-5 w-5 text-orange-600" />
              <span className="text-2xl font-bold text-orange-600">{recentActivityCount}</span>
            </div>
            <div className="text-sm text-orange-800">Recent Actions</div>
          </div>
        </div>
        
        <div className="mt-4 pt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Risk Level</span>
            <Badge variant="outline">
              Not Scored
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">Risk scoring requires a risk engine integration.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default IdentityQuickStatsCard;
