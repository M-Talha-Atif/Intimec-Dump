
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';

interface SchedulingHeaderProps {
  onCreateClick: () => void;
}

export const SchedulingHeader: React.FC<SchedulingHeaderProps> = ({ onCreateClick }) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold">Scheduled Tasks</h2>
        <p className="text-muted-foreground mt-1">
          Automated IGA tasks running on schedule
        </p>
      </div>
      <Button onClick={onCreateClick}>
        <Plus className="h-4 w-4 mr-2" />
        Create Schedule
      </Button>
    </div>
  );
};
