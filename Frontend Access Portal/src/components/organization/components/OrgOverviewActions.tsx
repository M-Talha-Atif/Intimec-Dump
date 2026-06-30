import { Button } from '@/components/ui/button';
import { Shield, TrendingUp, FileText } from 'lucide-react';

export function OrgOverviewActions() {
  return (
    <div className="space-y-2">
      <Button className="w-full" size="sm">
        <Shield className="h-4 w-4 mr-2" />
        Launch Access Review
      </Button>
      <Button variant="outline" className="w-full" size="sm">
        <TrendingUp className="h-4 w-4 mr-2" />
        View Full Analytics
      </Button>
      <Button variant="outline" className="w-full" size="sm">
        <FileText className="h-4 w-4 mr-2" />
        Export Unit Report
      </Button>
    </div>
  );
}
