import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AIRiskCard } from "@/types/ai-analysis";
import React from "react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

export default function FeedbackDialog({
  showAIfeedbackDialog,
  setShowAIfeedbackDialog,
}: {
  showAIfeedbackDialog: AIRiskCard;
  setShowAIfeedbackDialog: React.Dispatch<
    React.SetStateAction<AIRiskCard | null>
  >;
}) {
  function handleSubmitFeedback() {
    // Implement feedback submission logic here
    toast("Feedback submitted successfully!");
    setShowAIfeedbackDialog(null);
  }

  return (
    <Dialog
      open={!!showAIfeedbackDialog}
      onOpenChange={(open) => {
        if (!open) {
          setShowAIfeedbackDialog(null);
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>AI Feedback</DialogTitle>
          <DialogDescription>
            Provide your feedback for the card{" "}
            <strong>{showAIfeedbackDialog.title}</strong>.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea placeholder="Enter your feedback here..." />
        </div>
        <DialogFooter>
          <Button
            variant="secondary"
            onClick={() => setShowAIfeedbackDialog(null)}
          >
            Close
          </Button>
          <Button onClick={handleSubmitFeedback}>Submit Feedback</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
