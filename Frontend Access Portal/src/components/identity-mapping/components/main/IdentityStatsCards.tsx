"use client";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IdentityType } from "../../data/identity-mapping";
import { useIdentityMappingContext } from "../../context/IdentityMappingContext";

interface IdentityStatsCardsProps {
  identityType: IdentityType;
}

export const IdentityStatsCards = ({
  identityType: _identityType,
}: IdentityStatsCardsProps) => {
  const { mappingStats } = useIdentityMappingContext();

  const stats = [
    { label: "Active Mappings", value: String(mappingStats.activeMappings), color: "text-blue-600" },
    { label: "Transformation Rules", value: String(mappingStats.transformationRules), color: "text-green-600" },
    { label: "Data Sources", value: String(mappingStats.dataSources), color: "text-purple-600" },
    { label: "Conflicts Resolved", value: mappingStats.conflictsResolved > 0 ? String(mappingStats.conflictsResolved) : "N/A", color: "text-orange-600" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <Badge variant="secondary" className={stat.color}>
                live
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
