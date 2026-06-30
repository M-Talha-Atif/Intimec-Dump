"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TreeNode, EffectiveAccess } from "@/types/hierarchical-delegation";
import { DelegationInheritanceEngine } from "@/lib/delegation-inheritance";
import { Eye, Search, Shield, Users } from "lucide-react";

interface PreviewAccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodes: TreeNode[];
}

export const PreviewAccessDialog: React.FC<PreviewAccessDialogProps> = ({
  open,
  onOpenChange,
  nodes,
}) => {
  const [userId, setUserId] = useState("");
  const [effectiveAccess, setEffectiveAccess] = useState<EffectiveAccess[]>([]);

  const handlePreview = () => {
    if (!userId.trim()) return;

    const engine = new DelegationInheritanceEngine(nodes);
    const accessList: EffectiveAccess[] = [];

    // Check access for all nodes
    nodes.forEach((node) => {
      const access = engine.getEffectiveAccess(userId, node.id);
      if (access) {
        accessList.push(access);
      }
    });

    setEffectiveAccess(accessList);
  };

  const getAccessColor = (accessType: EffectiveAccess["accessType"]) => {
    switch (accessType) {
      case "manage":
        return "default";
      case "view":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getSourceColor = (source: EffectiveAccess["source"]) => {
    switch (source) {
      case "direct":
        return "bg-green-100 text-green-800";
      case "inherited":
        return "bg-purple-100 text-purple-800";
      case "sibling":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Preview Effective Access
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="previewUserId">User ID</Label>
              <Input
                id="previewUserId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter user ID to preview access..."
              />
            </div>
            <Button onClick={handlePreview} className="mt-4">
              <Search className="h-4 w-4 mr-2" />
              Preview
            </Button>
          </div>

          {effectiveAccess.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">
                  Access Summary for User: {userId}
                </h3>
              </div>

              <div className="grid gap-3">
                {effectiveAccess.map((access) => (
                  <Card
                    key={access.nodeId}
                    className="border-l-4 border-l-blue-500"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                          {access.nodeName}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant={getAccessColor(access.accessType)}>
                            {access.accessType}
                          </Badge>
                          <Badge className={getSourceColor(access.source)}>
                            {access.source}
                            {access.source === "sibling" && " (S)"}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div>
                        <span className="text-sm text-gray-600">
                          Permissions:
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {access.permissions.map((permission) => (
                            <Badge
                              key={permission}
                              variant="outline"
                              className="text-xs"
                            >
                              {permission}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Legend:</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>Direct Assignment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded"></div>
                    <span>Inherited Access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span>Sibling Access (S)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {effectiveAccess.length === 0 && userId && (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No access found for user ID: {userId}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
