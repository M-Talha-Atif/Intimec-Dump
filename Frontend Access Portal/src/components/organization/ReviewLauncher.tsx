import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { UserCheck } from 'lucide-react';
import { OrgNodeData } from '@/types/organization';
import { useReviewLauncher } from './hooks/useReviewLauncher';
import { ReviewSelectedUnits } from './components/ReviewSelectedUnits';
import { ReviewFormFields } from './components/ReviewFormFields';
import { ReviewNotificationOptions } from './components/ReviewNotificationOptions';
import { ReviewSummary } from './components/ReviewSummary';
import { ReviewActions } from './components/ReviewActions';

interface ReviewLauncherProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUnits: OrgNodeData[];
}

export function ReviewLauncher({ open, onOpenChange, selectedUnits }: ReviewLauncherProps) {
  const {
    reviewName, setReviewName,
    description, setDescription,
    reviewType, setReviewType,
    dueDate, setDueDate,
    includeSubUnits, setIncludeSubUnits,
    notifyReviewers, setNotifyReviewers,
    escalationDays, setEscalationDays,
    handleLaunch,
  } = useReviewLauncher(selectedUnits, onOpenChange);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="overflow-y-auto p-6">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            Launch Access Review
          </SheetTitle>
          <SheetDescription>
            Configure and launch an access review campaign for selected organizational units
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-4 py-2">
          <ReviewSelectedUnits
            selectedUnits={selectedUnits}
            includeSubUnits={includeSubUnits}
            onIncludeSubUnitsChange={setIncludeSubUnits}
          />

          <ReviewFormFields
            reviewName={reviewName}
            onReviewNameChange={setReviewName}
            description={description}
            onDescriptionChange={setDescription}
            reviewType={reviewType}
            onReviewTypeChange={setReviewType}
            dueDate={dueDate}
            onDueDateChange={setDueDate}
            escalationDays={escalationDays}
            onEscalationDaysChange={setEscalationDays}
          />

          <ReviewNotificationOptions
            notifyReviewers={notifyReviewers}
            onNotifyReviewersChange={setNotifyReviewers}
          />

          <ReviewSummary
            selectedUnitsCount={selectedUnits.length}
            reviewType={reviewType}
            dueDate={dueDate}
            escalationDays={escalationDays}
            notifyReviewers={notifyReviewers}
          />
        </div>

        <SheetFooter>
          <ReviewActions
            onCancel={() => onOpenChange(false)}
            onLaunch={handleLaunch}
          />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
