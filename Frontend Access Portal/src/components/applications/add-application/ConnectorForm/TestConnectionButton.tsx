import { Button } from "@/components/ui/button";
import React from "react";

export default function TestConnectionButton({
  isMutating,
  onClick,
  connectionState,
  testError,
}: {
  isMutating: boolean;
  onClick: () => void;
  connectionState: { icon: React.ReactNode; label: string };
  testError: Error | null;
}) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        disabled={isMutating}
        type="button"
        onClick={onClick}
      >
        {connectionState.icon}
        {connectionState.label}
      </Button>
      <div className="flex flex-col items-start gap-2">
        {!!testError && (
          <div className="flex items-center text-destructive">
            {testError.message || "An error occurred while testing."}
          </div>
        )}
      </div>
    </div>
  );
}
