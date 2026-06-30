import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, CheckCircle, XCircle } from 'lucide-react';
import { templateService } from '@/services/accessReviewService';
import type { ReviewTemplate } from '@/types/accessReview';
import { toast } from 'sonner';

interface ReviewTemplatesProps {
  onApplyTemplate: (templateId: string) => void;
}

export const ReviewTemplates: React.FC<ReviewTemplatesProps> = ({ onApplyTemplate }) => {
  const [templates, setTemplates] = useState<ReviewTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await templateService.getTemplates();
      setTemplates(data);
    } catch (error) {
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const getDecisionIcon = (decision: string) => {
    switch (decision) {
      case 'approve': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'revoke': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  if (loading) {
    return <Card><CardContent className="p-8 text-center">Loading templates...</CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Review Templates
          </span>
          <Button size="sm" variant="outline">
            <Plus className="h-3 w-3 mr-1" />
            New Template
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {templates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No templates available
          </div>
        ) : (
          templates.map(template => (
            <Card key={template.id}>
              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getDecisionIcon(template.decision)}
                      <p className="font-medium text-sm">{template.name}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{template.description}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {template.decision}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Used {template.usageCount} times
                      </Badge>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      onApplyTemplate(template.id);
                      toast.success(`Template "${template.name}" applied`);
                    }}
                  >
                    Apply
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </CardContent>
    </Card>
  );
};
