import { useImportApplicationContext } from "@/contexts/ImportApplicationContext";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";

export default function FormSteps() {
  const { steps, step: currentStep } = useImportApplicationContext();
  const t = useTranslations("application.import-modal");

  const currentIndex = steps.indexOf(currentStep);

  return (
    <div className="flex flex-row px-4 py-6 items-center gap-4">
      {steps.map((step, i) => {
        const isCurrent = i === currentIndex;
        const isDone = i < currentIndex;

        return (
          <React.Fragment key={step}>
            <div
              className={cn(
                "flex items-center gap-2 p-2 rounded-md shrink-0",
                isCurrent
                  ? "text-primary bg-primary/10"
                  : isDone
                    ? "bg-green-600/10 text-green-600"
                    : "text-muted-foreground",
              )}
            >
              <div
                className={cn(
                  "size-8 rounded-full flex items-center justify-center shrink-0",
                  isCurrent
                    ? "bg-primary text-white"
                    : isDone
                      ? "bg-green-600 text-white"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {isDone ? <Check className="w-5 h-5" /> : i + 1}
              </div>

              <p className="font-semibold">{t(`${step}.label`)}</p>
            </div>

            {i < steps.length - 1 && <div className="flex-1 h-px bg-border" />}
          </React.Fragment>
        );
      })}
    </div>
  );
}
