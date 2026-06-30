"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader } from "@/components/ui/Loader";
import { SyncAllModal } from "./SyncAllModal";

import { highlightMappingElement, saveSystemMappings } from "./utils/mappingUtils";
import { useMappingEngine } from "./hooks/useMappingEngine";
import { MappingProvider } from "./context/MappingContext";
import UnsavedChangesBanner from "./components/main/UnsavedChangesBanner";
import { SystemAttributeMapping } from "./types/index";
import { MappingToolbar, MappingCard } from "./components/mapping-engine";
import { toast } from "sonner";
import CustomPagination from "@/components/applications/common/CustomPagination";
import { useIdentityMappingContext } from "./context/IdentityMappingContext";
import { IdentitySchemaContext } from "./utils/identity-mapping-utils";
import { TRANSFORMATIONS } from "./data/constants";

interface MappingEngineContentProps {
  selectedIdentityType: IdentitySchemaContext;
}

const MappingEngineContent = ({
  selectedIdentityType,
}: MappingEngineContentProps) => {
  const mappingEngineData = useMappingEngine(selectedIdentityType.schemaId);
  const {
    mappings,
    systemMappings,
    sources,
    syncAllModal,
    setSyncAllModal,
    isLoadingSystemMappings,
    systemMappingsError,
    updateSystemMapping,
  } = mappingEngineData;
  console.log("systemMappings in MappingEngineContent:", systemMappings);

  const { setMappingStats } = useIdentityMappingContext();

  // Derive real stats from loaded data and push to context for KPI cards
  useEffect(() => {
    // Meaningful transformations — anything the user explicitly picked that isn't "no-op"
    const meaningfulTransformations = new Set(
      TRANSFORMATIONS.filter((t) => t !== "none")
    );

    const activeMappings = systemMappings.reduce(
      (acc, m) => acc + m.mappings.length,
      0
    );
    const transformationRules = systemMappings.reduce(
      (acc, m) =>
        acc +
        m.mappings.filter((r) =>
          meaningfulTransformations.has(r.transformation as typeof TRANSFORMATIONS[number])
        ).length,
      0
    );
    setMappingStats({
      activeMappings,
      transformationRules,
      dataSources: sources.length,
      conflictsResolved: 0,
    });
  }, [systemMappings, sources, setMappingStats]);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [unsavedMappingIds, setUnsavedMappingIds] = useState<string[]>([]);
  // Tracks exactly which sourceResourceIds the user actually edited this session.
  // On save, only those sources get a PUT request (and therefore an audit event).
  const changedSourceIdsRef = useRef<Set<string>>(new Set());
  // Backend UUIDs for attribute mapping rows that were removed locally.
  // On save, each is deleted individually so the audit trail shows DELETE (not UPDATE).
  const deletedMappingApiIdsRef = useRef<string[]>([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  const totalMappings = systemMappings.length;
  const totalPages = Math.ceil(totalMappings / size);
  const paginatedMappings = systemMappings.slice(
    page * size,
    page * size + size
  );

  const handleMappingChange = (
    mappingId: string,
    updates: Partial<SystemAttributeMapping>
  ) => {
    // When the user edits source-level data, record exactly which sourceResourceIds changed.
    // This is used on save to only PUT changed resources, preventing spurious audit events.
    if (updates.mappings !== undefined) {
      const oldMapping = systemMappings.find((m) => m.id === mappingId);
      const oldRows = oldMapping?.mappings ?? [];
      for (const newRow of updates.mappings) {
        if (!newRow.resourceId) continue;
        // Match by backend id when available, otherwise fall back to resourceId+attribute pair.
        const oldRow = newRow.id
          ? oldRows.find((r) => r.id === newRow.id)
          : oldRows.find(
              (r) =>
                r.resourceId === newRow.resourceId &&
                r.sourceAttributeName === newRow.sourceAttributeName
            );
        if (
          !oldRow ||
          oldRow.sourceAttributeName !== newRow.sourceAttributeName ||
          oldRow.transformation !== newRow.transformation ||
          JSON.stringify(oldRow.script ?? null) !== JSON.stringify(newRow.script ?? null)
        ) {
          changedSourceIdsRef.current.add(newRow.resourceId);
        }
      }
      // Detect removed source rows by matching on backend id (if present) or
      // resourceId+sourceAttributeName pair. This correctly handles the case where
      // multiple rows share the same resourceId (e.g. two mappings from the same source).
      for (const oldRow of oldRows) {
        const stillPresent = oldRow.id
          ? updates.mappings.some((r) => r.id === oldRow.id)
          : updates.mappings.some(
              (r) =>
                r.resourceId === oldRow.resourceId &&
                r.sourceAttributeName === oldRow.sourceAttributeName
            );

        if (!stillPresent) {
          const remainingRows = updates.mappings.filter(
            (r) => r.resourceId === oldRow.resourceId
          ).length;

          if (remainingRows > 0 && oldRow.resourceId) {
            // Other rows from this source still remain.
            // A PUT with the updated (reduced) list will implicitly remove this row
            // from the backend — no individual DELETE needed (and calling both would
            // cause the DELETE to fail after the PUT overwrites the list).
            changedSourceIdsRef.current.add(oldRow.resourceId);
          } else if (remainingRows === 0) {
            if (oldRow.id) {
              // Last row for this source AND we have a backend UUID.
              // Call individual DELETE so the audit trail shows a DELETE event (not UPDATE).
              // Do NOT add to changedSourceIds — DELETE alone is sufficient.
              deletedMappingApiIdsRef.current.push(oldRow.id);
            } else if (oldRow.resourceId) {
              // Last row for this source but no backend UUID (old data pre-dating UUIDs,
              // or a row that was never persisted). Fall back to a PUT with an empty
              // attributeMappings list so the backend actually clears the entry.
              changedSourceIdsRef.current.add(oldRow.resourceId);
            }
          }
        }
      }
    }

    setUnsavedChanges(true);
    setUnsavedMappingIds((prev) =>
      prev.includes(mappingId) ? prev : [...prev, mappingId]
    );
    updateSystemMapping(mappingId, updates);
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      // Call individual DELETE for any removed attribute mapping rows before the bulk PUT.
      // This ensures the audit trail shows DELETE events (not UPDATE) for removed rows.
      for (const mappingApiId of deletedMappingApiIdsRef.current) {
        await fetch(
          `/api/identity/mapping/policies/${selectedIdentityType.schemaId}/attribute/mappings/${mappingApiId}`,
          { method: "DELETE" }
        );
      }
      deletedMappingApiIdsRef.current = [];

      // Only PUT the sources that the user actually edited — prevents one transformation
      // change from generating one audit event per source in the backend.
      await saveSystemMappings(selectedIdentityType.schemaId, systemMappings, changedSourceIdsRef.current);
      changedSourceIdsRef.current = new Set();
      setUnsavedChanges(false);
      setUnsavedMappingIds([]);
      toast.success("Attribute mapping configuration saved successfully.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error("Failed to save mappings", {
        description: message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscardChanges = () => {
    changedSourceIdsRef.current = new Set();
    deletedMappingApiIdsRef.current = [];
    setUnsavedChanges(false);
    setUnsavedMappingIds([]);
  };

  const handleHighlightMapping = (mappingId: string) => {
    highlightMappingElement(mappingId);
  };

  // Override removeSystemMapping so that deleting an entire card queues individual
  // backend DELETEs for ALL of its persisted source rows (rows that have an id from
  // the backend). Without this, the rows would become orphaned in the backend because
  // the bulk PUT is skipped for sources not in changedSourceIdsRef.
  const handleRemoveSystemMapping = (
    id: string,
    onConfirm?: () => void
  ) => {
    const card = systemMappings.find((m) => m.id === id);
    if (!card) return;

    const wrappedConfirm = () => {
      // Queue each persisted source row for individual DELETE on next save.
      for (const row of card.mappings) {
        if (row.id) {
          deletedMappingApiIdsRef.current.push(row.id);
        }
      }
      // Mark as having unsaved changes so the banner/save button appears.
      setUnsavedChanges(true);
      onConfirm?.();
    };

    return mappingEngineData.removeSystemMapping?.(id, wrappedConfirm);
  };

  const contextValue = {
    ...mappingEngineData,
    removeSystemMapping: handleRemoveSystemMapping,
    selectedIdentityType,
    highlightMappingElement: handleHighlightMapping,
  };

  // Handle loading state
  if (isLoadingSystemMappings) {
    return (
      <MappingProvider value={contextValue}>
        <Card className="relative">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Attribute Mappings</CardTitle>
              <CardDescription>
                Configure how source attributes map to your{" "}
                {selectedIdentityType.schemaName} identity schema
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Loader />
          </CardContent>
        </Card>
      </MappingProvider>
    );
  }

  // Handle error state
  if (systemMappingsError) {
    return (
      <MappingProvider value={contextValue}>
        <Card className="relative">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Attribute Mappings</CardTitle>
              <CardDescription>
                Configure how source attributes map to your{" "}
                {selectedIdentityType.schemaName} identity schema
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-full min-h-[400px]">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="text-red-500">
                  <svg
                    className="h-12 w-12 mx-auto"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Error Loading Mappings
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {systemMappingsError}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </MappingProvider>
    );
  }

  return (
    <MappingProvider value={contextValue}>
      <div className="space-y-6">
        {/* Attribute Mappings */}
        <Card className="relative">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Attribute Mappings</CardTitle>
              <CardDescription>
                Configure how source attributes map to your{" "}
                {selectedIdentityType.schemaName} identity schema
              </CardDescription>
            </div>
            <MappingToolbar />
          </CardHeader>
          <CardContent className="space-y-4 pb-20">
            {paginatedMappings.map((mapping, index) => (
              <MappingCard
                key={mapping.id || `mapping-${index}`}
                mapping={mapping}
                onMappingChange={handleMappingChange}
                hasUnsavedChanges={unsavedMappingIds.includes(mapping.id)}
              />
            ))}
          </CardContent>
          {totalMappings > 0 && (
            <div className="sticky bottom-0 left-0 w-full bg-white z-10 border-t p-4 flex justify-center">
              <CustomPagination
                totalElements={totalMappings}
                totalPages={totalPages}
                siblingCount={1}
                boundaryCount={1}
                useCallbackMode={true}
                page={page}
                size={size}
                onPageChange={setPage}
                onSizeChange={(newSize) => {
                  setSize(newSize);
                  setPage(0);
                }}
              />
            </div>
          )}
        </Card>

        {/* Unsaved Changes Banner */}
        {unsavedChanges && (
          <UnsavedChangesBanner
            onSaveChanges={handleSaveChanges}
            onDiscardChanges={handleDiscardChanges}
            isLoading={isSaving}
            isSaveDisabled={systemMappings.some(
              (mapping) =>
                !mapping.systemAttributeName || mapping.mappings.length === 0
            )}
          />
        )}

        {/* Sync All Modal */}
        <SyncAllModal
          isOpen={syncAllModal}
          onClose={() => setSyncAllModal(false)}
          identityType="employee"
          totalMappings={systemMappings.length}
        />
      </div>
    </MappingProvider>
  );
};

export const MappingEngine = () => {
  const { selectedIdentityType } = useIdentityMappingContext();

  if (!selectedIdentityType) {
    return (
      <div className="text-center text-gray-500 p-8">
        Please select an identity schema to continue.
      </div>
    );
  }

  return <MappingEngineContent selectedIdentityType={selectedIdentityType} />;
};
