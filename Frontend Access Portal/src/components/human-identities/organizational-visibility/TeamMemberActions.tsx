
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Mail,
  Calendar,
  Target,
  MessageSquare,
  Clock,
  AlertTriangle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TeamMemberActionsProps {
  member: any;
  onSendReminder: (memberId: string) => void;
  onTriggerReview: (memberId: string) => void;
  onScheduleOneOnOne: (memberId: string) => void;
}

export const TeamMemberActions = ({ 
  member, 
  onSendReminder, 
  onTriggerReview, 
  onScheduleOneOnOne 
}: TeamMemberActionsProps) => {
  return (
    <div className="flex items-center space-x-2">
      {/* Access Drift Indicator */}
      {member.accessDrift && (
        <Badge variant="outline" className="text-orange-600 border-orange-300">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Drift
        </Badge>
      )}
      
      {/* Quick Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            Actions
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-white">
          <DropdownMenuItem onClick={() => onSendReminder(member.id)}>
            <Mail className="h-4 w-4 mr-2" />
            Send Reminder
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onTriggerReview(member.id)}>
            <Target className="h-4 w-4 mr-2" />
            Trigger Review
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onScheduleOneOnOne(member.id)}>
            <Calendar className="h-4 w-4 mr-2" />
            Schedule 1:1
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
