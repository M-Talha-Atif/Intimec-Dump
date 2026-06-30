import React from "react";
import { ScopeCard } from "./ScopeCard";
import type { DelegatedScope } from "@/lib/delegation/bridge/cards-tree-bridge";

interface ScopeGridProps {
  scopes: DelegatedScope[];
  onLinkScope: (scope: DelegatedScope) => void;
  onOpenInTree: (scopeId: string) => void;
  onEditScope: (scope: DelegatedScope) => void;
  onViewDetails: (scope: DelegatedScope) => void;
}

export const ScopeGrid: React.FC<ScopeGridProps> = ({
  scopes,
  onLinkScope,
  onOpenInTree,
  onEditScope,
  onViewDetails,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {scopes.map((scope) => (
        <ScopeCard
          key={scope.id}
          scope={scope}
          onLinkScope={onLinkScope}
          onOpenInTree={onOpenInTree}
          onEditScope={onEditScope}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
};
