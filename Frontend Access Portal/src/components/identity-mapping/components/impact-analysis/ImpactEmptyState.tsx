"use client";
import React from "react";
import { TrendingUp } from "lucide-react";
import { IdentityType } from "../../data/identity-mapping";

interface ImpactEmptyStateProps {
  identityType: IdentityType;
}

export const ImpactEmptyState = ({ identityType }: ImpactEmptyStateProps) => {
  return (
    <div className="text-center py-12">
      <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Ready for Impact Analysis
      </h3>
      <p className="text-gray-500 mb-4">
        Analyze how mapping changes will affect your {identityType} identity
        population
      </p>
      <p className="text-sm text-gray-400">
        This analysis will identify potential conflicts, data quality issues,
        and compliance risks
      </p>
    </div>
  );
};
