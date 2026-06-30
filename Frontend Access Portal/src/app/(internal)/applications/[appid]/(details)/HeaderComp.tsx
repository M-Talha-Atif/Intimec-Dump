import ConnectionStatusBadge from "@/components/applications/common/ConnectionStatusBadge";
import AuthoritativeStateBadge from "@/components/applications/common/AuthoritativeStateBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import CustomBreadcrumbs, {
  CustomBreadcrumbsSkeleton,
} from "./CustomBreadcrumbs";
import ApplicationIcon, {
  ApplicationIconSkeleton,
} from "@/components/applications/common/ApplicationIcon";
import { RecivedApplication } from "@/types/add-application";

export default async function HeaderComp({
  applicationPromise,
  appid,
}: {
  applicationPromise: Promise<RecivedApplication | null>;
  appid: string;
}) {
  const application = await applicationPromise;
  const name = application?.details?.name ?? "";
  const iconPath = application?.iconPath ?? "";
  const category = application?.details?.category ?? "";
  const isAuthoritative = application?.details?.isAuthoritative ?? false;
  const orphanCount = (application as any)?.orphanCount ?? 0;
  const riskyCount = (application as any)?.riskyCount ?? 0;

  return (
    <div>
      <CustomBreadcrumbs name={name} appid={appid} />
      <header className="mt-4">
        <div className="flex items-center gap-3 mb-1.5">
          <ApplicationIcon name={name} iconPath={iconPath} />
          <h1 className="text-xl lg:text-2xl font-bold truncate">{name}</h1>
          <ConnectionStatusBadge status={"Offline"} />
          <AuthoritativeStateBadge authoritative={isAuthoritative} />
        </div>
        <div className="flex items-center gap-2 ml-14">
          {category && (
            <span className="text-sm text-muted-foreground">
              {category} • Owner: {isAuthoritative ? "IT" : "Business"}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-2 ml-14 flex-wrap">
          {orphanCount > 0 && (
            <Badge variant="outline" className="text-xs">
              {orphanCount} Orphan Accounts
            </Badge>
          )}
          {riskyCount > 0 && (
            <Badge
              variant="outline"
              className="text-orange-600 border-orange-300 text-xs"
            >
              {riskyCount} Risky Accounts
            </Badge>
          )}
        </div>
      </header>
    </div>
  );
}

export function HeaderCompSekeleton({ appid }: { appid?: string } = {}) {
  return (
    <div>
      <CustomBreadcrumbsSkeleton appid={appid} />
      <header className="mt-4">
        <div className="flex items-center gap-3 mb-1.5">
          <ApplicationIconSkeleton />
          <Skeleton className="w-32 h-6 rounded animate-pulse" />
          <Skeleton className="w-24 h-5.5 animate-pulse rounded-full" />
          <Skeleton className="w-24 h-5.5 animate-pulse rounded-full" />
        </div>
        <div className="flex items-center gap-2 mt-2 ml-14">
          <Skeleton className="w-20 h-5 animate-pulse rounded-full" />
          <Skeleton className="w-28 h-5 animate-pulse rounded-full" />
        </div>
      </header>
    </div>
  );
}
