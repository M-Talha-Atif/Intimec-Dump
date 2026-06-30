import React, { useState } from "react";
import { ConnectorConfigurationProperty } from "@/types/add-application";
import { Input } from "@/components/ui/input";
import { ControllerRenderProps, FieldValues } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Code, X } from "lucide-react";
import DialogScriptEditor from "../common/DialogScriptEditor";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import FileOrStringInput from "./FileOrStringInput";

const JAVA_INT_MIN = -2147483648;
const JAVA_INT_MAX = 2147483647;

const JAVA_LONG_MIN = BigInt("-9223372036854775808");
const JAVA_LONG_MAX = BigInt("9223372036854775807");

export default function DynamicFormInput({
  type,
  confidential,
  field,
  isScript,
}: {
  type: ConnectorConfigurationProperty["type"];
  confidential?: ConnectorConfigurationProperty["confidential"];
  field: ControllerRenderProps<FieldValues, string>;
  isScript: boolean;
}) {
  const [inputValue, setInputValue] = useState<string>("");
  switch (type) {
    case "string":
      return (
        <>
          {isScript ? (
            <div className="flex flex-row gap-2">
              <Input type="text" {...field} />
              <DialogScriptEditor
                onSave={(value) => {
                  field.onChange(value.data);
                }}
                externalValue={{ lang: "typescript", data: field.value || "" }}
                variant="outline"
                size="icon"
              >
                <Code />
              </DialogScriptEditor>
            </div>
          ) : (
            <Input type={confidential ? "password" : "text"} {...field} />
          )}
        </>
      );
    case "char":
    case "byte[]":
      return (
        <Input
          type={confidential ? "password" : "text"}
          maxLength={type === "char" ? 1 : undefined}
          {...field}
        />
      );
    case "int":
      return (
        <Input
          type={confidential ? "password" : "text"}
          inputMode="numeric"
          pattern="-?[0-9]*"
          {...field}
          onChange={(e) => {
            const value = e.target.value;

            if (!/^-?\d*$/.test(value)) {
              // If the input is not a valid number, clear the field
              field.onChange(0);
              return;
            }
            if (value === "-" || value === "") {
              field.onChange(0); // Clear the field if empty
              return;
            }
            const num = parseInt(value, 10);
            if (num < JAVA_INT_MIN) field.onChange(JAVA_INT_MIN);
            else if (num > JAVA_INT_MAX) field.onChange(JAVA_INT_MAX);
            else field.onChange(num);
          }}
          max={JAVA_INT_MAX}
          min={JAVA_INT_MIN}
        />
      );
    case "long":
      return (
        <Input
          type={confidential ? "password" : "text"}
          inputMode="numeric"
          pattern="-?[0-9]*"
          {...field}
          onChange={(e) => {
            const value = e.target.value;

            if (!/^-?\d*$/.test(value)) {
              field.onChange(BigInt(0));
              return;
            }
            if (value === "-" || value === "") {
              field.onChange(BigInt(0));
              return;
            }

            const bigIntValue = BigInt(value);
            if (bigIntValue < JAVA_LONG_MIN) {
              field.onChange(JAVA_LONG_MIN);
            } else if (bigIntValue > JAVA_LONG_MAX) {
              field.onChange(JAVA_LONG_MAX);
            } else {
              field.onChange(bigIntValue);
            }
          }}
          max={JAVA_LONG_MAX.toString()}
          min={JAVA_LONG_MIN.toString()}
        />
      );
    case "boolean":
      return (
        <Checkbox
          checked={field.value}
          onCheckedChange={(checked) => field.onChange(checked === true)}
        />
      );
    case "File":
      return (
        <FileOrStringInput value={field.value} onChange={field.onChange} />
      );
    case "string[]":
      // render a list of elements with X to remove each element
      return (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Input
              type="text"
              {...field}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const newValue = [...(field.value || [])];
                  if (inputValue.trim() !== "") {
                    newValue.push(inputValue.trim());
                    field.onChange(newValue);
                    setInputValue(""); // Clear input after adding item
                  }
                }
              }}
            />
            <Button
              onClick={(e) => {
                e.preventDefault();
                const newValue = [...(field.value || [])];
                if (inputValue.trim() !== "") {
                  newValue.push(inputValue.trim());
                  field.onChange(newValue);
                  setInputValue(""); // Clear input after adding item
                }
              }}
            >
              Add Item
            </Button>
          </div>
          {field.value &&
            Array.isArray(field.value) &&
            field.value.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-2 rounded-md ps-2 border-1 border-input"
              >
                <ScrollArea className="relative w-full">
                  <code>{item}</code>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.preventDefault();
                    const newValue = [...(field.value || [])];
                    newValue.splice(index, 1);
                    field.onChange(newValue);
                  }}
                  className="text-destructive"
                >
                  <X />
                </Button>
              </div>
            ))}
        </div>
      );
    default:
      return null;
  }
}
