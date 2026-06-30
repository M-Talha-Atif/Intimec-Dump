import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Wand2, ChevronLeft, ChevronRight } from 'lucide-react';

interface CustomReportWizardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: (config: any) => void;
}

export const CustomReportWizardModal = ({ open, onOpenChange, onComplete }: CustomReportWizardModalProps) => {
  const [step, setStep] = useState(1);
  const totalSteps = 6;

  const steps = [
    { title: 'Data Source', description: 'Select where to get data' },
    { title: 'Fields', description: 'Choose fields to include' },
    { title: 'Filters', description: 'Configure filter conditions' },
    { title: 'Sorting', description: 'Set sort order' },
    { title: 'Visualization', description: 'Choose chart types' },
    { title: 'Schedule', description: 'Configure delivery' },
  ];

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
    else {
      onComplete?.({});
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Wand2 className="h-5 w-5" />
            <span>Custom Report Wizard</span>
            <Badge>Step {step} of {totalSteps}</Badge>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Progress value={(step / totalSteps) * 100} />
          <div className="p-8 border rounded-lg text-center">
            <h3 className="text-lg font-semibold mb-2">{steps[step - 1].title}</h3>
            <p className="text-muted-foreground">{steps[step - 1].description}</p>
          </div>
        </div>
        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button onClick={handleNext}>
            {step === totalSteps ? 'Finish' : 'Next'}
            {step !== totalSteps && <ChevronRight className="h-4 w-4 ml-2" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
