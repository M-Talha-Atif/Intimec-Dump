
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronDown,
  ChevronRight,
  User,
  MapPin,
  Calendar,
  Shield,
  Building,
  MoreVertical,
  Eye,
  UserCheck,
  History,
  UserX
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { TeamMemberDetailModal } from '../TeamMemberDetailModal';
import { TeamMemberActions } from './TeamMemberActions';

interface TeamMemberProps {
  member: any;
  level: number;
  isExpanded: boolean;
  onToggle: () => void;
  onSendReminder: (memberId: string) => void;
  onTriggerReview: (memberId: string) => void;
  onScheduleOneOnOne: (memberId: string) => void;
}

// Function to get risk-based border color
const getRiskBorderColor = (riskLevel: string) => {
  switch (riskLevel) {
    case 'High': return 'border-l-red-500 bg-red-50';
    case 'Medium': return 'border-l-yellow-500 bg-yellow-50';
    case 'Low': return 'border-l-green-500 bg-green-50';
    default: return 'border-l-gray-500 bg-gray-50';
  }
};

export const TeamMember = ({ 
  member, 
  level, 
  isExpanded, 
  onToggle,
  onSendReminder,
  onTriggerReview,
  onScheduleOneOnOne
}: TeamMemberProps) => (
  <div className={`ml-${level * 4} border-l-4 pl-4 py-2 ${getRiskBorderColor(member.riskLevel)}`}>
    <div className="flex items-center justify-between p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors shadow-sm">
      <TeamMemberDetailModal member={{
        id: member.id,
        name: member.name,
        role: member.role,
        location: member.location,
        joinDate: member.joinDate,
        riskLevel: member.riskLevel,
        accessLevel: member.accessLevel,
        accessItems: member.accessItems,
        employmentType: member.employmentType,
        status: member.status,
        department: member.department
      }}>
        <div className="flex items-center space-x-3 cursor-pointer flex-1">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            member.riskLevel === 'High' ? 'bg-red-100' :
            member.riskLevel === 'Medium' ? 'bg-yellow-100' :
            'bg-green-100'
          }`}>
            <User className={`h-5 w-5 ${
              member.riskLevel === 'High' ? 'text-red-600' :
              member.riskLevel === 'Medium' ? 'text-yellow-600' :
              'text-green-600'
            }`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{member.name}</span>
              <Badge variant="outline" className={
                member.status === 'Active' ? 'text-green-600 border-green-300' :
                'text-gray-600 border-gray-300'
              }>
                {member.status}
              </Badge>
              <Badge variant="secondary">{member.employmentType}</Badge>
            </div>
            <div className="text-sm text-gray-600">{member.role}</div>
            <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
              <div className="flex items-center space-x-1">
                <MapPin className="h-3 w-3" />
                <span>{member.location}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>{member.joinDate}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Shield className="h-3 w-3" />
                <span>{member.accessItems} Access Items</span>
              </div>
            </div>
          </div>
        </div>
      </TeamMemberDetailModal>
      
      <div className="flex items-center space-x-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge 
                className={`cursor-pointer ${
                  member.riskLevel === 'High' ? 'bg-red-100 text-red-800 hover:bg-red-200' :
                  member.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' :
                  'bg-green-100 text-green-800 hover:bg-green-200'
                }`}
              >
                {member.riskLevel} Risk
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Click to view detailed risk assessment</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {member.accessLevel === 'Privileged' && (
          <Badge variant="outline" className="text-purple-600">
            <Shield className="h-3 w-3 mr-1" />
            Privileged
          </Badge>
        )}
        
        <TeamMemberActions
          member={member}
          onSendReminder={onSendReminder}
          onTriggerReview={onTriggerReview}
          onScheduleOneOnOne={onScheduleOneOnOne}
        />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white">
            <DropdownMenuItem onClick={() => console.log(`View access details for ${member.name}`)}>
              <Eye className="h-4 w-4 mr-2" />
              View Access Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log(`Review access for ${member.name}`)}>
              <UserCheck className="h-4 w-4 mr-2" />
              Review Access
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log(`View history for ${member.name}`)}>
              <History className="h-4 w-4 mr-2" />
              View History
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log(`Delegate authority for ${member.name}`)}>
              <UserX className="h-4 w-4 mr-2" />
              Delegate Authority
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {(member.directReports?.length > 0 || member.crossDepartmental?.length > 0) && (
          <Button variant="ghost" size="sm" onClick={onToggle}>
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        )}
      </div>
    </div>
    
    {isExpanded && (
      <div className="mt-2 space-y-2">
        {member.directReports?.map((report: any) => (
          <TeamMember 
            key={report.id} 
            member={{...report, accessDrift: Math.random() > 0.7}} 
            level={level + 1}
            isExpanded={false}
            onToggle={() => {}}
            onSendReminder={onSendReminder}
            onTriggerReview={onTriggerReview}
            onScheduleOneOnOne={onScheduleOneOnOne}
          />
        ))}
        {member.crossDepartmental?.length > 0 && (
          <div className="ml-4 pt-2 border-t border-dashed border-gray-300">
            <div className="text-sm font-medium text-gray-600 mb-2 flex items-center">
              <Building className="h-4 w-4 mr-1" />
              Cross-Departmental Reports
            </div>
            {member.crossDepartmental.map((report: any) => (
              <TeamMember 
                key={report.id} 
                member={{...report, accessDrift: Math.random() > 0.5}} 
                level={level + 1}
                isExpanded={false}
                onToggle={() => {}}
                onSendReminder={onSendReminder}
                onTriggerReview={onTriggerReview}
                onScheduleOneOnOne={onScheduleOneOnOne}
              />
            ))}
          </div>
        )}
      </div>
    )}
  </div>
);
