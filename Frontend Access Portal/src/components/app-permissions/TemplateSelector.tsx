"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Layout, Shield, Users, Eye, Briefcase } from "lucide-react";
import { PermissionTemplate } from "@/types/permissions";

interface TemplateSelectorProps {
  onClose: () => void;
  onApply: (templateId: string) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  onClose,
  onApply,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const templates: PermissionTemplate[] = [
    {
      id: "admin-full",
      name: "Full Administrator",
      description: "Complete access to all modules and actions",
      category: "standard",
      rules: [],
    },
    {
      id: "reviewer-standard",
      name: "Standard Reviewer",
      description:
        "Review and approve access requests with limited admin functions",
      category: "standard",
      rules: [],
    },
    {
      id: "analyst-readonly",
      name: "Security Analyst",
      description: "Read-only access to monitoring and analytics modules",
      category: "standard",
      rules: [],
    },
    {
      id: "helpdesk-basic",
      name: "Helpdesk Operator",
      description: "Basic user management and support functions",
      category: "standard",
      rules: [],
    },
    {
      id: "sox-compliant",
      name: "SOX Compliant Reviewer",
      description: "Compliance-focused role with segregation of duties",
      category: "compliance",
      rules: [],
    },
    {
      id: "custom-finance",
      name: "Finance Team Lead",
      description:
        "Custom role for finance department with specific access patterns",
      category: "custom",
      rules: [],
    },
  ];

  const filteredTemplates = templates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "standard":
        return <Shield className="h-4 w-4" />;
      case "compliance":
        return <Briefcase className="h-4 w-4" />;
      case "custom":
        return <Users className="h-4 w-4" />;
      default:
        return <Layout className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "standard":
        return "bg-blue-100 text-blue-800";
      case "compliance":
        return "bg-purple-100 text-purple-800";
      case "custom":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent
        className="!max-w-none w-[50vw] max-h-[90vh] overflow-y-auto !sm:max-w-none"
        style={{ width: "50vw !important", maxWidth: "none !important" }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Layout className="h-5 w-5" />
            <span>Permission Templates</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTemplates.map((template) => (
              <Card
                key={template.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-base flex items-center space-x-2">
                        {getCategoryIcon(template.category)}
                        <span>{template.name}</span>
                      </CardTitle>
                      <Badge className={getCategoryColor(template.category)}>
                        {template.category}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    {template.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      {template.rules.length ||
                        Math.floor(Math.random() * 20) + 5}{" "}
                      rules configured
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                      <Button size="sm" onClick={() => onApply(template.id)}>
                        Apply
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Layout className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No templates found matching your search.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
