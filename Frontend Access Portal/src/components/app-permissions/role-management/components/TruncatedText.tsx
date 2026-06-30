import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TruncatedTextProps {
  text: string;
  maxLength?: number;
  className?: string;
  tooltipClassName?: string;
}

/**
 * Component that displays text with truncation and shows full text in tooltip on hover
 * @param text - The text to display
 * @param maxLength - Maximum number of characters before truncation (default: 50)
 * @param className - Optional className for the text span
 * @param tooltipClassName - Optional className for the tooltip content
 */
export const TruncatedText: React.FC<TruncatedTextProps> = ({
  text,
  maxLength = 50,
  className = "",
  tooltipClassName = "",
}) => {
  const shouldTruncate = text.length > maxLength;
  const displayText = shouldTruncate
    ? `${text.substring(0, maxLength)}...`
    : text;

  if (!shouldTruncate) {
    return <span className={className}>{text}</span>;
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <span className={`cursor-help ${className}`}>{displayText}</span>
        </TooltipTrigger>
        <TooltipContent className={`max-w-md break-words text-base ${tooltipClassName}`}>
          <p>{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
