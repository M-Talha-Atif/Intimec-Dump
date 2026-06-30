"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, User } from "lucide-react";
import { useRouter } from "next/navigation";

import { useMyTeam } from "./hooks";
import {
  TileErrorCard,
  TileHeader,
  TileLoadingSkeleton,
  TileEmptyState,
  ViewAllButton,
} from "./components";
import { getStatusColor, getRiskScoreColor } from "./utils";

interface MyTeamTileProps {
  searchQuery: string;
}

export const MyTeamTile = ({ searchQuery }: MyTeamTileProps) => {
  const router = useRouter();

  const {
    filteredTeam,
    isLoading,
    error,
  } = useMyTeam(searchQuery);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "default";
      case "INACTIVE":
        return "secondary";
      case "LOCKED":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 70) return "text-destructive";
    if (score >= 40) return "text-warning";
    return "text-muted-foreground";
  };

  if (error) {
    return (
      <TileErrorCard
        title="Error Loading Team"
        message="Failed to load team members. Please try again."
      />
    );
  }

  const activeCount =
    filteredTeam?.filter((m) => m.status === "ACTIVE").length || 0;
  const inactiveCount =
    filteredTeam?.filter((m) => m.status === "INACTIVE" || m.status === "LOCKED").length || 0;

  return (
    <Card>
      <CardHeader>
        <TileHeader
          icon={<Users className="h-5 w-5 text-primary" />}
          title="My Team"
          description="Direct reports and team members"
          count={filteredTeam?.length}
          isLoading={isLoading}
        />
      </CardHeader>
      <CardContent>
        {/* Status Summary */}
        {!isLoading && filteredTeam && (
          <div className="flex gap-4 mb-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-muted-foreground">
                {activeCount} Active
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-gray-400" />
              <span className="text-muted-foreground">
                {inactiveCount} Inactive
              </span>
            </div>
          </div>
        )}

        {isLoading ? (
          <TileLoadingSkeleton count={4} height="h-16" />
        ) : filteredTeam && filteredTeam.length > 0 ? (
          <div className="space-y-3">
            {filteredTeam.slice(0, 5).map((member) => (
              <div
                key={member.userId}
                className="p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => router.push("/identities/human")}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{member.displayName}</h4>
                      <p className="text-xs text-muted-foreground">
                        {member.jobTitle}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={getStatusColor(member.status)}
                    className="text-xs"
                  >
                    {member.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-2 ml-10">
                  <span>{member.department}</span>
                  <span className={getRiskScoreColor(member.riskScore)}>
                    Risk: {member.riskScore}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <TileEmptyState
            icon={<Users className="h-12 w-12" />}
            message="No team members found"
          />
        )}

        {filteredTeam && filteredTeam.length > 0 && (
          <ViewAllButton
            label="View Full Team"
            href="/responsibilities/team"
          />
        )}
      </CardContent>
    </Card>
  );
};