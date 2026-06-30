import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock } from "lucide-react";
import { DynamicAssignmentRule } from "@/types/dynamicRules";
import { SCHEDULE_TYPES } from "../data/ruleBuilderData";
import { useRuleBuilderContext } from "../contexts/RuleBuilderContext";

export const RuleScheduleSection: React.FC = () => {
  const { schedule, setSchedule } = useRuleBuilderContext();

  const updateSchedule = (
    updates: Partial<NonNullable<DynamicAssignmentRule["schedule"]>>
  ) => {
    setSchedule({ ...schedule!, ...updates });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Execution Schedule
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="mb-1">Schedule Type</Label>
            <Select
              value={schedule?.type}
              onValueChange={(value) =>
                updateSchedule({
                  type: value as NonNullable<
                    DynamicAssignmentRule["schedule"]
                  >["type"],
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select schedule" />
              </SelectTrigger>
              <SelectContent className="bg-popover border border-border">
                {SCHEDULE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {schedule?.type !== "immediate" && (
            <div>
              <Label>Time</Label>
              <Input
                type="time"
                value={schedule?.time || "00:00"}
                onChange={(e) => updateSchedule({ time: e.target.value })}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
