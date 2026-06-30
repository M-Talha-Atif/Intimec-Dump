import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { clsx } from "clsx";

export default function BadgeEditor({
  complianceTags,
  setComplianceTags,
  placeholder = "Add a tag",
  maxLength = 20,
  className = "",
}: {
  complianceTags: string[] | undefined;
  setComplianceTags: React.Dispatch<React.SetStateAction<string[]>>;
  placeholder?: string;
  maxLength?: number;
  className?: string;
}) {
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
    tag = tag.toUpperCase().trim();
    if (tag.length === 0) {
      setError("Tag cannot be empty");
      return;
    }
    if (complianceTags?.some((val) => val.toUpperCase() === tag)) {
      setError("Tag already exists");
      return;
    }
    setComplianceTags([...(complianceTags || []), tag]);
    handleHideInput();
  }

  return (
    <>
      {!editingTag && (
        <Badge
          asChild
          variant="outline"
          className={clsx("select-none w-50", className)}
        >
          <Button
            variant="ghost"
            className="!h-5.5 !text-xs"
            onClick={handleEnableInput}
            ref={buttonRef}
          >
            <span className="w-full flex !text-xs flex-row items-center gap-1">
              <Plus className="w-4 h-4" />
              {placeholder}
            </span>
          </Button>
        </Badge>
      )}
      {editingTag && (
        <Badge
          variant="secondary"
          className={clsx("w-50 !p-0 !h-5.5 relative", className)}
        >
          <Input
            ref={inputRef}
            type="text"
            className="!text-xs !h-5.5 !w-full !px-2 rounded-full shadow-none uppercase"
            maxLength={maxLength}
            value={inputValue}
            onChange={(e) => {
              const value = e.target.value.trim();
              if (/[^a-zA-Z0-9]/.test(value)) return;
              setInputValue(value);
              if (!firstSubmit.current) return;
              if (value.length === 0) {
                setError("Tag cannot be empty");
              } else if (
                complianceTags?.some(
                  (val) => val.toUpperCase() === value.toUpperCase()
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
            <span className="absolute inline-block text-sm font-normal text-red-600 translate-x-4 -translate-y-1/2 whitespace-nowrap left-full top-1/2 w-fit ">
              {error}
            </span>
          )}
        </Badge>
      )}
    </>
  );
}
