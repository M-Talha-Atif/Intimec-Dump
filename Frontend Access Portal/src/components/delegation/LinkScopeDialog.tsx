"use client";
import React, { useState, useMemo } from "react";
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
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TreeNode } from "@/types/hierarchical-delegation";
import {
  DelegatedScope,
  cardsTreeBridge,
} from "@/lib/delegation/bridge/cards-tree-bridge";
import { Building, MapPin, Users, Search, Link, Unlink } from "lucide-react";
import { toast } from "sonner";

interface LinkScopeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scope: DelegatedScope;
  treeNodes: TreeNode[];
  onLink: (scopeId: string, nodeId: string) => void;
}

const getTypeIcon = (type: TreeNode["type"]) => {
  const icons = {
    organizational: Building,
    geographical: MapPin,
    application: Users,
    identity: Users,
  };
  return icons[type];
};

export const LinkScopeDialog: React.FC<LinkScopeDialogProps> = ({
  open,
  onOpenChange,
  scope,
  treeNodes,
  onLink,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedNodeId, setSelectedNodeId] = useState<string>("");

  const currentlyLinkedNodeId = cardsTreeBridge.getLinkedNodeId(scope.id);
  const isCurrentlyLinked = Boolean(currentlyLinkedNodeId);

  const candidateNodes = useMemo(() => {
    return cardsTreeBridge.findCandidateNodesForScope(scope, treeNodes);
  }, [scope, treeNodes]);

  const filteredNodes = useMemo(() => {
    let nodes = candidateNodes;

    if (searchTerm) {
      nodes = nodes.filter((node) =>
        node.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== "all") {
      nodes = nodes.filter((node) => node.type === filterType);
    }

    return nodes;
  }, [candidateNodes, searchTerm, filterType]);

  const handleLink = () => {
    if (!selectedNodeId) {
      toast.error("Please select a node to link to");
      return;
    }

    cardsTreeBridge.linkScopeToNode(scope.id, selectedNodeId);
    onLink(scope.id, selectedNodeId);
    toast.success(`Successfully linked "${scope.name}" to tree node`);
    onOpenChange(false);
    setSelectedNodeId("");
  };

  const handleUnlink = () => {
    cardsTreeBridge.unlinkScope(scope.id);
    toast.success(`Unlinked "${scope.name}" from tree`);
    onOpenChange(false);
  };

  const handleClose = () => {
    onOpenChange(false);
    setSelectedNodeId("");
    setSearchTerm("");
    setFilterType("all");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Link Scope to Tree Node
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Scope Info */}
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold">{scope.name}</h3>
                <Badge variant="outline">{scope.type}</Badge>
                {isCurrentlyLinked && (
                  <Badge variant="default" className="text-xs">
                    Currently Linked
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600">
                Administrator: {scope.administrator}
              </p>
              <p className="text-xs text-gray-500">
                {scope.userCount} users • {scope.applicationsCount} applications
              </p>
            </CardContent>
          </Card>

          {/* Current Link Actions */}
          {isCurrentlyLinked && (
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-green-800">
                  Currently linked to a tree node
                </p>
                <p className="text-xs text-green-600">
                  Select a new node below to change the link, or unlink entirely
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleUnlink}>
                <Unlink className="h-4 w-4 mr-2" />
                Unlink
              </Button>
            </div>
          )}

          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="nodeSearch">Search Nodes</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="nodeSearch"
                  placeholder="Search by node name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="typeFilter">Filter by Type</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger id="typeFilter" className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="organizational">Organizational</SelectItem>
                  <SelectItem value="geographical">Geographical</SelectItem>
                  <SelectItem value="application">Application</SelectItem>
                  <SelectItem value="identity">Identity</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Candidate Nodes */}
          <div>
            <Label>
              Select Node to Link ({filteredNodes.length} candidates)
            </Label>
            <div className="max-h-64 overflow-y-auto space-y-2 mt-2">
              {filteredNodes.map((node) => {
                const Icon = getTypeIcon(node.type);
                const isSelected = selectedNodeId === node.id;

                return (
                  <Card
                    key={node.id}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? "border-blue-500" : ""
                    }`}
                    onClick={() => setSelectedNodeId(node.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4 text-gray-600" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{node.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {node.type}
                            </Badge>
                            <Badge
                              variant={
                                node.status === "active"
                                  ? "default"
                                  : "secondary"
                              }
                              className="text-xs"
                            >
                              {node.status}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {node.delegates.length} delegates •{" "}
                            {node.userCount || 0} users •{" "}
                            {node.applicationsCount || 0} apps
                          </div>
                        </div>
                        {isSelected && (
                          <div className="text-blue-600">
                            <Link className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {filteredNodes.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Building className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No matching nodes found</p>
                  <p className="text-sm">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleLink} disabled={!selectedNodeId}>
              <Link className="h-4 w-4 mr-2" />
              {isCurrentlyLinked ? "Change Link" : "Link to Node"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
