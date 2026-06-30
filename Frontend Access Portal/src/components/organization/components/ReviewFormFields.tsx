import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ReviewType } from '../hooks/useReviewLauncher';

interface ReviewFormFieldsProps {
  reviewName: string;
  onReviewNameChange: (v: string) => void;
  description: string;
  onDescriptionChange: (v: string) => void;
  reviewType: ReviewType;
  onReviewTypeChange: (v: ReviewType) => void;
  dueDate: Date | undefined;
  onDueDateChange: (v: Date | undefined) => void;
  escalationDays: string;
  onEscalationDaysChange: (v: string) => void;
}

export function ReviewFormFields({
  reviewName,
  onReviewNameChange,
  description,
  onDescriptionChange,
  reviewType,
  onReviewTypeChange,
  dueDate,
  onDueDateChange,
  escalationDays,
  onEscalationDaysChange,
}: ReviewFormFieldsProps) {
  return (
    <>
      {/* Review Name */}
      <div className="space-y-3">
        <Label htmlFor="review-name">Review Name *</Label>
        <Input
          id="review-name"
          placeholder="Q1 2024 User Access Review"
          value={reviewName}
          onChange={(e) => onReviewNameChange(e.target.value)}
        />
      </div>

      {/* Description */}
      <div className="space-y-3">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Quarterly review of user access rights across selected organizational units..."
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={3}
        />
      </div>

      {/* Review Type */}
      <div className="space-y-3">
        <Label>Review Type</Label>
        <Select value={reviewType} onValueChange={(v: any) => onReviewTypeChange(v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user-access">User Access Review</SelectItem>
            <SelectItem value="role-review">Role Review</SelectItem>
            <SelectItem value="compliance">Compliance Certification</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Due Date */}
        <div className="space-y-3">
          <Label>Due Date *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dueDate ? format(dueDate, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dueDate}
                onSelect={onDueDateChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Escalation */}
        <div className="space-y-3">
          <Label htmlFor="escalation">Escalation Period (days)</Label>
          <Input
            id="escalation"
            type="number"
            min="1"
            value={escalationDays}
            onChange={(e) => onEscalationDaysChange(e.target.value)}
          />
        </div>
      </div>

      {/* Reviewer Selection */}
      <div className="space-y-3">
        <Label>Reviewers</Label>
        <Select defaultValue="managers">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="managers">Direct Managers</SelectItem>
            <SelectItem value="unit-heads">Unit Heads</SelectItem>
            <SelectItem value="delegates">Assigned Delegates</SelectItem>
            <SelectItem value="custom">Custom Selection</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
