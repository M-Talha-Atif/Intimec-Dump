
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, User } from 'lucide-react';
import { type Employee } from '../types';

interface TeamMemberCardProps {
  member: Employee;
  isExpanded: boolean;
  onToggle: () => void;
}

export const TeamMemberCard = ({ member, isExpanded, onToggle }: TeamMemberCardProps) => (
  <div className="border border-slate-200 rounded-lg p-4 bg-white">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
          <User className="h-4 w-4 text-slate-600" />
        </div>
        <div>
          <h4 className="font-medium text-slate-800">{member.name}</h4>
          <p className="text-sm text-slate-600">{member.jobTitle}</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Badge className={member.riskLevel === 'High' ? 'bg-red-100 text-red-800' : member.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}>
          {member.riskLevel} Risk
        </Badge>
        {member.directReports && member.directReports.length > 0 && (
          <Button variant="ghost" size="sm" onClick={onToggle}>
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        )}
      </div>
    </div>
    
    <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
      <div>
        <span className="text-slate-500">Access Items:</span>
        <p className="font-medium">{member.accessCount}</p>
      </div>
      <div>
        <span className="text-slate-500">Employment:</span>
        <p className="font-medium">{member.employmentType}</p>
      </div>
      <div>
        <span className="text-slate-500">Status:</span>
        <Badge variant="outline" className="text-xs">{member.status}</Badge>
      </div>
    </div>

    {isExpanded && member.directReports && (
      <div className="mt-4 pl-6 border-l-2 border-slate-200 space-y-3">
        {member.directReports.map((report) => (
          <TeamMemberCard 
            key={report.id} 
            member={report} 
            isExpanded={false}
            onToggle={() => {}}
          />
        ))}
      </div>
    )}
  </div>
);
