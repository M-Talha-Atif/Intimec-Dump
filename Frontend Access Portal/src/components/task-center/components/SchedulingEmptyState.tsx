
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Plus } from 'lucide-react';

interface SchedulingEmptyStateProps {
  onCreateClick: () => void;
}

export const SchedulingEmptyState: React.FC<SchedulingEmptyStateProps> = ({ onCreateClick }) => {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Scheduled Tasks</h3>
        <p className="text-muted-foreground mb-4">
          Create your first scheduled task to automate IGA operations
        </p>
        <Button onClick={onCreateClick}>
          <Plus className="h-4 w-4 mr-2" />
          Create Your First Schedule
        </Button>
      </CardContent>
    </Card>
  );
};
