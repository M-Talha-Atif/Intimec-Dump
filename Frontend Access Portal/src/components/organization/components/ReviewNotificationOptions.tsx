import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface ReviewNotificationOptionsProps {
  notifyReviewers: boolean;
  onNotifyReviewersChange: (value: boolean) => void;
}

export function ReviewNotificationOptions({
  notifyReviewers,
  onNotifyReviewersChange,
}: ReviewNotificationOptionsProps) {
  return (
    <div className="space-y-3">
      <Label>Notification Options</Label>
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="notify-reviewers"
            checked={notifyReviewers}
            onCheckedChange={(checked) => onNotifyReviewersChange(checked as boolean)}
          />
          <Label htmlFor="notify-reviewers" className="font-normal cursor-pointer">
            Send immediate notification to reviewers
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="reminder-emails" defaultChecked />
          <Label htmlFor="reminder-emails" className="font-normal cursor-pointer">
            Send reminder emails (weekly)
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="escalation-emails" defaultChecked />
          <Label htmlFor="escalation-emails" className="font-normal cursor-pointer">
            Send escalation emails to managers
          </Label>
        </div>
      </div>
    </div>
  );
}
