import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Building,
  User as UserIcon,
  Briefcase,
  Users,
  RefreshCw,
  Mail,
  MapPin,
  Calendar,
  Clock,
} from "lucide-react";
import IdentityQuickStatsCard from "@/components/human-identities/IdentityQuickStatsCard";
import useIdentity from "@/hooks/identities/useIdentity";
import useIdentityShadows from "@/hooks/identities/useIdentityShadows";
import { attr, displayName as idDisplayName } from "@/types/identity";
import { useIdentityDetail } from "@/contexts/IdentityDetailContext";
import { TabProps, DetailItem } from "../shared";

const OverviewTab: React.FC<TabProps> = ({ user }) => {
  const { isRegeneratingSummary, regenerateSummary } = useIdentityDetail();
  const { data: identity } = useIdentity("employee", user.id);
  const { data: shadowsResponse } = useIdentityShadows(user.id);

  // Prefer real identity attributes, fall back to the User prop
  const name = identity ? idDisplayName(identity) : user.name;
  const department = (identity ? attr(identity, "department") : null) ?? user.department;
  const status = identity?.status ?? user.status;
  const manager = (identity ? attr(identity, "managerDisplayName") ?? attr(identity, "managerRef") : null) ?? user.manager;
  const employeeId = identity ? attr(identity, "employeeId") : null;

  const getAccessSummary = () => {
    const numAccounts = shadowsResponse?.totalCount ?? 0;
    const privileged = user.isPrivileged ? "Holds privileged access. " : "";
    return `${name} is an employee in the ${department} department. ${privileged}They have ${numAccounts} linked resource account${numAccounts !== 1 ? "s" : ""}.`;
  };

  // Prefer real identity coreAttributes, fallback to user-level data
  const extendedData = identity
    ? {
        email: attr(identity, "email") ?? `${user.name.toLowerCase().replace(" ", ".")}@company.com`,
        jobTitle: attr(identity, "jobTitle") ?? user.department,
        startDate: attr(identity, "hireDate") ?? "—",
        workLocation: attr(identity, "location") ?? "—",
        lastLogin: "—",
        probationEndDate: null,
      }
    : {
        email: `${user.name.toLowerCase().replace(" ", ".")}@company.com`,
        jobTitle: user.department,
        startDate: "—",
        workLocation: "—",
        lastLogin: "—",
        probationEndDate: null,
      };

  return (
    <div className="space-y-6 mt-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-lg">
              <Sparkles className="w-5 h-5 mr-2 text-brand-purple" />
              AI-Generated Summary
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={regenerateSummary}
              disabled={isRegeneratingSummary}
              className="flex items-center space-x-2"
            >
              <RefreshCw
                className={`w-4 h-4 ${
                  isRegeneratingSummary ? "animate-spin" : ""
                }`}
              />
              <span>
                {isRegeneratingSummary
                  ? "Regenerating..."
                  : "Regenerate Summary"}
              </span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground italic">
            {getAccessSummary()}
          </p>
          {user.riskFactors && user.riskFactors.length > 0 && (
            <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
                AI Risk Insights:
              </p>
              <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                {user.riskFactors.slice(0, 2).map((factor, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                    {factor}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <IdentityQuickStatsCard user={user} />

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Identity Details</CardTitle>
            <CardDescription>
              Core user attributes and information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailItem icon={UserIcon} label="Full Name" value={name} />
            {employeeId && <DetailItem icon={UserIcon} label="Employee ID" value={employeeId} />}
            <DetailItem icon={Mail} label="Email" value={extendedData.email} />
            <DetailItem
              icon={Briefcase}
              label="Job Title"
              value={extendedData.jobTitle}
            />
            <DetailItem
              icon={Building}
              label="Department"
              value={department}
            />
            <DetailItem icon={UserIcon} label="Status" value={status} />
            <DetailItem
              icon={Calendar}
              label="Start Date"
              value={extendedData.startDate}
            />
            <DetailItem
              icon={MapPin}
              label="Work Location"
              value={extendedData.workLocation}
            />
            <DetailItem
              icon={Clock}
              label="Last Login"
              value={extendedData.lastLogin}
            />
            {extendedData.probationEndDate && (
              <DetailItem
                icon={Calendar}
                label="Probation End"
                value={extendedData.probationEndDate}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Organization</CardTitle>
            <CardDescription>
              Position within the company structure.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailItem icon={UserIcon} label="Manager" value={manager || "—"} />
            <DetailItem
              icon={Users}
              label="Direct Reports"
              value="—"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OverviewTab;
