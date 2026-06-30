"use client";
import {
  FinalFormData,
  useAddApplicationContext,
} from "@/contexts/AddApplicationContext";
import clsx from "clsx";
import { Check, ChevronRight } from "lucide-react";
import React from "react";

export default function FormStep({
  label,
  step,
  lastStep = false,
  stepNumber,
}: {
  label: string;
  step: keyof FinalFormData;
  description?: string;
  lastStep?: boolean;
  stepNumber: number;
  totalSteps?: number;
}) {
  const { currentFormStep, getStepIndex, goToStep, isStepReachable, highestStepReached } =
    useAddApplicationContext();
  const stepIndex = getStepIndex(step);
  const reachable = isStepReachable(step);
  const isActive = currentFormStep === step;
  const isCompleted = !isActive && highestStepReached > stepIndex;

  const handleClick = () => {
    if (reachable) goToStep(step);
  };

  return (
    <div className="flex items-center flex-1 min-w-0">
      {/* Step indicator */}
      <div
        className={clsx(
          "flex items-center gap-2.5 px-2 py-1.5 rounded-lg transition-all duration-200",
          isActive && "bg-primary/10",
          reachable ? "cursor-pointer group" : "cursor-not-allowed",
          reachable && !isActive && "hover:bg-muted",
        )}
        onClick={handleClick}
        role="button"
        tabIndex={reachable ? 0 : -1}
        onKeyDown={(e) => {
          if (reachable && (e.key === "Enter" || e.key === " ")) goToStep(step);
        }}
      >
        {/* Circle */}
        <div
          className={clsx(
            "flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all duration-200 shrink-0",
            isActive &&
              "bg-primary text-white shadow-lg ring-4 ring-primary/20",
            isCompleted && "bg-green-500 text-white shadow-sm",
            !isActive &&
              !isCompleted &&
              reachable &&
              "border-2 border-muted-foreground/30 text-muted-foreground group-hover:border-primary group-hover:text-primary",
            !isActive &&
              !isCompleted &&
              !reachable &&
              "border-2 border-muted-foreground/15 text-muted-foreground/30",
          )}
        >
          {isCompleted ? <Check className="w-4 h-4" /> : stepNumber + 1}
        </div>
        {/* Label */}
        <span
          className={clsx(
            "text-xs font-semibold leading-tight whitespace-nowrap transition-colors",
            isActive && "text-primary",
            isCompleted && "text-green-600 dark:text-green-400",
            !isActive &&
              !isCompleted &&
              reachable &&
              "text-foreground group-hover:text-primary",
            !isActive &&
              !isCompleted &&
              !reachable &&
              "text-muted-foreground/40",
          )}
        >
          {label}
        </span>
      </div>

      {/* Arrow connector */}
      {!lastStep && (
        <div className="flex items-center justify-center mx-0.5 shrink-0">
          <ChevronRight
            className={clsx(
              "w-4 h-4 transition-colors duration-300",
              isCompleted
                ? "text-green-500"
                : "text-muted-foreground/25",
            )}
          />
        </div>
      )}
    </div>
  );
}

/** Shows the description of the currently active step */
export function ActiveStepDescription({
  descriptions,
}: {
  descriptions: Record<string, string>;
}) {
  const { currentFormStep } = useAddApplicationContext();
  const desc = descriptions[currentFormStep];
  if (!desc) return null;
  return (
    <p className="text-xs text-muted-foreground mt-3 text-center">
      {desc}
    </p>
  );
}
