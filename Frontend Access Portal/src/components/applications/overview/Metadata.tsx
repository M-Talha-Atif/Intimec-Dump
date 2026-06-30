import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Application } from "@/types/application";
import { shortDate } from "@/utils/dateFormat";
import AuthoritativeStateBadge from "@/components/applications/common/AuthoritativeStateBadge";
import ConnectionStateBadge from "@/components/applications/common/ConnectionStatusBadge";

interface MetadataProps extends React.HTMLAttributes<HTMLDivElement> {
  application: Application;
  className?: string;
}

export default function Metadata({
  application,
  className = "",
  ...props
}: MetadataProps) {
  return (
    <Card className={className} {...props}>
      <CardHeader>
        <CardTitle>Application Metadata</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap justify-around gap-4  text-sm">
        <section className="flex flex-col gap-4 flex-grow">
          <div className="w-max">
            <span className="font-semibold text-muted-foreground">Owner:</span>{" "}
            {application.authoritative ? "IT" : "Business"}
          </div>
          <div className="w-max">
            <span className="font-semibold text-muted-foreground">
              Connector Type:
            </span>{" "}
            {application.category}
          </div>
          <div className="flex items-center w-max">
            <span className="font-semibold text-muted-foreground mr-2">Source:</span>
            <AuthoritativeStateBadge authoritative={application.authoritative} />
          </div>
          <div className="flex items-center w-max">
            <span className="font-semibold text-muted-foreground mr-2">Health:</span>
            <ConnectionStateBadge status={application.connectionStatus} />
          </div>
        </section>
        <section className="flex flex-col gap-4 flex-grow">
          <div className="w-max">
            <span className="font-semibold text-muted-foreground">Onboarded:</span>{" "}
            {shortDate(application.createdAt)}
          </div>
          <div className="w-max">
            <span className="font-semibold text-muted-foreground">
              Last Accounts Sync:
            </span>{" "}
            {shortDate(application.lastSyncAccounts)}
          </div>
          <div className="w-max">
            <span className="font-semibold text-muted-foreground">
              Last Entitlements Sync:
            </span>{" "}
            {shortDate(application.lastSyncEntitlements)}
          </div>
        </section>
      </CardContent>
    </Card>
  );
}
