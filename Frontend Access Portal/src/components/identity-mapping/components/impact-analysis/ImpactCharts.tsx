"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { AttributeImpact, SourceImpact } from "../../data/impact-analysis";

interface ImpactChartsProps {
  attributeImpact: AttributeImpact[];
  sourceImpact: SourceImpact[];
}

export const ImpactCharts = ({
  attributeImpact,
  sourceImpact,
}: ImpactChartsProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Attribute Impact Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Attribute Impact Distribution</CardTitle>
          <CardDescription>
            Number of identities affected by attribute
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={attributeImpact}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="attribute" />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [
                  `${value} identities`,
                  name === "impacted" ? "Impacted" : "Total",
                ]}
              />
              <Bar dataKey="impacted" fill="#ef4444" name="impacted" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Source System Impact */}
      <Card>
        <CardHeader>
          <CardTitle>Source System Impact</CardTitle>
          <CardDescription>
            Percentage of issues by source system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sourceImpact}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {sourceImpact.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
