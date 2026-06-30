import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, ShieldAlert, AlertCircle, BarChart2 } from "lucide-react";
import { Application } from "@/types/application";

interface GovernanceKPIItemProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}
function GovernanceKpiCard({ title, value, icon }: GovernanceKPIItemProps) {
  return (
    <div className="flex items-center space-x-4 rounded-lg border p-4">
      <div className="flex-shrink-0">{icon}</div>
      <div>
        <p className="text-sm">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}

interface GovernanceKPIProps extends React.HTMLAttributes<HTMLDivElement> {
  application: Application;
  className?: string;
}

export default function GovernanceKPI({
  application,
  className = "",
  ...props
}: GovernanceKPIProps) {
  return (
    <Card className={className} {...props}>
      <CardHeader>
        <CardTitle>Governance KPIs</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(13rem,1fr))]">
        <GovernanceKpiCard
          title="Total Accounts"
          value={application.users}
          icon={<Users className="h-8 w-8" />}
        />
        <GovernanceKpiCard
          title="Orphan Accounts"
          value={application.orphanCount}
          icon={<AlertCircle className="h-8 w-8" />}
        />
        <GovernanceKpiCard
          title="Risky Entitlements"
          value={application.riskyCount}
          icon={<ShieldAlert className="h-8 w-8" />}
        />
        <GovernanceKpiCard
          title="Policy Violations"
          value={3}
          icon={<BarChart2 className="h-8 w-8" />}
        />
      </CardContent>
    </Card>
  );
}
