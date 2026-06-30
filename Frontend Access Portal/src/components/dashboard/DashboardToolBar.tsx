import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  RefreshCw, 
  Settings, 
  Download, 
  Calendar,
  BarChart3,
  Bell,
  Filter
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { useDashboardConfig } from '@/contexts/DashboardConfigContext';
import { ConfigureDashboardModal } from './modals/ConfigureDashboardModal';
import { toast } from 'sonner';

type DateRangeType = 'today' | '7days' | '30days' | '90days' | 'ytd' | 'custom';

interface DashboardToolbarProps {
  onDateRangeChange: (range: DateRangeType) => void;
  onExport: () => void;
  onInsights: () => void;
  onAlerts: () => void;
  dateRange: DateRangeType;
  lastRefresh: Date;
}

export const DashboardToolbar: React.FC<DashboardToolbarProps> = ({
  onDateRangeChange,
  onExport,
  onInsights,
  onAlerts,
  dateRange,
  lastRefresh
}) => {
  const { triggerRefresh, config } = useDashboardConfig();
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    triggerRefresh();
    toast.success('Dashboard refreshed');
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const formatLastRefresh = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleTimeString();
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6 p-4 bg-card border rounded-lg">
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={onDateRangeChange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="ytd">Year to date</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>

          <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
            <span>Last updated:</span>
            <Badge variant="outline">{formatLastRefresh(lastRefresh)}</Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onInsights}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Insights
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onAlerts}
          >
            <Bell className="h-4 w-4 mr-2" />
            Alerts
            <Badge variant="destructive" className="ml-2">3</Badge>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsConfigOpen(true)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      <ConfigureDashboardModal
        open={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
      />
    </>
  );
};
