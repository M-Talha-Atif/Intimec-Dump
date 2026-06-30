import React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TreeNode } from "@/types/hierarchical-delegation";
import { Users, Building, MapPin, Shield, Activity } from "lucide-react";

interface EnhancedNodeDetailsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  node: TreeNode | null;
}

export const EnhancedNodeDetailsDrawer: React.FC<
  EnhancedNodeDetailsDrawerProps
> = ({ open, onOpenChange, node }) => {
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
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {node.name}
          </DrawerTitle>
        </DrawerHeader>

        <div className="p-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="delegates">Delegates</TabsTrigger>
              <TabsTrigger value="policy">Policy</TabsTrigger>
              <TabsTrigger value="audit">Audit</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
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
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Users:</span>
                      <span>{node.userCount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Applications:</span>
                      <span>{node.applicationsCount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Children:</span>
                      <span>{node.children.length}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {node.children.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Child Nodes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      {node.children.map((child) => (
                        <div
                          key={child.id}
                          className="border rounded p-2 text-sm"
                        >
                          <div className="font-medium">{child.name}</div>
                          <div className="text-gray-500">{child.type}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="delegates" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Delegates ({node.delegates.length})
                </h3>
              </div>

              {node.delegates.length > 0 ? (
                <div className="space-y-3">
                  {node.delegates.map((delegate) => (
                    <Card key={delegate.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium">{delegate.userName}</h4>
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

                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500">
                                Sibling Access:
                              </span>
                              <Badge
                                variant={
                                  delegate.allowSiblingAccess
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {delegate.allowSiblingAccess ? "On" : "Off"}
                              </Badge>
                            </div>

                            {delegate.timeWindow && (
                              <div>
                                <span className="text-gray-500">
                                  Time Window:
                                </span>
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
                            Date:{" "}
                            {new Date(delegate.assigned).toLocaleDateString()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No delegates assigned to this node</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="policy" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Inheritance Policy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="p-3 bg-blue-50 rounded">
                    <strong>Delegation Rules:</strong>
                    <ul className="mt-2 space-y-1 text-xs">
                      <li>
                        • Owners (OO) can manage this node and all descendants
                      </li>
                      <li>
                        • Delegated Owners (OO-D) can manage this node and
                        descendants
                      </li>
                      <li>
                        • Sibling access depends on individual delegate settings
                      </li>
                      <li>
                        • Time windows restrict access to specified periods
                      </li>
                    </ul>
                  </div>

                  <div className="p-3 bg-green-50 rounded">
                    <strong>Inheritance Path:</strong>
                    <div className="mt-2 text-xs">
                      {node.parentId ? (
                        <span>
                          This node inherits from parent and passes down to{" "}
                          {node.children.length} children
                        </span>
                      ) : (
                        <span>
                          This is a top-level node - no inheritance from above
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="audit" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span>Node created</span>
                      <span className="text-xs text-gray-500">
                        {new Date(node.created).toLocaleDateString()}
                      </span>
                    </div>
                    {node.delegates.map((delegate) => (
                      <div
                        key={delegate.id}
                        className="flex justify-between items-center p-2 bg-gray-50 rounded"
                      >
                        <span>Delegate assigned: {delegate.userName}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(delegate.assigned).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end pt-4">
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
