
import React from 'react';
import { TeamMember } from './TeamMember';
import { EmploymentOverview } from './EmploymentOverview';
import { teamTreeData } from './constants';

interface TeamTreeViewProps {
  expandedNodes: Set<string>;
  onToggleNode: (nodeId: string) => void;
}

export function TeamTreeView({ expandedNodes, onToggleNode }: TeamTreeViewProps) {
  // Flatten team data for employment overview
  const flattenTeamData = (data: any[]): any[] => {
    const flattened: any[] = [];
    data.forEach(manager => {
      flattened.push(manager);
      if (manager.directReports) {
        flattened.push(...manager.directReports);
      }
      if (manager.crossDepartmental) {
        flattened.push(...manager.crossDepartmental);
      }
    });
    return flattened;
  };

  const allTeamMembers = flattenTeamData(teamTreeData);

  const handleSendReminder = (memberId: string) => {
    console.log(`Sending reminder to member: ${memberId}`);
  };

  const handleTriggerReview = (memberId: string) => {
    console.log(`Triggering review for member: ${memberId}`);
  };

  const handleScheduleOneOnOne = (memberId: string) => {
    console.log(`Scheduling 1:1 with member: ${memberId}`);
  };

  return (
    <div className="space-y-6">
      <EmploymentOverview teamData={allTeamMembers} />
      
      <div className="space-y-2">
        {teamTreeData.map((manager) => (
          <TeamMember
            key={manager.id}
            member={manager}
            level={0}
            isExpanded={expandedNodes.has(manager.id)}
            onToggle={() => onToggleNode(manager.id)}
            onSendReminder={handleSendReminder}
            onTriggerReview={handleTriggerReview}
            onScheduleOneOnOne={handleScheduleOneOnOne}
          />
        ))}
      </div>
    </div>
  );
}
