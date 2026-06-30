import { ReactNode } from 'react';
import InfoTooltip from '@/components/dashboard/InfoTooltip';
import AppBreadcrumb from '@/components/shared/AppBreadcrumb';

interface PageHeaderProps {
  title: string;
  description: string;
  icon: ReactNode;
  tooltip?: string;
  actions?: ReactNode;
}

const PageHeader = ({ title, description, icon, tooltip, actions }: PageHeaderProps) => (
  <header className="space-y-3" role="banner">
    <AppBreadcrumb />
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10" aria-hidden="true">
          {icon}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-foreground">{title}</h1>
            {tooltip && <InfoTooltip text={tooltip} />}
          </div>
          <p className="text-muted-foreground mt-1">{description}</p>
        </div>
      </div>
      {actions && <div className="flex gap-2" role="toolbar" aria-label="Page actions">{actions}</div>}
    </div>
  </header>
);

export default PageHeader;
