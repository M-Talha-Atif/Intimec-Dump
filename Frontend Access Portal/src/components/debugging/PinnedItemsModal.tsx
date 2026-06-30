"use client";

import type React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CheckCircle, Search, X } from "lucide-react";
import { useState } from "react";
import { useDebugging } from "@/contexts/debugging-context";
import { LogDetailModal } from "./LogDetailModal";
import { Loader } from "../ui/Loader";
import { shortDate } from "@/utils/dateFormat";

export const PinnedItemsModal: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const {
    showPinnedModal: isOpen,
    loading,
    setShowPinnedModal,
    pinnedItems,
    handleResolvePinnedItem: onResolve,
  } = useDebugging();
  const onClose = () => setShowPinnedModal(false);
  const filteredItems = pinnedItems?.filter(
    (item) =>
      item.data.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.data.source.toLowerCase().includes(searchQuery.toLowerCase())
  );
  console.log("selectedLog:", selectedLog);

  const getBadgeVariant = (level: string) => {
    switch (level) {
      case "ERROR":
        return "destructive";
      case "WARN":
        return "secondary";
      default:
        return "default";
    }
  };

  if (loading) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              All Pinned Items ({pinnedItems.length})
            </DialogTitle>
          </DialogHeader>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search pinned items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-auto modal-scroll space-y-3">
            {filteredItems.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                {searchQuery ? "No items match your search" : "No pinned items"}
              </p>
            ) : (
              filteredItems.map((item) => (
                <div
                  key={item.documentId}
                  className="flex items-start justify-between p-4 bg-muted/10 rounded-lg cursor-pointer hover:bg-muted/20 transition-colors"
                  onClick={() => {
                    setSelectedLog(item);
                    onClose(); // Close the pinned items modal
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge
                        variant={getBadgeVariant(item.data.level)}
                        className="text-xs"
                      >
                        {item.data.level}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {item.data.source}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {shortDate(Number(item.data.timestamp))}
                      </span>
                    </div>
                    <h4 className="text-sm font-medium mb-1">
                      {item.data.message || "No message available"}
                    </h4>

                    <p className="text-xs text-muted-foreground/70 italic">
                      Category: {item.data.category || "Unknown"} | Object:{" "}
                      {item.data.objectType || "Unknown"}:
                      {item.data.objectId && item.data.objectId !== "N/A"
                        ? item.data.objectId
                        : "Unknown"}
                      {item.data.correlationId &&
                        item.data.correlationId !== "N/A" &&
                        ` | ID: ${item.data.correlationId}`}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onResolve(item.documentId);
                    }}
                    className="ml-4 text-green-600 hover:text-green-700 hover:bg-green-50"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Resolve
                  </Button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
      <LogDetailModal
        log={selectedLog}
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </>
  );
};
