
import React from 'react';
import { Entitlement } from '@/data/mock-entitlements';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, AlertTriangle, TrendingUp } from 'lucide-react';

interface EntitlementImpactSimulatorProps {
  originalEntitlement: Entitlement;
  editedEntitlement: Entitlement;
  isOpen: boolean;
  onClose: () => void;
}

const EntitlementImpactSimulator: React.FC<EntitlementImpactSimulatorProps> = ({
  originalEntitlement,
  editedEntitlement,
  isOpen,
  onClose
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Impact Simulation: {editedEntitlement.displayName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 max-h-96 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-sm">
                  <Users className="h-4 w-4" />
                  <span>Affected Users</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">23</div>
                <div className="text-sm text-slate-600">Users will be impacted</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Risk Changes</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">Medium</div>
                <div className="text-sm text-slate-600">New risk level</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-sm">
                  <TrendingUp className="h-4 w-4" />
                  <span>Policy Impact</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">0</div>
                <div className="text-sm text-slate-600">New violations</div>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center py-4 text-slate-500">
            <p>Detailed impact analysis will appear here</p>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EntitlementImpactSimulator;
