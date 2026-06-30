
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, Users, Star, Tag, Unlink, 
  Info, Clock, Shield 
} from 'lucide-react';
import { TemplateMetadata } from '@/types/workflow';
import { useToast } from '@/hooks/use-toast';

interface TemplateMetadataBannerProps {
  metadata: TemplateMetadata;
  onDisconnectFromTemplate: () => void;
}

export const TemplateMetadataBanner: React.FC<TemplateMetadataBannerProps> = ({
  metadata,
  onDisconnectFromTemplate
}) => {
  const { toast } = useToast();

  const handleDisconnect = () => {
    onDisconnectFromTemplate();
    toast({
      title: "Template Disconnected",
      description: "This workflow is now independent from the original template",
    });
  };

  if (!metadata.isConnectedToTemplate) {
    return null;
  }

  return (
    <Card className="mb-4 border-blue-200 bg-blue-50">
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-blue-900">{metadata.name}</span>
                <Badge variant="secondary">v{metadata.version}</Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-blue-700 mt-1">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {metadata.usageCount} uses
                </span>
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  Template Source
                </span>
              </div>
            </div>
          </div>

          <Separator orientation="vertical" className="h-8" />

          <div className="flex flex-wrap gap-1">
            {metadata.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                <Tag className="h-2 w-2 mr-1" />
                {tag}
              </Badge>
            ))}
            {metadata.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{metadata.tags.length - 3}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
