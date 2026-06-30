"use client";
import CorrelationFormRender from "./CorrelationFormRender";
import { LoaderCircle } from "lucide-react";
import { useAddApplicationContext } from "@/contexts/AddApplicationContext";

export default function CorrelationForm() {
  const {
    systemAttributes,
    accountAttributes,
    loadingSystemAttributes,
    currentFormStep,
  } = useAddApplicationContext();

  if (currentFormStep !== "correlation") return null; // Don't render if not on this step

  if (loadingSystemAttributes) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <LoaderCircle className="w-12 h-12 text-muted-foreground animate-spin" />
      </div>
    );
  }

  if (accountAttributes && systemAttributes) {
    return (
      <CorrelationFormRender
        accountAttributes={accountAttributes}
        systemAttributes={systemAttributes}
      />
    );
  }
}
