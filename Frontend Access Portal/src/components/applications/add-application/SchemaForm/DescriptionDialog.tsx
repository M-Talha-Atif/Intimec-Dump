import {  useState } from "react";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface DescriptionDialogProps
  extends Omit<React.ComponentProps<typeof Button>, "onChange" | "value"> {
  value: string | undefined;
  onSave: (value: string) => void;
}

export default function DescriptionDialog({
  value,
  onSave,
  children,
  ...props
}: DescriptionDialogProps) {
  const [textInputValue, setTextInputValue] = useState(value || "");
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          {...props}
          onClick={() => {
            setTextInputValue(value || "");
          }}
        >
          {children}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Description</DialogTitle>
          <DialogDescription>Edit Description here</DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Textarea
            value={textInputValue}
            placeholder="Enter description here"
            rows={8}
            maxLength={500}
            onChange={(e) => setTextInputValue(e.target.value)}
          />
          <div className="absolute right-2 bottom-2">
            <span className="text-sm text-muted-foreground">
              {textInputValue.length || 0} / 500
            </span>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              variant="default"
              onClick={() => {
                onSave(textInputValue);
              }}
            >
              Save
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
