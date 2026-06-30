import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

interface ReviewActionsProps {
  onCancel: () => void;
  onLaunch: () => void;
}

export function ReviewActions({ onCancel, onLaunch }: ReviewActionsProps) {
  return (
    <div className="flex justify-end gap-3">
      <Button variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button onClick={onLaunch}>
        <Send className="w-4 h-4 mr-2" />
        Launch Review
      </Button>
    </div>
  );
}
