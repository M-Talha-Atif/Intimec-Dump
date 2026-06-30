"use client";
import React, { useMemo } from "react";
import { useSchemaManagement } from "@/contexts/schema-management-context";
import { Loader } from "../ui/Loader";

export const EntitySidebar = React.memo(() => {
  const { state, setActiveEntity } = useSchemaManagement();

  // Memoize the entity list to prevent unnecessary re-renders
  const entityList = useMemo(() => {
    return state.entityTypes.map((entity) => (
      <button
        key={entity.id}
        onClick={() => setActiveEntity(entity.id)}
        className={`w-full text-left p-2 rounded text-sm transition-colors ${
          state.activeEntity === entity.id
            ? "bg-primary/10 text-primary"
            : "hover:bg-muted"
        }`}
      >
        {entity.name}
      </button>
    ));
  }, [state.entityTypes, state.activeEntity, setActiveEntity]);

  if (state.loadingStates.entities) return <Loader />;

  return (
    <div>
      <h3 className="text-sm font-medium text-foreground mb-3">Entities</h3>

      {state.entityTypes.length === 0 ? (
        <div className="text-sm text-muted-foreground">No entities found</div>
      ) : (
        <div className="space-y-2">
          {entityList}
        </div>
      )}
    </div>
  );
});

EntitySidebar.displayName = "EntitySidebar";