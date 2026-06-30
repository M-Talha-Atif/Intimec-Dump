import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TreeNode } from "@/types/hierarchical-delegation";
import { Users, Building, MapPin } from "lucide-react";

interface NodeDetailsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  node: TreeNode | null;
}

export const NodeDetailsDrawer: React.FC<NodeDetailsDrawerProps> = ({
  open,
  onOpenChange,
  node,
}) => {
  if (!node) return null;

  const getTypeIcon = (type: TreeNode["type"]) => {
    const icons = {
      organizational: Building,
      geographical: MapPin,
      application: Users,
      identity: Users,
    };
    return icons[type];
  };

  const Icon = getTypeIcon(node.type);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[600px] sm:w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {node.name}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                Basic Information
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Type:</span>
                  <Badge variant="outline">{node.type}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <Badge>{node.status}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Created:</span>
                  <span>{new Date(node.created).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Statistics</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Users:</span>
                  <span>{node.userCount || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Applications:</span>
                  <span>{node.applicationsCount || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Delegates:</span>
                  <span>{node.delegates.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Delegates */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Delegates</h4>
            {node.delegates.length > 0 ? (
              <div className="space-y-3">
                {node.delegates.map((delegate) => (
                  <div key={delegate.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h5 className="font-medium">{delegate.userName}</h5>
                        <p className="text-sm text-gray-500">
                          ID: {delegate.userId}
                        </p>
                      </div>
                      <Badge>{delegate.role}</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Permissions:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {delegate.permissions.map((permission) => (
                            <Badge
                              key={permission}
                              variant="secondary"
                              className="text-xs"
                            >
                              {permission}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">Sibling Access:</span>
                          <Badge
                            variant={
                              delegate.allowSiblingAccess
                                ? "default"
                                : "secondary"
                            }
                          >
                            {delegate.allowSiblingAccess
                              ? "Enabled"
                              : "Disabled"}
                          </Badge>
                        </div>

                        {delegate.timeWindow && (
                          <div className="mt-2">
                            <span className="text-gray-500">Time Window:</span>
                            <div className="text-xs text-orange-600">
                              {delegate.timeWindow.start} to{" "}
                              {delegate.timeWindow.end}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-3 pt-3 border-t text-xs text-gray-500">
                      <span>Assigned by: {delegate.assignedBy}</span>
                      <span>
                        Date: {new Date(delegate.assigned).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No delegates assigned</p>
            )}
          </div>

          {/* Children */}
          {node.children.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Child Nodes</h4>
              <div className="grid grid-cols-2 gap-2">
                {node.children.map((child) => (
                  <div key={child.id} className="border rounded p-2 text-sm">
                    <div className="font-medium">{child.name}</div>
                    <div className="text-gray-500">{child.type}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
