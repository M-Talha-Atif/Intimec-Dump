
import React from 'react';
import { TreeNode } from '@/types/hierarchical-delegation';
import { DelegatedScope } from '@/lib/delegation/bridge/cards-tree-bridge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, LinkIcon, Building, MapPin, Users, Calendar } from 'lucide-react';

interface ScopeOverviewTabProps {
  scope?: DelegatedScope;
  node?: TreeNode | null;
  isLinked: boolean;
  onOpenInTree?: () => void;
  onLinkScope?: () => void;
}

export function ScopeOverviewTab({
  scope,
  node,
  isLinked,
  onOpenInTree,
  onLinkScope
}: ScopeOverviewTabProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'organizational':
        return <Building className="h-4 w-4" />;
      case 'geographical':
        return <MapPin className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'expired':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Link Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            Link Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={isLinked ? 'default' : 'secondary'}>
                {isLinked ? 'Linked to Tree' : 'Unlinked'}
              </Badge>
              {isLinked && node && (
                <span className="text-sm text-muted-foreground">
                  → {node.name}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              {isLinked && onOpenInTree && (
                <Button variant="outline" size="sm" onClick={onOpenInTree}>
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Open in Tree
                </Button>
              )}
              {!isLinked && onLinkScope && (
                <Button variant="outline" size="sm" onClick={onLinkScope}>
                  <LinkIcon className="h-4 w-4 mr-1" />
                  Link to Tree
                </Button>
              )}
            </div>
          </div>
          
          {isLinked && (
            <p className="text-sm text-muted-foreground">
              This scope is linked to a tree node. Settings and object assignments will be managed through the tree structure.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Scope Information */}
      {scope && (
        <Card>
          <CardHeader>
            <CardTitle>Scope Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <p className="text-sm">{scope.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Type</label>
                <div className="flex items-center gap-2">
                  {getTypeIcon(scope.type)}
                  <span className="text-sm capitalize">{scope.type}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Administrator</label>
                <p className="text-sm">{scope.administrator}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <Badge variant={getStatusColor(scope.status)}>
                  {scope.status}
                </Badge>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Users</label>
                <p className="text-lg font-semibold">{scope.userCount}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Applications</label>
                <p className="text-lg font-semibold">{scope.applicationsCount}</p>
              </div>
            </div>

            {scope.timeRestriction && (
              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center gap-2 text-orange-700">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-medium">Time-Limited Access</span>
                </div>
                <p className="text-sm text-orange-600 mt-1">
                  {scope.timeRestriction.start} to {scope.timeRestriction.end}
                </p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-muted-foreground">Permissions</label>
              <div className="flex flex-wrap gap-1 mt-1">
                {scope.permissions.map(permission => (
                  <Badge key={permission} variant="outline" className="text-xs">
                    {permission}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tree Node Information */}
      {node && (
        <Card>
          <CardHeader>
            <CardTitle>Tree Node Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Node Name</label>
                <p className="text-sm">{node.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Node Type</label>
                <div className="flex items-center gap-2">
                  {getTypeIcon(node.type)}
                  <span className="text-sm capitalize">{node.type}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <Badge variant={getStatusColor(node.status)}>
                  {node.status}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Delegates</label>
                <p className="text-lg font-semibold">{node.delegates.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
