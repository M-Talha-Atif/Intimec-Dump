import React from "react";
import { type ActivityEvent } from "@/data/mock-users";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Check, Plus, Minus, UserCheck } from "lucide-react";
import { TabProps } from "../shared";

const eventIcons = {
  Assignment: <Plus className="w-4 h-4 text-white" />,
  Revocation: <Minus className="w-4 h-4 text-white" />,
  Review: <UserCheck className="w-4 h-4 text-white" />,
  Request: <Check className="w-4 h-4 text-white" />,
};

const eventColors = {
  Assignment: "bg-sky-500",
  Revocation: "bg-slate-500",
  Review: "bg-green-500",
  Request: "bg-indigo-500",
};

const ActivityTab: React.FC<TabProps> = ({ user }) => {
  if (!user.activity || user.activity.length === 0) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No recent activity found for this identity.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Audit trail of recent events and changes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative pl-6">
          <div
            className="absolute left-[35px] top-0 h-full w-0.5 bg-border"
            style={{ transform: "translateX(-50%)" }}
          ></div>
          {user.activity.map((event: ActivityEvent) => (
            <div
              key={event.id}
              className="relative flex items-start gap-6 pb-8"
            >
              <div className="relative z-10">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    eventColors[event.type]
                  }`}
                >
                  {eventIcons[event.type]}
                </div>
              </div>
              <div className="flex-1 pt-1.5">
                <p className="font-medium">{event.description}</p>
                <p className="text-sm text-muted-foreground">
                  by {event.actor} on {event.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityTab;
