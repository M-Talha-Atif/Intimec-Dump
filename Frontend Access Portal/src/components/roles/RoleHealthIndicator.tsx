
import * as React from 'react';
import { getRoleHealthIssues } from '@/lib/role-health';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { Role } from '@/types/roles';

interface RoleHealthIndicatorProps {
  role: Role;
  className?: string;
}

const ICONS = {
  warning: <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />,
  info: <AlertTriangle className="h-5 w-5 text-sky-500 flex-shrink-0" />,
}

const TEXT_STYLES = {
  warning: 'text-amber-900',
  info: 'text-sky-900',
}

const BG_STYLES = {
    warning: 'bg-amber-50 border-amber-200',
    info: 'bg-sky-50 border-sky-200',
}

const RoleHealthIndicator = ({ role, className }: RoleHealthIndicatorProps) => {
  const healthIssues = getRoleHealthIssues(role);

  if (healthIssues.length === 0) {
    return (
        <div className={`flex items-start gap-3 p-4 border rounded-lg bg-green-50 border-green-200 ${className}`}>
            <ShieldCheck className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-green-900">No Health Issues</h4>
              <p className="text-sm text-green-800">This role appears to be well-maintained.</p>
            </div>
        </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {healthIssues.map(issue => (
        <div key={issue.key} className={`flex items-start gap-3 p-4 border rounded-lg ${BG_STYLES[issue.severity]}`}>
           {ICONS[issue.severity]}
           <div>
            <h4 className={`font-semibold ${TEXT_STYLES[issue.severity]}`}>
              {issue.severity === 'warning' ? 'Warning' : 'Info'}
            </h4>
            <p className={`text-sm ${TEXT_STYLES[issue.severity]}`}>{issue.message}</p>
           </div>
        </div>
      ))}
    </div>
  );
};

export default RoleHealthIndicator;
