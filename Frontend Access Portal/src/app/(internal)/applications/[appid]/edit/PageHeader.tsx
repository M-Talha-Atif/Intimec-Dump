"use client";
import { useAddApplicationContext } from "@/contexts/AddApplicationContext";
import React from "react";

export default function PageHeader() {
  const { finalFormData } = useAddApplicationContext();
  return (
    <h1 className="mx-8 mt-8 mb-4 text-3xl font-bold">
      Edit Application
      {finalFormData?.details?.name ? ` - ${finalFormData.details.name}` : ""}
    </h1>
  );
}
