import React from "react";
import { type RiskContributor } from "@/data/mock-users";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertTriangle,
  ShieldCheck,
  Star,
  FileWarning,
  CalendarClock,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getIdentityProfile } from "@/data/mock-identity-profiles";
import { TabProps } from "../shared";

const riskLevelColors = {
  High: "text-red-600",
  Medium: "text-yellow-600",
  Low: "text-green-600",
};

const riskSourceIcons: { [key in RiskContributor["source"]]: React.ReactNode } =
  {
    Role: <Users className="h-4 w-4" />,
    Entitlement: <Star className="h-4 w-4" />,
    Policy: <FileWarning className="h-4 w-4" />,
    "Certification Age": <CalendarClock className="h-4 w-4" />,
    "Identity Attribute": <AlertTriangle className="h-4 w-4" />,
  };

const RiskTab: React.FC<TabProps> = ({ user }) => {
  // Get enhanced profile data
  const profile = getIdentityProfile(user.id);

  // Use profile risk events if available, otherwise fallback to user risk data
  const riskEvents = profile?.riskEvents || [];
  const riskContributors = user.riskContributors || [];

  // Add risk contributors from profile risk events
  const allRiskContributors = [
    ...riskContributors,
    ...riskEvents.map((event) => ({
      source: event.source as RiskContributor["source"],
      level: event.severity as RiskContributor["level"],
      description: event.description,
    })),
  ];

  return (
    <div className="space-y-6 mt-4">
      <Card>
        <CardHeader>
          <CardTitle>Identity Risk Score</CardTitle>
          <CardDescription>
            Overall risk assessment for this identity.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between p-6">
          <div className="flex flex-col items-center justify-center">
            <div
              className={`text-6xl font-bold ${
                riskLevelColors[user.riskLevel]
              }`}
            >
              {user.riskLevel === "High" && "92"}
              {user.riskLevel === "Medium" && "65"}
              {user.riskLevel === "Low" && "23"}
            </div>
            <div
              className={`text-xl font-semibold mt-2 ${
                riskLevelColors[user.riskLevel]
              }`}
            >
              {user.riskLevel} Risk
            </div>
          </div>
          <div className="w-1/2">
            <p className="font-semibold mb-2">Breakdown by Source</p>
            <div className="space-y-2">
              {allRiskContributors.slice(0, 5).map((c, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="flex items-center gap-2 text-muted-foreground">
                    {riskSourceIcons[c.source]} {c.source}
                  </span>
                  <Badge
                    variant="outline"
                    className={cn(riskLevelColors[c.level], "border-current")}
                  >
                    {c.level}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Risk Contributors</CardTitle>
          <CardDescription>
            Factors contributing to the overall risk score.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {allRiskContributors.length === 0 ? (
            <div className="flex items-center gap-3 text-green-700 bg-green-50 p-4 rounded-md">
              <ShieldCheck className="w-6 h-6" />
              <p className="font-medium">
                No significant risk factors detected.
              </p>
            </div>
          ) : (
            allRiskContributors.map((factor, index) => (
              <Alert
                key={index}
                variant={factor.level === "High" ? "destructive" : "default"}
              >
                {riskSourceIcons[factor.source]}
                <AlertTitle>{factor.source} Risk</AlertTitle>
                <AlertDescription>{factor.description}</AlertDescription>
              </Alert>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RiskTab;
