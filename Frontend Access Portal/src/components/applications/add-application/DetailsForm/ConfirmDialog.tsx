import React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export default function ConfirmDialog({
  showDialog,
  setShowDialog,
  confirmChange,
  cancelChange,
  title,
  description,
}: {
  showDialog: boolean;
  setShowDialog: (open: boolean) => void;
  confirmChange: () => void;
  cancelChange: () => void;
  title: string;
  description: string;
}) {
  return (
    <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel type="button" onClick={cancelChange}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction type="button" onClick={confirmChange}>
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
