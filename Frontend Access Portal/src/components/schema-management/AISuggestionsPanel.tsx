"use client";
import React, { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Brain,
  Lightbulb,
  TrendingUp,
  Shield,
  Link,
  Plus,
  RefreshCw,
} from "lucide-react";

interface AISuggestionsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType: string;
}

const mockSuggestions = {
  "employee-identities": [
    {
      type: "missing_attribute",
      priority: "high",
      title: "Add Employee Badge Number",
      description:
        "Physical security systems commonly use badge numbers for access control",
      suggestedAttribute: {
        name: "badgeNumber",
        type: "String",
        required: false,
        sensitive: false,
      },
      confidence: 92,
      reason: "Found in 87% of enterprise identity systems",
      sources: ["Active Directory", "HR Systems"],
    },
    {
      type: "optimization",
      priority: "medium",
      title: "Optimize Department Field",
      description:
        "Department field could benefit from enum validation to prevent inconsistencies",
      suggestedChange: {
        field: "department",
        currentType: "String",
        suggestedType: "Enum",
        enumValues: ["Engineering", "Sales", "Marketing", "HR", "Finance"],
      },
      confidence: 85,
      reason: "Analysis of existing data shows limited value set",
      impact: "Data quality improvement",
    },
    {
      type: "compliance",
      priority: "high",
      title: "Add Data Classification Tags",
      description:
        "Some attributes lack proper data classification for GDPR compliance",
      affectedFields: ["email", "firstName", "lastName"],
      suggestedTags: ["PII", "GDPR"],
      confidence: 98,
      reason: "Required for privacy regulations compliance",
    },
    {
      type: "integration",
      priority: "medium",
      title: "Map to Workday Fields",
      description:
        "Discovered unmapped Workday attributes that could enhance identity data",
      mappingSuggestions: [
        { workdayField: "Cost_Center", igaField: "costCenter", confidence: 90 },
        { workdayField: "Time_Zone", igaField: "timezone", confidence: 88 },
      ],
      confidence: 89,
      reason: "Found in connected Workday tenant",
    },
  ],
  "non-human-identities": [
    {
      type: "security",
      priority: "high",
      title: "Add Certificate Expiry Tracking",
      description: "Service accounts should track certificate expiration dates",
      suggestedAttribute: {
        name: "certificateExpiry",
        type: "Date",
        required: false,
        sensitive: true,
      },
      confidence: 95,
      reason: "Critical for automated certificate management",
    },
    {
      type: "governance",
      priority: "medium",
      title: "Implement Usage Monitoring",
      description: "Add fields to track service account usage patterns",
      suggestedAttributes: [
        { name: "lastActivity", type: "Date" },
        { name: "usageFrequency", type: "String" },
      ],
      confidence: 82,
      reason: "Helps identify dormant accounts",
    },
  ],
};

export const AISuggestionsPanel = ({
  open,
  onOpenChange,
  entityType,
}: AISuggestionsPanelProps) => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadSuggestions();
    }
  }, [open, entityType]);

  const loadSuggestions = () => {
    setIsLoading(true);
    // Simulate AI processing time
    setTimeout(() => {
      setSuggestions(
        mockSuggestions[entityType as keyof typeof mockSuggestions] || []
      );
      setIsLoading(false);
    }, 1500);
  };

  const filteredSuggestions = suggestions.filter((suggestion) => {
    if (filterPriority !== "all" && suggestion.priority !== filterPriority)
      return false;
    if (filterType !== "all" && suggestion.type !== filterType) return false;
    return true;
  });

  const handleApplySuggestion = (suggestion: any) => {
    console.log("Applying AI suggestion:", suggestion);
    // Here you would implement the logic to apply the suggestion
  };

  const handleDismissSuggestion = (suggestionIndex: number) => {
    setSuggestions((prev) =>
      prev.filter((_, index) => index !== suggestionIndex)
    );
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-100 text-red-800">High Priority</Badge>;
      case "medium":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            Medium Priority
          </Badge>
        );
      case "low":
        return (
          <Badge className="bg-green-100 text-green-800">Low Priority</Badge>
        );
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "missing_attribute":
        return <Plus className="h-4 w-4 text-blue-600" />;
      case "optimization":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "compliance":
        return <Shield className="h-4 w-4 text-red-600" />;
      case "integration":
        return <Link className="h-4 w-4 text-purple-600" />;
      case "security":
        return <Shield className="h-4 w-4 text-orange-600" />;
      case "governance":
        return <Lightbulb className="h-4 w-4 text-yellow-600" />;
      default:
        return <Brain className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-blue-600" />
            <span>AI Schema Suggestions</span>
          </SheetTitle>
          <SheetDescription>
            AI-powered recommendations to optimize your {entityType} schema
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 mt-6">
          {/* Filters */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <Label htmlFor="priority-filter">Priority</Label>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger id="priority-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="low">Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label htmlFor="type-filter">Category</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger id="type-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="missing_attribute">
                    Missing Attributes
                  </SelectItem>
                  <SelectItem value="optimization">Optimizations</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                  <SelectItem value="integration">Integration</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="governance">Governance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {filteredSuggestions.length} suggestion
              {filteredSuggestions.length !== 1 ? "s" : ""} found
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadSuggestions}
              disabled={isLoading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>

          {/* Suggestions List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">
                <Brain className="h-8 w-8 mx-auto mb-4 text-blue-600 animate-pulse" />
                <p className="text-gray-600">AI is analyzing your schema...</p>
              </div>
            ) : filteredSuggestions.length === 0 ? (
              <div className="text-center py-8">
                <Lightbulb className="h-8 w-8 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-600">
                  No suggestions found for current filters
                </p>
              </div>
            ) : (
              filteredSuggestions.map((suggestion, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(suggestion.type)}
                        <CardTitle className="text-base">
                          {suggestion.title}
                        </CardTitle>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getPriorityBadge(suggestion.priority)}
                        <Badge variant="outline" className="text-blue-600">
                          {suggestion.confidence}% confidence
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-gray-600">
                      {suggestion.description}
                    </p>

                    <div className="text-sm">
                      <span className="font-medium text-gray-700">
                        Reason:{" "}
                      </span>
                      <span className="text-gray-600">{suggestion.reason}</span>
                    </div>

                    {suggestion.suggestedAttribute && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="text-sm font-medium mb-2">
                          Suggested Attribute:
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <strong>Name:</strong>{" "}
                            {suggestion.suggestedAttribute.name}
                          </div>
                          <div>
                            <strong>Type:</strong>{" "}
                            {suggestion.suggestedAttribute.type}
                          </div>
                          <div>
                            <strong>Required:</strong>{" "}
                            {suggestion.suggestedAttribute.required
                              ? "Yes"
                              : "No"}
                          </div>
                          <div>
                            <strong>Sensitive:</strong>{" "}
                            {suggestion.suggestedAttribute.sensitive
                              ? "Yes"
                              : "No"}
                          </div>
                        </div>
                      </div>
                    )}

                    {suggestion.mappingSuggestions && (
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <div className="text-sm font-medium mb-2">
                          Mapping Suggestions:
                        </div>
                        <div className="space-y-1">
                          {suggestion.mappingSuggestions.map(
                            (mapping: any, idx: number) => (
                              <div
                                key={idx}
                                className="text-sm flex justify-between"
                              >
                                <span>
                                  {mapping.workdayField} → {mapping.igaField}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {mapping.confidence}%
                                </Badge>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end space-x-2 pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDismissSuggestion(index)}
                      >
                        Dismiss
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleApplySuggestion(suggestion)}
                      >
                        Apply Suggestion
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
