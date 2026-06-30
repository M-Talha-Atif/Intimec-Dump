"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useSchemaManagement } from "@/contexts/schema-management-context";

export function SchemaManagementHeader() {
  const { state, setSearchTerm } = useSchemaManagement();
  const hasEntities = state.entityTypes.length > 0;

  return (
  <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Schema Management
          </h1>
          <p className="text-muted-foreground">
            {hasEntities
              ? "Manage and monitor your identity schemas"
              : "Set up and configure your identity schemas"}
          </p>
        </div>
      </div>

  <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={
              hasEntities ? "Search schemas..." : "No schemas to search"
            }
            value={state.searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
            disabled={!hasEntities || state.loadingStates.entities}
          />
        </div>
      </div>
    </div>
  );
}
