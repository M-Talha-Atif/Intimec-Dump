
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Plus } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface CreateTemplateModalProps {
  open: boolean;
  onClose: () => void;
  onCreateTemplate: (templateData: any) => void;
  editingTemplate?: any | null;
  onEditTemplate?: (template: any) => void;
}

export const CreateTemplateModal = ({ open, onClose, onCreateTemplate, editingTemplate, onEditTemplate }: CreateTemplateModalProps) => {
  const [templateName, setTemplateName] = useState('');
  const [description, setDescription] = useState('');
  const [framework, setFramework] = useState('');
  const [complexity, setComplexity] = useState('MEDIUM');
  const [category, setCategory] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [complianceFrameworks, setComplianceFrameworks] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const complianceFrameworkOptions = [
    'NIST',
    'ISO 27001',
    'SOC 2',
    'GDPR',
    'HIPAA',
    'PCI DSS',
    'SOX',
    'COBIT',
    'CIS Controls'
  ];
  const { toast } = useToast();

  // Load editing template data
  React.useEffect(() => {
    if (editingTemplate) {
      setTemplateName(editingTemplate.name || '');
      setDescription(editingTemplate.description || '');
      setFramework(editingTemplate.framework || '');
      // Ensure complexity is uppercase
      const complexity = editingTemplate.complexity?.toUpperCase() || 'MEDIUM';
      setComplexity(complexity as 'SIMPLE' | 'MEDIUM' | 'COMPLEX');
      setCategory(editingTemplate.category || '');
      setEstimatedTime(editingTemplate.estimatedTime || '');
      setTags(editingTemplate.tags || []);
      setComplianceFrameworks(editingTemplate.complianceFrameworks || []);
    } else {
      // Reset form
      setTemplateName('');
      setDescription('');
      setFramework('');
      setComplexity('MEDIUM');
      setCategory('');
      setEstimatedTime('');
      setTags([]);
      setComplianceFrameworks([]);
    }
  }, [editingTemplate, open]);

  const suggestedTags = [
    'onboarding', 'automation', 'SOX', 'NIST', 'ISO27001', 'certification',
    'provisioning', 'deprovisioning', 'approval', 'emergency', 'ai-powered',
    'high-risk', 'manager-approval', 'time-limited', 'contractors'
  ];

  const handleAddTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const toggleComplianceFramework = (framework: string) => {
    setComplianceFrameworks(prev => 
      prev.includes(framework)
        ? prev.filter(f => f !== framework)
        : [...prev, framework]
    );
  };

  const handleSubmit = async () => {
    if (!templateName || !description || !category || !complexity) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (name, description, category, complexity)",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    const templateData = {
      name: templateName,
      description,
      category,
      framework,
      complexity,
      estimatedTime,
      tags,
      complianceFrameworks,
      variables: {},
      prerequisites: [],
      // Only include isSystemTemplate when creating (not updating)
      ...(editingTemplate ? {} : { isSystemTemplate: false })
    };
    
    // If editing and onEditTemplate is provided, navigate to designer
    if (editingTemplate && onEditTemplate) {
      onEditTemplate({
        ...editingTemplate,
        ...templateData
      });
    } else {
      // For new templates, continue to designer
      onCreateTemplate(templateData);
    }
    
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingTemplate ? 'Edit Template' : 'Create Custom Template'}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Template Name */}
          <div className="space-y-2">
            <Label htmlFor="template-name">Template Name *</Label>
            <Input
              id="template-name"
              placeholder="Enter template name..."
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe your template..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="JOINER_MOVER_LEAVER">Joiner/Mover/Leaver</SelectItem>
                <SelectItem value="ACCESS_REQUEST">Access Request</SelectItem>
                <SelectItem value="CERTIFICATION">Certification</SelectItem>
                <SelectItem value="REVOCATION">Revocation</SelectItem>
                <SelectItem value="ROLE_MANAGEMENT">Role Management</SelectItem>
                <SelectItem value="PERMISSION_MANAGEMENT">Permission Management</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Framework & Complexity */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Framework</Label>
              <Input
                placeholder="e.g., NIST, ISO27001"
                value={framework}
                onChange={(e) => setFramework(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Complexity *</Label>
              <Select value={complexity} onValueChange={setComplexity}>
                <SelectTrigger>
                  <SelectValue placeholder="Select complexity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SIMPLE">Simple</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="COMPLEX">Complex</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Estimated Time */}
          <div className="space-y-2">
            <Label>Estimated Time</Label>
            <Input
              placeholder="e.g., 30-60 minutes"
              value={estimatedTime}
              onChange={(e) => setEstimatedTime(e.target.value)}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-red-500"
                    onClick={() => handleRemoveTag(tag)}
                  />
                </Badge>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Input
                placeholder="Add custom tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag(newTag)}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddTag(newTag)}
                disabled={!newTag}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-1 mt-2">
              {suggestedTags.filter(tag => !tags.includes(tag)).slice(0, 8).map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                  onClick={() => handleAddTag(tag)}
                >
                  + {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Compliance Frameworks */}
          <div className="space-y-3">
            <Label>Compliance Frameworks</Label>
            <p className="text-sm text-muted-foreground">Select applicable compliance frameworks</p>
            <div className="grid grid-cols-3 gap-3 p-4 border rounded-lg">
              {complianceFrameworkOptions.map(framework => (
                <div key={framework} className="flex items-center space-x-2">
                  <Checkbox
                    id={`template-framework-${framework}`}
                    checked={complianceFrameworks.includes(framework)}
                    onCheckedChange={() => toggleComplianceFramework(framework)}
                  />
                  <Label htmlFor={`template-framework-${framework}`} className="text-sm font-normal cursor-pointer">
                    {framework}
                  </Label>
                </div>
              ))}
            </div>
            {complianceFrameworks.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {complianceFrameworks.map(fw => (
                  <Badge key={fw} variant="secondary">
                    {fw}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || !templateName || !description || !framework || !complexity}
            >
              {isSubmitting ? 'Creating...' : 'Continue to Designer'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
