"use client";
import SynchronizationPolicyFormRender from "./SynchronizationPolicyFormRender";
import { useAddApplicationContext } from "@/contexts/AddApplicationContext";

export default function SynchronizationPolicyForm() {
  const { currentFormStep, finalFormData } = useAddApplicationContext();

  if (currentFormStep !== "synchronizationPolicy") return null;

  return (
    <SynchronizationPolicyFormRender
      isAuthoritative={finalFormData.details?.isAuthoritative ?? false}
    />
  );
}
