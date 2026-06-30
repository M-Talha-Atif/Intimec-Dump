import { ReviewType } from '../hooks/useReviewLauncher';
import { format } from 'date-fns';

interface ReviewSummaryProps {
  selectedUnitsCount: number;
  reviewType: ReviewType;
  dueDate: Date | undefined;
  escalationDays: string;
  notifyReviewers: boolean;
}

export function ReviewSummary({
  selectedUnitsCount,
  reviewType,
  dueDate,
  escalationDays,
  notifyReviewers,
}: ReviewSummaryProps) {
  return (
    <div className="bg-muted p-4 rounded-lg space-y-2">
      <h4 className="font-medium">Review Summary</h4>
      <div className="text-sm text-muted-foreground space-y-1">
        <p>• {selectedUnitsCount} organizational unit(s) in scope</p>
        <p>• Review type: {reviewType.replace('-', ' ')}</p>
        <p>• Due date: {dueDate ? format(dueDate, 'PPP') : 'Not set'}</p>
        <p>• Escalation: After {escalationDays} days</p>
        <p>• Reviewers will be {notifyReviewers ? 'immediately' : 'later'} notified</p>
      </div>
    </div>
  );
}
