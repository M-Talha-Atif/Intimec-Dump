import React, { useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus } from "lucide-react";
import { useCreateRoleContext } from "../contexts/CreateRoleContext";

export const TagsSection: React.FC = () => {
  const { selectedTags, toggleTag } = useCreateRoleContext();
  const [editingTag, setEditingTag] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState<string>("");
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [error, setError] = useState<string | null>(null);
  const firstSubmit = useRef<boolean>(false);

  function handleEnableInput() {
    firstSubmit.current = false;
    setEditingTag(true);
    setError(null);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  }

  function handleHideInput() {
    firstSubmit.current = false;
    setEditingTag(false);
    setInputValue("");
    setTimeout(() => {
      buttonRef.current?.focus();
    }, 0);
  }

  function addTag(tag: string) {
    firstSubmit.current = true;
    tag = tag.trim();
    if (tag.length === 0) {
      setError("Tag cannot be empty");
      return;
    }
    if (selectedTags.some((val) => val.toLowerCase() === tag.toLowerCase())) {
      setError("Tag already exists");
      return;
    }
    toggleTag(tag);
    handleHideInput();
  }

  const handleRemoveTag = (tagToRemove: string) => {
    toggleTag(tagToRemove);
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Tags</Label>
      <p className="text-xs text-muted-foreground">
        Add tags to categorize and organize this role
      </p>
      <div className="flex flex-wrap gap-2 mt-2">
        {selectedTags.map((tag, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="flex items-center space-x-1"
          >
            <span>{tag}</span>
            <button onClick={() => handleRemoveTag(tag)}>
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}

        {/* Badge Editor for adding new tags */}
        {!editingTag && (
          <Badge asChild variant="outline" className="select-none w-fit">
            <Button
              variant="ghost"
              className="!h-5.5 !text-xs"
              onClick={handleEnableInput}
              ref={buttonRef}
            >
              <span className="w-full flex !text-xs flex-row items-center gap-1">
                <Plus className="w-4 h-4" />
                Add a category
              </span>
            </Button>
          </Badge>
        )}

        {editingTag && (
          <Badge variant="secondary" className="w-fit !p-0 !h-5.5 relative">
            <Input
              ref={inputRef}
              type="text"
              className="!text-xs !h-5.5 !w-full !px-2 rounded-full shadow-none"
              maxLength={20}
              value={inputValue}
              onChange={(e) => {
                const value = e.target.value.trim();
                setInputValue(value);
                if (!firstSubmit.current) return;
                if (value.length === 0) {
                  setError("Tag cannot be empty");
                } else if (
                  selectedTags.some(
                    (val) => val.toLowerCase() === value.toLowerCase()
                  )
                ) {
                  setError("Tag already exists");
                } else {
                  setError(null);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  addTag(inputValue);
                }
              }}
              onBlur={(e) => {
                // Prevent blur from closing the input if the user clicks on the add tag button
                if (e.relatedTarget?.id === "add-tag-button") return;
                handleHideInput();
              }}
              placeholder="Add custom tag"
            />
            <Button
              size="icon"
              variant="ghost"
              className="absolute w-4 h-4 rounded-full hover:bg-black/5 right-1"
              id="add-tag-button"
              onClick={(e) => {
                e.preventDefault();
                addTag(inputValue);
              }}
            >
              <Plus />
            </Button>
            {error && (
              <span className="absolute inline-block text-sm font-normal text-red-600 translate-x-4 -translate-y-1/2 whitespace-nowrap left-full top-1/2 w-fit">
                {error}
              </span>
            )}
          </Badge>
        )}
      </div>
    </div>
  );
};
