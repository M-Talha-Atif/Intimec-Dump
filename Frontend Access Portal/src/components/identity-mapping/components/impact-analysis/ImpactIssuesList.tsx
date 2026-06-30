"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ImpactIssue } from "../../data/impact-analysis";
import {
  getSeverityBadge,
  getTypeIcon,
  getSeverityBorderClass,
} from "../../utils/impact-analysis-utils";

interface ImpactIssuesListProps {
  issues: ImpactIssue[];
}

export const ImpactIssuesList = ({ issues }: ImpactIssuesListProps) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Mapping Issues</CardTitle>
        <CardDescription>
          Identified issues that may impact identity data quality
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {issues.map((issue) => (
            <Alert
              key={issue.id}
              className={`border-l-4 ${getSeverityBorderClass(issue.severity)}`}
            >
              {getTypeIcon(issue.type)}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{issue.title}</h4>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    {getSeverityBadge(issue.severity)}
                    <Badge variant="outline">
                      {issue.affectedCount} affected
                    </Badge>
                  </div>
                </div>
                <AlertDescription className="text-gray-600 mb-2">
                  {issue.description}
                </AlertDescription>
                <p className="text-sm text-muted-foreground">
                  Source: {issue.source}
                </p>
              </div>
            </Alert>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
