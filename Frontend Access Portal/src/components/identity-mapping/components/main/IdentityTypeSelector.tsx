"use client";
import React from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Database } from "lucide-react";
import { useIdentityMappingContext } from "../../context/IdentityMappingContext";

export const IdentityTypeSelector = () => {
  const {
    selectedIdentityType,
    setSelectedIdentityType,
    identitySchemaContexts,
  } = useIdentityMappingContext();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Database className="h-5 w-5 text-brand-teal" />
            <div>
              <CardTitle className="text-lg">Identity Type Context</CardTitle>
              <CardDescription>
                Select an identity schema to manage its specific attribute
                mappings
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Select
              value={selectedIdentityType?.schemaId || ""}
              onValueChange={(value) => {
                const schema = identitySchemaContexts.find(
                  (s) => s.schemaId === value
                );
                if (schema) {
                  setSelectedIdentityType(schema);
                }
              }}
            >
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {identitySchemaContexts.map((schema) => (
                  <SelectItem key={schema.schemaId} value={schema.schemaId}>
                    <div className="flex items-center space-x-2">
                      <span>{schema.schemaName}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};
