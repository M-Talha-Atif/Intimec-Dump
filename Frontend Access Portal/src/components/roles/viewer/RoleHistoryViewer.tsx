
import React from 'react';
import { Role } from '@/types/roles';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';
import InfoTooltip from '@/components/dashboard/InfoTooltip';

interface RoleHistoryViewerProps {
  role: Role;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Complete':
      return (
        <Badge variant="outline" className="text-xs border-green-300 bg-green-50 text-green-700 dark:bg-green-950/20 dark:border-green-700 dark:text-green-400">
          <CheckCircle className="h-3 w-3 mr-1" />{status}
        </Badge>
      );
    case 'Overdue':
      return (
        <Badge variant="outline" className="text-xs border-red-300 bg-red-50 text-red-700 dark:bg-red-950/20 dark:border-red-700 dark:text-red-400">
          <AlertCircle className="h-3 w-3 mr-1" />{status}
        </Badge>
      );
    case 'In Progress':
      return (
        <Badge variant="outline" className="text-xs border-yellow-300 bg-yellow-50 text-yellow-700 dark:bg-yellow-950/20 dark:border-yellow-700 dark:text-yellow-400">
          <Loader2 className="h-3 w-3 mr-1" />{status}
        </Badge>
      );
    default:
      return <Badge variant="secondary" className="text-xs">{status}</Badge>;
  }
};

const RoleHistoryViewer: React.FC<RoleHistoryViewerProps> = ({ role }) => {
  const certHistory = role.certificationHistory || [];
  const changelog = role.changelog || [];

  return (
    <div className="space-y-8">
      {/* Certification History */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <CheckCircle className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-medium">Certification History</h2>
          <InfoTooltip text="Record of periodic reviews and certifications for this role. Regular certification ensures access remains appropriate." />
        </div>
        
        {certHistory.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground border rounded-lg">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="font-medium">No certification records</p>
            <p className="text-sm mt-1">This role has not been through a certification campaign yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-0 font-medium text-muted-foreground">Campaign</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Reviewer</th>
                </tr>
              </thead>
              <tbody>
                {certHistory.map((cert, index) => (
                  <tr key={index} className="border-b border-muted">
                    <td className="py-4 px-0 text-foreground">{cert.campaignName}</td>
                    <td className="py-4 px-4">{getStatusBadge(cert.status)}</td>
                    <td className="py-4 px-4 text-muted-foreground">{cert.date}</td>
                    <td className="py-4 px-4 text-muted-foreground">{cert.reviewer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Changelog */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-medium">Changelog</h2>
          <InfoTooltip text="Audit trail of modifications made to this role, including who made each change and when." />
        </div>
        
        {changelog.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground border rounded-lg">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="font-medium">No changelog entries</p>
            <p className="text-sm mt-1">No modifications have been recorded for this role.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {changelog.map((entry, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-2 h-2 bg-muted-foreground rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm text-foreground mb-1">{entry.change}</p>
                  <p className="text-xs text-muted-foreground">
                    {entry.date} by {entry.by}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleHistoryViewer;
