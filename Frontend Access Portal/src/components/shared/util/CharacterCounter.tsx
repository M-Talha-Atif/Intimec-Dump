import React from "react";

interface CharacterCounterProps {
  current: string;
  max?: number;
}

/**
 * Reusable character counter component.
 * Shows remaining characters with color-coded warnings.
 */
const CharacterCounter: React.FC<CharacterCounterProps> = ({ current, max = 256 }) => {
  const remaining = max - current.length;
  const isNearLimit = remaining <= 20;
  const isAtLimit = remaining < 0;

  return (
    <div
      className={`text-xs text-right mt-1 ${
        isAtLimit
          ? "text-destructive font-bold"
          : isNearLimit
            ? "text-amber-600"
            : "text-muted-foreground"
      }`}
    >
      {current.length}/{max} characters
      {remaining < 0 && ` (exceeded by ${Math.abs(remaining)})`}
    </div>
  );
};

export default CharacterCounter;