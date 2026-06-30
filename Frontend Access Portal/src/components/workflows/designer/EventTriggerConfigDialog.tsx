"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { Zap, Server, Users, Key, Shield, FileText, Database, Settings } from 'lucide-react';
import { Separator } from "@/components/ui/separator";

export interface EventTriggerConfig {
  services: string[];
  eventTypes: string[];
  conditions?: {
    field: string;
    operator: string;
    value: string;
  }[];
}

interface EventTriggerConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentConfig?: EventTriggerConfig;
  onSave: (config: EventTriggerConfig) => void;
}

// Available microservices and their events
export const SERVICE_EVENTS = {
  'identity-service': {
    icon: Users,
    label: 'Identity Service',
    events: [
      { id: 'user.created', label: 'User Created', description: 'When a new user is created in the system' },
      { id: 'user.updated', label: 'User Updated', description: 'When user attributes are modified' },
      { id: 'user.deleted', label: 'User Deleted', description: 'When a user is deactivated or deleted' },
      { id: 'user.activated', label: 'User Activated', description: 'When a user account is activated' },
      { id: 'user.deactivated', label: 'User Deactivated', description: 'When a user account is deactivated' }
    ]
  },
  'role-service': {
    icon: Shield,
    label: 'Role Service',
    events: [
      { id: 'role.created', label: 'Role Created', description: 'When a new role is created' },
      { id: 'role.updated', label: 'Role Updated', description: 'When role permissions change' },
      { id: 'role.assigned', label: 'Role Assigned', description: 'When a role is assigned to a user' },
      { id: 'role.revoked', label: 'Role Revoked', description: 'When a role is removed from a user' },
      { id: 'role.deleted', label: 'Role Deleted', description: 'When a role is deleted from the system' },
      { id: 'permission.assigned', label: 'Permission Assigned', description: 'When a permission is assigned to a role' },
      { id: 'permission.revoked', label: 'Permission Revoked', description: 'When a permission is revoked from a role' },
      { id: 'permission.bulk.assigned', label: 'Bulk Permission Assigned', description: 'When multiple permissions are assigned to a role' },
      { id: 'permission.bulk.revoked', label: 'Bulk Permission Revoked', description: 'When multiple permissions are revoked from a role' }
    ]
  },
  'access-service': {
    icon: Key,
    label: 'Access Service',
    events: [
      { id: 'access.requested', label: 'Access Requested', description: 'When user requests application access' },
      { id: 'access.granted', label: 'Access Granted', description: 'When access request is approved' },
      { id: 'access.revoked', label: 'Access Revoked', description: 'When application access is removed' },
      { id: 'access.expired', label: 'Access Expired', description: 'When time-based access expires' }
    ]
  },
  'application-service': {
    icon: Server,
    label: 'Application Service',
    events: [
      { id: 'app.created', label: 'Application Created', description: 'When new app is added to catalog' },
      { id: 'app.updated', label: 'Application Updated', description: 'When app configuration changes' },
      { id: 'app.connector.connected', label: 'Connector Connected', description: 'When app connector goes online' },
      { id: 'app.connector.failed', label: 'Connector Failed', description: 'When app connector fails' }
    ]
  },
  'certification-service': {
    icon: FileText,
    label: 'Certification Service',
    events: [
      { id: 'cert.campaign.started', label: 'Campaign Started', description: 'When certification campaign begins' },
      { id: 'cert.item.certified', label: 'Item Certified', description: 'When reviewer certifies an access item' },
      { id: 'cert.item.revoked', label: 'Item Revoked', description: 'When reviewer revokes certification' },
      { id: 'cert.campaign.completed', label: 'Campaign Completed', description: 'When campaign finishes' }
    ]
  },
  'policy-service': {
    icon: Database,
    label: 'Policy Service',
    events: [
      { id: 'policy.violation.detected', label: 'Policy Violation', description: 'When SoD or policy violation occurs' },
      { id: 'policy.rule.created', label: 'Policy Rule Created', description: 'When new policy rule is added' },
      { id: 'policy.rule.updated', label: 'Policy Rule Updated', description: 'When policy rule is modified' }
    ]
  }
};

export const EventTriggerConfigDialog: React.FC<EventTriggerConfigDialogProps> = ({
  open,
  onOpenChange,
  currentConfig,
  onSave
}) => {
  const [selectedEvent, setSelectedEvent] = useState<string | null>(
    currentConfig?.eventTypes?.[0] || null
  );

  // Update selectedEvent when currentConfig changes or dialog opens
  useEffect(() => {
    if (open && currentConfig?.eventTypes?.[0]) {
      setSelectedEvent(currentConfig.eventTypes[0]);
    }
  }, [open, currentConfig]);

  const handleEventSelect = (eventId: string, serviceId: string) => {
    setSelectedEvent(eventId);
  };

  const handleSave = () => {
    if (!selectedEvent) return;
    
    // Find which service this event belongs to
    const serviceId = Object.entries(SERVICE_EVENTS).find(([_, service]) =>
      service.events.some(e => e.id === selectedEvent)
    )?.[0] || '';
    
    onSave({
      services: serviceId ? [serviceId] : [],
      eventTypes: [selectedEvent],
      conditions: []
    });
    onOpenChange(false);
  };

  const handleClear = () => {
    setSelectedEvent(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Configure Event Trigger
          </DialogTitle>
          <DialogDescription>
            Select one event that will trigger this workflow
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            {selectedEvent && (
              <Badge variant="default">
                {Object.values(SERVICE_EVENTS)
                  .flatMap(s => s.events)
                  .find(e => e.id === selectedEvent)?.label}
              </Badge>
            )}
            {!selectedEvent && (
              <Badge variant="outline">No event selected</Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleClear} disabled={!selectedEvent}>
              Clear Selection
            </Button>
          </div>
        </div>

        <Separator />

        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          <RadioGroup value={selectedEvent || undefined} onValueChange={setSelectedEvent}>
            {Object.entries(SERVICE_EVENTS).map(([serviceId, service]) => {
              const ServiceIcon = service.icon;

              return (
                <div key={serviceId} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2 font-medium">
                    <ServiceIcon className="h-4 w-4" />
                    {service.label}
                  </div>

                  <div className="ml-6 space-y-2">
                    {service.events.map((event) => (
                      <div key={event.id} className="flex items-start gap-3 p-2 rounded hover:bg-accent cursor-pointer">
                        <RadioGroupItem value={event.id} id={event.id} />
                        <div className="flex-1">
                          <label htmlFor={event.id} className="cursor-pointer">
                            <div className="font-medium text-sm">{event.label}</div>
                            <div className="text-xs text-muted-foreground">{event.description}</div>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!selectedEvent}>
            <Zap className="h-4 w-4 mr-2" />
            Save Event Configuration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
