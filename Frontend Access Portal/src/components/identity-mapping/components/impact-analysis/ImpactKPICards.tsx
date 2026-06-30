"use client";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, AlertTriangle, TrendingUp, Settings } from "lucide-react";
import { ImpactAnalysisData } from "../../data/impact-analysis";

interface ImpactKPICardsProps {
  data: ImpactAnalysisData;
}

export const ImpactKPICards = ({ data }: ImpactKPICardsProps) => {
  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Users className="h-5 w-5 text-brand-teal" />
          </div>
          <div className="text-2xl font-bold text-brand-teal">
            {data.totalIdentities.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">Total Identities</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-orange-600">
            {data.impactedIdentities.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">
            Impacted Identities
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-600">
            {data.impactRate}%
          </div>
          <div className="text-sm text-muted-foreground">Impact Rate</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Settings className="h-5 w-5 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-600">
            {data.issues.length}
          </div>
          <div className="text-sm text-muted-foreground">Issues Found</div>
        </CardContent>
      </Card>
    </div>
  );
};
