import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, ExternalLink, LinkIcon, Settings } from "lucide-react";
import { Building, MapPin, Users } from "lucide-react";
import { cardsTreeBridge } from "@/lib/delegation/bridge/cards-tree-bridge";
import { STATUS_COLORS } from "../data/delegatedAdministrationData";
import type { DelegatedScope } from "@/lib/delegation/bridge/cards-tree-bridge";

interface ScopeCardProps {
  scope: DelegatedScope;
  onLinkScope: (scope: DelegatedScope) => void;
  onOpenInTree: (scopeId: string) => void;
  onEditScope: (scope: DelegatedScope) => void;
  onViewDetails: (scope: DelegatedScope) => void;
}

const getTypeIcon = (type: DelegatedScope["type"]) => {
  const icons = {
    organizational: Building,
    geographical: MapPin,
    application: Users,
    identity: Users,
  };
  const Icon = icons[type];
  return <Icon className="h-4 w-4" />;
};

const getStatusColor = (status: DelegatedScope["status"]) => {
  return STATUS_COLORS[status];
};

export const ScopeCard: React.FC<ScopeCardProps> = ({
  scope,
  onLinkScope,
  onOpenInTree,
  onEditScope,
  onViewDetails,
}) => {
  const linkedNodeId = cardsTreeBridge.getLinkedNodeId(scope.id);
  const isLinked = Boolean(linkedNodeId);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            {getTypeIcon(scope.type)}
            <CardTitle className="text-lg">{scope.name}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={getStatusColor(scope.status)}>{scope.status}</Badge>
            {isLinked && (
              <Badge variant="secondary" className="text-xs">
                <LinkIcon className="h-3 w-3 mr-1" />
                Linked to Tree
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Administrator</p>
            <p className="font-medium">{scope.administrator}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Users</p>
              <p className="font-medium">{scope.userCount}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Applications</p>
              <p className="font-medium">{scope.applicationsCount}</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-2">Permissions</p>
            <div className="flex flex-wrap gap-1">
              {scope.permissions.map((permission) => (
                <Badge key={permission} variant="outline" className="text-xs">
                  {permission}
                </Badge>
              ))}
            </div>
          </div>

          {scope.timeRestriction && (
            <div className="p-3 rounded-lg">
              <div className="flex items-center space-x-2 text-orange-700">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">Time-Limited Access</span>
              </div>
              <p className="text-sm text-orange-600 mt-1">
                {scope.timeRestriction.start} to {scope.timeRestriction.end}
              </p>
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditScope(scope)}
              >
                <Settings className="h-4 w-4 mr-1" />
                Edit Scope
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewDetails(scope)}
              >
                View Details
              </Button>
            </div>

            {/* Tree Link Actions */}
            <div className="flex space-x-2">
              {!isLinked ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onLinkScope(scope)}
                >
                  <LinkIcon className="h-4 w-4 mr-1" />
                  Link to Tree
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenInTree(scope.id)}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Open in Tree
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onLinkScope(scope)}
                  >
                    Change Link
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
