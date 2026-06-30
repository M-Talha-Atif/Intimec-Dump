
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Download, Network } from 'lucide-react';
import { ExportInsightsModal } from '../ExportInsightsModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { OrganizationChart } from '../OrganizationChart';

export function ManagerDashboardHeader() {
  const [showOrgChart, setShowOrgChart] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Manager Intelligence Hub</h2>
          <p className="text-slate-600">Comprehensive view of managerial structures, team insights, and delegated authority</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setShowOrgChart(true)}>
            <Network className="h-4 w-4 mr-1" />
            View Org Chart
          </Button>
          <ExportInsightsModal>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-1" />
              Export Insights
            </Button>
          </ExportInsightsModal>
        </div>
      </div>

      <Dialog open={showOrgChart} onOpenChange={setShowOrgChart}>
        <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Organization Chart</DialogTitle>
          </DialogHeader>
          <OrganizationChart />
        </DialogContent>
      </Dialog>
    </>
  );
}
