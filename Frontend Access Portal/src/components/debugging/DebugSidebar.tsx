"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Info } from "lucide-react";

import { useDebugging } from "@/contexts/debugging-context";
import PinnedIssueItem from "./pinned-issue-item";
import { Loader } from "../ui/Loader";
import ResolvedIssueItem from "./ResolvedIssueItem";

export const DebugSidebar: React.FC = () => {
  const {
    pinnedItems,
    resolvedItems,
    setShowPinnedModal,
    setShowResolvedModal,
    pinnedLoading,
    resolvedLoading,
  } = useDebugging();

  const displayedPinnedItems = pinnedItems?.slice(0, 5);
  const displayedResolvedItems = resolvedItems?.slice(0, 5);

  const onShowAllPinned = () => setShowPinnedModal(true);
  const onShowAllResolved = () => {
    setShowResolvedModal(true);
  };

  // console.log("listed pinned items:", displayedPinnedItems);
  // console.log("listed resolved items:", displayedResolvedItems);

  if ((pinnedLoading && !pinnedItems) || (resolvedLoading && !resolvedItems))
    return <Loader />;

  return (
    <div className="space-y-0">
      {/* AI Insights */}
      <div>
        <h3 className="text-sm font-medium mb-3">AI Insights</h3>
        <div className="space-y-2">
          <div className="p-3 bg-blue-50/50 rounded-lg">
            <div className="flex items-center space-x-2 mb-1">
              <CheckCircle className="h-3 w-3 text-blue-500" />
              <span className="text-xs font-medium text-blue-800">
                Pattern Detected
              </span>
            </div>
            <p className="text-xs text-blue-700">
              Similar errors in Marketing OU
            </p>
          </div>
          <div className="p-3 bg-green-50/50 rounded-lg">
            <div className="flex items-center space-x-2 mb-1">
              <Info className="h-3 w-3 text-green-500" />
              <span className="text-xs font-medium text-green-800">
                Recommendation
              </span>
            </div>
            <p className="text-xs text-green-700">Increase timeout to 30s</p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 my-4" />

      {/* Pinned Issues */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium">Pinned Issues</h3>
          {displayedPinnedItems?.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onShowAllPinned}
              className="h-6 px-2 text-xs"
            >
              View All
            </Button>
          )}
        </div>

        {displayedPinnedItems?.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4">No pinned issues</p>
        ) : (
          <div className="space-y-2">
            {displayedPinnedItems.map((item) => (
              <PinnedIssueItem key={item.documentId} item={item} />
            ))}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 my-4" />

      {/* Resolved Issues */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium">Resolved Issues</h3>
          {displayedResolvedItems?.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onShowAllResolved}
              className="h-6 px-2 text-xs"
            >
              View All
            </Button>
          )}
        </div>

        {displayedResolvedItems?.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4">
            No resolved issues
          </p>
        ) : (
          <div className="space-y-2">
            {displayedResolvedItems.map((item) => (
              <ResolvedIssueItem key={item.documentId} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
