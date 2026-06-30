"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Pin, X } from "lucide-react";
import { useDebugging } from "@/contexts/debugging-context";

export interface LogItem {
  id: string;
  timestamp: string;
  level: string;
  source: string;
  category: string;
  objectType: string;
  objectId: string;
  correlationId: string;
  message: string;
  details: any;
}

export const PinLogModal: React.FC = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const {
    showPinModal: isOpen,
    logToPin: log,
    closePinModal: onClose,
    handlePinSubmit: onPin,
  } = useDebugging();

  // Reset form when modal opens with new log
  useEffect(() => {
    if (log && isOpen) {
      setName(
        log.message.slice(0, 50) + (log.message.length > 50 ? "..." : "")
      );
      const objectType = log.objectType || log.category || "UnknownType";
      const objectId = log.objectId || log.id || "UnknownId";
      const source = log.source || "UnknownSource";
      // Only show objectType/objectId if they are not empty/undefined/null
      const hasObjectType = !!objectType && objectType !== "UnknownType";
      const hasObjectId = !!objectId && objectId !== "UnknownId";
      if (hasObjectType && hasObjectId) {
        setDescription(`${objectType}: ${objectId} - ${source}`);
      } else if (hasObjectType) {
        setDescription(`${objectType} - ${source}`);
      } else if (hasObjectId) {
        setDescription(`${objectId} - ${source}`);
      } else {
        setDescription(`${source}`);
      }
    }
  }, [log, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && description.trim()) {
      onPin(name.trim(), description.trim());
      setName("");
      setDescription("");
    }
  };

  const getEventBadgeVariant = (level: string) => {
    switch (level) {
      case "ERROR":
        return "destructive";
      case "DEBUG":
        return "secondary";
      case "TRACE":
        return "outline";
      default:
        return "default";
    }
  };

  if (!log) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {/* <Pin className="h-5 w-5" /> */}
            <span>Pin Log</span>
          </DialogTitle>

          <DialogDescription>
            Save this log to your pinned items so you can quickly access it later for investigation or follow-up.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Original Log Preview */}
          <div className="p-4 bg-muted/20 rounded-lg border">
            <div className="flex items-center space-x-2 mb-3 flex-wrap">
              <Badge variant={getEventBadgeVariant(log.level)} className="text-xs">
                {log.level}
              </Badge>
              <Badge variant="outline" className="text-xs">{log.source}</Badge>
              <span className="text-xs text-muted-foreground">
                {new Date(log.timestamp).toLocaleString()}
              </span>
              {log.correlationId && log.correlationId !== 'N/A' && (
                <Badge variant="outline" className="text-xs">
                  ID: {log.correlationId}
                </Badge>
              )}
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium break-words">{log.message}</p>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground flex-wrap">
                {log.objectType && log.objectType !== 'N/A' && (
                  <span>Type: {log.objectType}</span>
                )}
                {log.objectId && log.objectId !== 'N/A' && (
                  <span>ID: {log.objectId}</span>
                )}
                {log.category && log.category !== 'general' && (
                  <span>Category: {log.category}</span>
                )}
              </div>
            </div>
          </div>

          {/* Pin Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="pin-name" className="text-sm font-medium">Name</Label>
              <Input
                id="pin-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Give this pinned log a name..."
                className="mt-2"
                required
              />
            </div>

            <div>
              <Label htmlFor="pin-description" className="text-sm font-medium">Description</Label>
              <Textarea
                id="pin-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description for why you're pinning this log..."
                className="mt-2 min-h-[100px] resize-none"
                required
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!name.trim() || !description.trim()}
                className="min-w-[100px]"
              >
                <Pin className="h-4 w-4 mr-2" />
                Pin Log
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
