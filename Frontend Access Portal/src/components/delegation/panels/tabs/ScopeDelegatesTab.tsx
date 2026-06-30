
import React from 'react';
import { TreeNode } from '@/types/hierarchical-delegation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { UserPlus, Eye, Calendar, Shield } from 'lucide-react';

interface ScopeDelegatesTabProps {
  nodeId: string;
  node?: TreeNode | null;
  onAssignDelegate?: (nodeId: string) => void;
  onPreviewAccess?: (nodeId: string) => void;
}

export function ScopeDelegatesTab({
  nodeId,
  node,
  onAssignDelegate,
  onPreviewAccess
}: ScopeDelegatesTabProps) {
  const delegates = node?.delegates || [];

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner':
        return 'default';
      case 'admin':
        return 'secondary';
      case 'viewer':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Delegates</h3>
          <p className="text-sm text-muted-foreground">
            Manage who can administer this scope
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onPreviewAccess?.(nodeId)}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview Access
          </Button>
          <Button onClick={() => onAssignDelegate?.(nodeId)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Assign Delegate
          </Button>
        </div>
      </div>

      {/* Delegates List */}
      <div className="space-y-4">
        {delegates.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <UserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Delegates Assigned</h3>
                <p className="text-muted-foreground mb-4">
                  Assign delegates to help manage this scope
                </p>
                <Button onClick={() => onAssignDelegate?.(nodeId)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Assign First Delegate
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          delegates.map(delegate => (
            <Card key={delegate.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback>
                        {getInitials(delegate.userName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{delegate.userName}</h4>
                        <Badge variant={getRoleBadgeVariant(delegate.role)}>
                          {delegate.role}
                        </Badge>
                        {delegate.allowSiblingAccess && (
                          <Badge variant="outline" className="text-xs">
                            Sibling Access
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Assigned {new Date(delegate.assigned).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Permissions */}
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Permissions</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {delegate.permissions.map(permission => (
                      <Badge key={permission} variant="outline" className="text-xs">
                        {permission}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Time Window */}
                {delegate.timeWindow && (
                  <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-2 text-orange-700">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm font-medium">Time-Limited Access</span>
                    </div>
                    <p className="text-sm text-orange-600 mt-1">
                      {new Date(delegate.timeWindow.start).toLocaleDateString()} to{' '}
                      {new Date(delegate.timeWindow.end).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {delegates.filter(d => d.role === 'owner').length}
              </p>
              <p className="text-sm text-muted-foreground">Owners</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {delegates.filter(d => d.role === 'admin').length}
              </p>
              <p className="text-sm text-muted-foreground">Admins</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-600">
                {delegates.filter(d => d.role === 'viewer').length}
              </p>
              <p className="text-sm text-muted-foreground">Viewers</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
