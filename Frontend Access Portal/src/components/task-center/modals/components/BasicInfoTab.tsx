import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScheduledTaskForm, taskTypes } from '../data/scheduledTaskData';

interface BasicInfoTabProps {
  formData: ScheduledTaskForm;
  updateFormData: (updates: Partial<ScheduledTaskForm>) => void;
}

export const BasicInfoTab: React.FC<BasicInfoTabProps> = ({ formData, updateFormData }) => {
  return (
    <div className="space-y-4 mt-4">
      <div>
        <Label htmlFor="task-name">Task Name *</Label>
        <Input
          id="task-name"
          value={formData.name}
          onChange={(e) => updateFormData({ name: e.target.value })}
          placeholder="e.g., Daily AD User Import"
        />
      </div>

      <div>
        <Label htmlFor="task-description">Description</Label>
        <Textarea
          id="task-description"
          value={formData.description}
          onChange={(e) => updateFormData({ description: e.target.value })}
          placeholder="Describe the purpose of this task..."
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="task-type">Task Type *</Label>
        <Select value={formData.type} onValueChange={(value) => updateFormData({ type: value })}>
          <SelectTrigger id="task-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {taskTypes.map(type => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="target-application">Target Application</Label>
        <Input
          id="target-application"
          value={formData.targetApplication}
          onChange={(e) => updateFormData({ targetApplication: e.target.value })}
          placeholder="e.g., Active Directory, SAP, Salesforce"
        />
      </div>

      <div>
        <Label htmlFor="target-identities">Target Identities (comma-separated)</Label>
        <Input
          id="target-identities"
          value={formData.targetIdentities}
          onChange={(e) => updateFormData({ targetIdentities: e.target.value })}
          placeholder="e.g., employees, contractors, all"
        />
      </div>
    </div>
  );
};
