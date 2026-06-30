"use client";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CorrelationRulesProps } from "./types/index";
import { useCorrelationRules } from "./hooks/useCorrelationRules";
import { useIdentityMappingState } from "./hooks/useIdentityMappingState";
import { CorrelationRulesProvider } from "./context/CorrelationRulesContext";
import {
  CorrelationRuleCard,
  CorrelationRulesToolbar,
  RulesSummary,
} from "./components/correlation";
import UnsavedChangesBanner from "./components/main/UnsavedChangesBanner";
import CustomPagination from "@/components/applications/common/CustomPagination";

const CorrelationRulesContent = ({ identityType }: CorrelationRulesProps) => {
  const { selectedIdentityType } = useIdentityMappingState();
  const correlationRulesData = useCorrelationRules(
    identityType,
    selectedIdentityType?.schemaId
  );
  const {
    rules,
    isTestRunning,
    isSaving,
    hasUnsavedChanges,
    addRule,
    testRules,
    saveRules,
    discardChanges,
    activeRulesCount,
    validRulesCount,
    invalidRulesCount,
  } = correlationRulesData;

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(5);

  const totalRules = rules.length;
  const totalPages = Math.ceil(totalRules / size);
  const paginatedRules = rules.slice(page * size, page * size + size);

  // When a rule is added, jump to the last page so the new card is immediately visible
  const handleAddRule = () => {
    addRule();
    const newLastPage = Math.max(0, Math.ceil((rules.length + 1) / size) - 1);
    setPage(newLastPage);
  };

  return (
    <CorrelationRulesProvider value={correlationRulesData}>
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>
                Correlation Rules for {identityType} Identities
              </CardTitle>
              <CardDescription>
                Define how identities are correlated and matched across
                different source systems
              </CardDescription>
            </div>
            <CorrelationRulesToolbar
              isTestRunning={isTestRunning}
              isSaving={isSaving}
              hasUnsavedChanges={hasUnsavedChanges}
              onTestRules={testRules}
              onAddRule={handleAddRule}
              onSaveRules={saveRules}
            />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paginatedRules.map((rule) => (
                <CorrelationRuleCard
                  key={rule.id}
                  rule={rule}
                  identityType={identityType}
                />
              ))}
            </div>
          </CardContent>
          {totalRules > 0 && (
            <div className="sticky bottom-0 left-0 w-full bg-white z-10 border-t p-4 flex justify-center">
              <CustomPagination
                totalElements={totalRules}
                totalPages={totalPages}
                siblingCount={1}
                boundaryCount={1}
                useCallbackMode={true}
                page={page}
                size={size}
                onPageChange={(newPage) => setPage(newPage)}
                onSizeChange={(newSize) => {
                  setSize(newSize);
                  setPage(0);
                }}
              />
            </div>
          )}
        </Card>

        {hasUnsavedChanges && (
          <UnsavedChangesBanner
            onSaveChanges={saveRules}
            onDiscardChanges={discardChanges}
            isLoading={isSaving}
          />
        )}

        <RulesSummary
          activeRulesCount={activeRulesCount}
          validRulesCount={validRulesCount}
          invalidRulesCount={invalidRulesCount}
        />
      </div>
    </CorrelationRulesProvider>
  );
};

export const CorrelationRules = ({ identityType }: CorrelationRulesProps) => {
  return <CorrelationRulesContent identityType={identityType} />;
};
