import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, Bell, CheckCircle2, Search, X } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface AlertsListModalProps {
  open: boolean;
  onClose: () => void;
  onInvestigate: (alertId: string) => void;
}

const mockAlerts = [
  {
    id: 'ALT-001',
    type: 'critical_violation',
    title: 'Critical SoD Violation Detected',
    description: 'User John Smith gained conflicting Finance + IT Admin roles',
    severity: 'critical',
    timestamp: '2025-06-15 14:23:00',
    status: 'new',
    affectedUsers: 1,
  },
  {
    id: 'ALT-002',
    type: 'sla_breach',
    title: 'SLA Breach Imminent',
    description: '3 violations approaching SLA deadline in next 24 hours',
    severity: 'high',
    timestamp: '2025-06-15 13:45:00',
    status: 'new',
    affectedUsers: 3,
  },
  {
    id: 'ALT-003',
    type: 'policy_change',
    title: 'Policy Modified',
    description: 'SOX-404 Segregation policy updated by admin',
    severity: 'medium',
    timestamp: '2025-06-15 11:30:00',
    status: 'acknowledged',
    affectedUsers: 0,
  },
  {
    id: 'ALT-004',
    type: 'exception_expiring',
    title: 'Exception Expiring Soon',
    description: '5 exceptions expire within next 7 days',
    severity: 'medium',
    timestamp: '2025-06-15 09:15:00',
    status: 'new',
    affectedUsers: 5,
  },
  {
    id: 'ALT-005',
    type: 'bulk_violation',
    title: 'Bulk Violations Detected',
    description: '12 new violations detected in latest access review',
    severity: 'high',
    timestamp: '2025-06-15 08:00:00',
    status: 'acknowledged',
    affectedUsers: 12,
  },
];

export const AlertsListModal = ({ open, onClose, onInvestigate }: AlertsListModalProps) => {
  const [alerts, setAlerts] = useState(mockAlerts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAlerts, setSelectedAlerts] = useState<string[]>([]);
  const [filterSeverity, setFilterSeverity] = useState<string[]>([]);
  const { toast } = useToast();

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = filterSeverity.length === 0 || filterSeverity.includes(alert.severity);
    return matchesSearch && matchesSeverity;
  });

  const handleAcknowledge = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, status: 'acknowledged' } : alert
    ));
    toast({
      title: "Alert Acknowledged",
      description: `Alert ${alertId} has been acknowledged`,
    });
  };

  const handleBulkAcknowledge = () => {
    if (selectedAlerts.length === 0) return;
    setAlerts(prev => prev.map(alert => 
      selectedAlerts.includes(alert.id) ? { ...alert, status: 'acknowledged' } : alert
    ));
    toast({
      title: "Alerts Acknowledged",
      description: `${selectedAlerts.length} alerts have been acknowledged`,
    });
    setSelectedAlerts([]);
  };

  const handleDismiss = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    toast({
      title: "Alert Dismissed",
      description: `Alert ${alertId} has been dismissed`,
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Security Alerts ({filteredAlerts.length})
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search alerts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              variant="outline"
              onClick={handleBulkAcknowledge}
              disabled={selectedAlerts.length === 0}
            >
              Acknowledge ({selectedAlerts.length})
            </Button>
          </div>

          {/* Severity Filters */}
          <div className="flex gap-2">
            {['critical', 'high', 'medium', 'low'].map(severity => (
              <Badge
                key={severity}
                variant={filterSeverity.includes(severity) ? getSeverityColor(severity) : 'outline'}
                className="cursor-pointer capitalize"
                onClick={() => {
                  setFilterSeverity(prev =>
                    prev.includes(severity)
                      ? prev.filter(s => s !== severity)
                      : [...prev, severity]
                  );
                }}
              >
                {severity}
              </Badge>
            ))}
          </div>

          {/* Alerts List */}
          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {filteredAlerts.map(alert => (
              <div
                key={alert.id}
                className={`p-4 border rounded-lg ${
                  alert.status === 'new' ? 'bg-red-50 border-red-200' : 'bg-background'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={selectedAlerts.includes(alert.id)}
                    onCheckedChange={(checked) => {
                      setSelectedAlerts(prev =>
                        checked
                          ? [...prev, alert.id]
                          : prev.filter(id => id !== alert.id)
                      );
                    }}
                  />
                  <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                    alert.severity === 'critical' || alert.severity === 'high'
                      ? 'text-red-500'
                      : 'text-yellow-500'
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <h4 className="font-medium">{alert.title}</h4>
                        <p className="text-sm text-muted-foreground">{alert.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                        {alert.status === 'acknowledged' && (
                          <Badge variant="outline">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Acked
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        {alert.timestamp} • {alert.affectedUsers} affected users
                      </span>
                      <div className="flex gap-2">
                        {alert.status === 'new' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleAcknowledge(alert.id)}
                          >
                            Acknowledge
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onInvestigate(alert.id)}
                        >
                          Investigate
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDismiss(alert.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredAlerts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No alerts found</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
