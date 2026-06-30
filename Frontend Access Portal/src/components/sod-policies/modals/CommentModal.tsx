
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { getRiskBadgeClass } from '@/utils/getRiskColor';
import { cn } from '@/lib/utils';

interface CommentModalProps {
  violation: any;
  open: boolean;
  onClose: () => void;
  onAddComment: (violationId: string, comment: string) => void;
}

export const CommentModal = ({ violation, open, onClose, onAddComment }: CommentModalProps) => {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!comment.trim()) { toast({ title: "Validation Error", description: "Please enter a comment", variant: "destructive" }); return; }
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    onAddComment(violation.id, comment);
    toast({ title: "Comment Added", description: `Comment has been added to violation ${violation.id}` });
    setIsSubmitting(false);
    onClose();
    setComment('');
  };

  if (!violation) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="flex flex-col p-0 h-full">
        <div className="flex flex-col h-full min-w-0">
          <div className="flex-shrink-0 px-6 py-4">
            <DialogHeader className="p-0">
              <DialogTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Add Comment - {violation.id}
              </DialogTitle>
              <DialogDescription>Add a comment or note to this SoD violation for audit tracking.</DialogDescription>
            </DialogHeader>
          </div>
          <div className="flex-1 min-h-0 px-6 pb-6 overflow-hidden">
            <ScrollArea className="h-full pr-2">
              <div className="space-y-6">
                <div className="p-3 bg-muted rounded border">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{violation.policy}</span>
                    <Badge className={cn(getRiskBadgeClass(violation.severity), "border text-xs")}>{violation.severity}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{violation.user}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comment">Comment</Label>
                  <Textarea id="comment" placeholder="Add your comment about this violation..." value={comment} onChange={(e) => setComment(e.target.value)} rows={4} />
                </div>

                <div className="flex justify-end space-x-3">
                  <Button variant="outline" onClick={onClose}>Cancel</Button>
                  <Button onClick={handleSubmit} disabled={isSubmitting || !comment.trim()}>
                    <Send className="h-4 w-4 mr-2" />{isSubmitting ? 'Adding...' : 'Add Comment'}
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
