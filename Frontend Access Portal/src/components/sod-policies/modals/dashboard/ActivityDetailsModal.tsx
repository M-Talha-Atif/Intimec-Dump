import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, User, FileText, TrendingUp } from 'lucide-react';

interface ActivityDetailsModalProps {
  activity: any;
  open: boolean;
  onClose: () => void;
}

export const ActivityDetailsModal = ({ activity, open, onClose }: ActivityDetailsModalProps) => {
  if (!activity) return null;

  const mockDetails = {
    timestamp: '2025-06-15 14:23:45',
    actor: 'John Smith (Admin)',
    actorId: 'USR-12345',
    action: 'Policy Created',
    targetType: 'Policy',
    targetId: 'POL-089',
    targetName: 'Finance-IT Segregation',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    changes: [
      { field: 'Name', before: null, after: 'Finance-IT Segregation' },
      { field: 'Status', before: null, after: 'Active' },
      { field: 'Risk Level', before: null, after: 'High' },
      { field: 'Enforcement Mode', before: null, after: 'Preventive' },
    ],
    relatedEntities: [
      { type: 'User', id: 'USR-12345', name: 'John Smith' },
      { type: 'Policy', id: 'POL-089', name: 'Finance-IT Segregation' },
    ],
    impact: {
      affectedUsers: 15,
      affectedPolicies: 1,
      newViolations: 3,
    },
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Activity Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Action</p>
                  <Badge className="mt-1">{mockDetails.action}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Timestamp</p>
                  <p className="text-sm mt-1">{mockDetails.timestamp}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Target</p>
                  <p className="text-sm mt-1">{mockDetails.targetType}: {mockDetails.targetName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ID</p>
                  <p className="text-sm mt-1 font-mono">{mockDetails.targetId}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actor Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5" />
                Actor Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">User</p>
                <p className="text-sm mt-1">{mockDetails.actor}</p>
                <p className="text-xs text-muted-foreground font-mono">{mockDetails.actorId}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">IP Address</p>
                <p className="text-sm mt-1 font-mono">{mockDetails.ipAddress}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">User Agent</p>
                <p className="text-xs text-muted-foreground mt-1">{mockDetails.userAgent}</p>
              </div>
            </CardContent>
          </Card>

          {/* Changes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5" />
                Changes Made
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mockDetails.changes.map((change, idx) => (
                  <div key={idx} className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-1">{change.field}</p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground">
                        {change.before || '(none)'}
                      </span>
                      <span>→</span>
                      <span className="font-medium">{change.after}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Impact Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5" />
                Impact Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">{mockDetails.impact.affectedUsers}</p>
                  <p className="text-xs text-muted-foreground">Affected Users</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">{mockDetails.impact.affectedPolicies}</p>
                  <p className="text-xs text-muted-foreground">Affected Policies</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">{mockDetails.impact.newViolations}</p>
                  <p className="text-xs text-muted-foreground">New Violations</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related Entities */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Related Entities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mockDetails.relatedEntities.map((entity, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-muted rounded">
                    <div>
                      <p className="text-sm font-medium">{entity.name}</p>
                      <p className="text-xs text-muted-foreground">{entity.type}: {entity.id}</p>
                    </div>
                    <Badge variant="outline">View</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
