import { useState } from 'react';
import { OrgNodeData } from '@/types/organization';
import { useToast } from '@/hooks/use-toast';

export type ReviewType = 'user-access' | 'role-review' | 'compliance';

export function useReviewLauncher(
  selectedUnits: OrgNodeData[],
  onOpenChange: (open: boolean) => void,
) {
  const { toast } = useToast();

  const [reviewName, setReviewName] = useState('');
  const [description, setDescription] = useState('');
  const [reviewType, setReviewType] = useState<ReviewType>('user-access');
  const [dueDate, setDueDate] = useState<Date>();
  const [includeSubUnits, setIncludeSubUnits] = useState(true);
  const [notifyReviewers, setNotifyReviewers] = useState(true);
  const [escalationDays, setEscalationDays] = useState('7');

  const handleLaunch = () => {
    if (!reviewName || !dueDate) {
      toast({
        title: 'Validation Error',
        description: 'Please provide a review name and due date',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Access Review Launched',
      description: `${reviewName} has been initiated for ${selectedUnits.length} unit(s)`,
    });

    onOpenChange(false);
  };

  return {
    reviewName,
    setReviewName,
    description,
    setDescription,
    reviewType,
    setReviewType,
    dueDate,
    setDueDate,
    includeSubUnits,
    setIncludeSubUnits,
    notifyReviewers,
    setNotifyReviewers,
    escalationDays,
    setEscalationDays,
    handleLaunch,
  };
}
