"use client";
import React, { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { Eye, EyeOff, Search, X } from "lucide-react";
import { Button } from "./button";

function Input({
  className,
  type,
  parentClassName,
  ...props
}: React.ComponentProps<"input"> & { parentClassName?: string }) {
  const [showPassword, setShowPassword] = React.useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const inputType = type === "password" && showPassword ? "text" : type;
  return (
    <div className={cn("relative w-full", parentClassName)}>
      <input
        type={inputType}
        data-slot="input"
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          className,
        )}
        {...props}
      />
      {type === "password" && (
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2"
          onClick={togglePasswordVisibility}
        >
          {showPassword ? (
            <Eye className="h-4 w-4 text-muted-foreground" />
          ) : (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
      )}
    </div>
  );
}

function SearchInput({
  className,
  value,
  onChange,
  ...props
}: React.ComponentProps<"input">) {
  const [searchTerm, setSearchTerm] = useState(value || "");

  useEffect(() => {
    if (value !== undefined) {
      setSearchTerm(value);
    }
  }, [value]);

  function handleClearSearch() {
    setSearchTerm("");
    if (onChange) {
      onChange({
        target: { value: "" },
      } as React.ChangeEvent<HTMLInputElement>);
    }
  }
  return (
    <div className={cn("relative w-full", className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
      <Input
        {...props}
        className="pl-10"
        value={searchTerm}
        onChange={(e) => {
          if (onChange) onChange(e);
          setSearchTerm(e.target.value);
        }}
      />
      {searchTerm && (
        <div className="absolute right-0 top-0 bottom-0 aspect-square flex items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            onClick={handleClearSearch}
          >
            <X className="size-4 text-muted-foreground" />
          </Button>
        </div>
      )}
    </div>
  );
}

export { Input, SearchInput };
