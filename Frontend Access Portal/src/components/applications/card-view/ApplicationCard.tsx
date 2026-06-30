import { Application } from "@/types/application";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, ShieldAlert, History, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import AiBadge from "@/components/applications/common/AiBadge";
import ApplicationDropDown from "@/components/applications/common/MenuDropDown";
import AuthoritativeStateBadge from "@/components/applications/common/AuthoritativeStateBadge";
import DetailStatusBadge from "@/components/applications/common/ConnectionStatusBadge";

import { formatTimestamp } from "@/utils/dateFormat";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import ApplicationIcon from "@/components/applications/common/ApplicationIcon";

const ApplicationCard = ({ application }: { application: Application }) => {
  const showRisky = application.riskyCount > 0;
  const router = useRouter();

  // Owner is not in mock data—use `source` as a placeholder
  const ownerLabel = application.authoritative
    ? "IT (Authoritative)"
    : "Business";

  // For type, just use `category`
  const typeLabel = application.category;

  // For AI Suggestions, placeholder text
  const aiSuggestionText =
    application.riskyCount > 0
      ? "We recommend reviewing risky accounts or adding missing flows."
      : "No suggestions at this time.";

  return (
    <Card
      className="relative z-0 flex flex-col justify-between py-0 overflow-hidden transition-all duration-300 ease-in-out cursor-pointer group hover:shadow-lg hover:scale-102"
      onClick={() => {
        router.push(`/applications/${application.id}/overview`);
      }}
    >
      <div className="absolute z-10 flex gap-1 right-3 top-3">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="cursor-pointer">
              <Info className="size-4 text-blue-400 transition hover:text-blue-600" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <span className="font-semibold">AI Suggestions</span>
              <div className="mt-1 text-xs">{aiSuggestionText}</div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Three-dot menu */}
        <ApplicationDropDown
          application={application}
          dotsDirection="vertical"
        />
      </div>

      <CardHeader className="pt-4 pb-2">
        <div className="flex items-center gap-3">
          <ApplicationIcon
            name={application.name}
            iconPath={application.iconPath}
          />
          <div className="flex-1">
            <div className="flex items-center justify-start gap-2">
              <CardTitle className="text-lg truncate">
                {application.name}
              </CardTitle>
              {application.authoritative && (
                <AuthoritativeStateBadge
                  authoritative={application.authoritative}
                />
              )}
            </div>
            <CardDescription>
              Type: {typeLabel} &nbsp;|&nbsp; Owner: {ownerLabel}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="grid grid-cols-2 gap-4 pb-2">
        <div className="flex items-center gap-2">
          <div className="flex-shrink-0 p-2 rounded-md bg-muted">
            <Users className="mt-0.5 h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-lg font-bold">{application.orphanCount}</p>
            <p className="text-xs text-muted-foreground">Orphan Accounts</p>
          </div>
        </div>
        {showRisky && (
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0 p-2 rounded-md bg-muted">
              <ShieldAlert className="mt-0.5 h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-lg font-bold">{application.riskyCount}</p>
              <p className="text-xs text-muted-foreground">Risky Accounts</p>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-row items-start justify-between w-full gap-2 p-4 pt-2 select-none bg-muted">
        <div className="flex flex-wrap items-center gap-2">
          <DetailStatusBadge status={application.connectionStatus} />
          <AiBadge status={application.aiStatus} />
        </div>

        <div className="flex items-center gap-1 p-0.75 text-xs text-muted-foreground min-w-fit">
          <History className="w-3 h-3" />
          <span>
            {formatTimestamp(
              Math.max(
                (new Date(application.lastSyncAccounts)).getTime(),
                (new Date(application.lastSyncEntitlements)).getTime()
              )
            )}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ApplicationCard;

export function ApplicationCardSkeleton() {
  return (
    <Card className="relative z-0 flex flex-col justify-between py-0 overflow-hidden transition-all duration-300 ease-in-out cursor-not-allowed group hover:shadow-lg hover:scale-102">
      <CardHeader className="pt-4 pb-2">
        <div className="flex items-center h-12 gap-3">
          <Skeleton className="w-10 h-10 rounded-md" />
          <div className="flex-1">
            <CardTitle className="pr-20 text-lg truncate">
              <Skeleton className="w-3/4 h-6 mb-1 rounded" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="w-3/4 h-5 rounded" />
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="grid grid-cols-2 gap-4 pb-2">
        <div className="flex items-center gap-2">
          <div className="flex-shrink-0 p-2 rounded-md bg-muted">
            <Users className="mt-0.5 h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <Skeleton className="w-1/3 h-6 mb-1 rounded" />
            <Skeleton className="w-3/4 h-4 rounded" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-shrink-0 p-2 rounded-md bg-muted">
            <ShieldAlert className="mt-0.5 h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <Skeleton className="w-1/3 h-6 mb-1 rounded" />
            <Skeleton className="w-3/4 h-4 rounded" />
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-row items-start justify-between w-full gap-2 p-4 pt-2 select-none bg-muted">
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="w-32 h-5 rounded-full" />
          <Skeleton className="w-20 h-5 rounded-full" />
        </div>

        <div className="flex items-center gap-1 p-0.75 text-xs bg-muted min-w-fit">
          <Skeleton className="w-32 h-4 rounded-md" />
        </div>
      </CardFooter>
    </Card>
  );
}
