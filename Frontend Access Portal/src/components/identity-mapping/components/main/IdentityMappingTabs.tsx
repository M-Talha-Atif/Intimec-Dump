"use client";
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { getIdentityTypeIcon } from "../../utils/identity-mapping-utils";
import { IdentityType } from "../../data/identity-mapping";
import { MappingEngine } from "../../MappingEngine";
import { CorrelationRules } from "../../CorrelationRules";
import { LivePreview } from "../../LivePreview";
import { ImpactAnalysis } from "../../ImpactAnalysis";
import { AuditTrail } from "../../AuditTrail";
import { useIdentityMappingContext } from "../../context/IdentityMappingContext";

export const IdentityMappingTabs = () => {
  const { activeTab, setActiveTab, selectedIdentityType } =
    useIdentityMappingContext();

  if (!selectedIdentityType) {
    return (
      <div className="text-center text-gray-500 p-8">
        Please select an identity schema to continue.
      </div>
    );
  }

  // Derive identity type from selected schema — schemaId values match the IdentityType union
  const identityType = selectedIdentityType.schemaId as IdentityType;
  const SelectedIcon = getIdentityTypeIcon(identityType);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <div className="flex items-center justify-between">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="mapping">Mapping Engine</TabsTrigger>
          <TabsTrigger value="correlation">Correlation Rules</TabsTrigger>
          <TabsTrigger value="preview">Live Preview</TabsTrigger>
          <TabsTrigger value="impact">Impact Analysis</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
        </TabsList>
        <Badge variant="outline" className="ml-4 flex items-center space-x-2">
          <SelectedIcon className="h-3 w-3" />
          <span>{selectedIdentityType.schemaName}</span>
        </Badge>
      </div>

      <TabsContent value="mapping">
        <MappingEngine />
      </TabsContent>

      <TabsContent value="correlation">
        <CorrelationRules identityType={identityType} />
      </TabsContent>

      <TabsContent value="preview">
        <LivePreview identityType={identityType} />
      </TabsContent>

      <TabsContent value="impact">
        <ImpactAnalysis identityType={identityType} />
      </TabsContent>

      <TabsContent value="audit">
        <AuditTrail identityType={identityType} />
      </TabsContent>
    </Tabs>
  );
};
