
import { useState } from 'react';
import { Task } from '../types';

interface UseTaskDetailPanelProps {
  task: Task;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onTaskAction: (taskId: string, action: string, additionalData?: any) => void;
}

export const useTaskDetailPanel = ({ task, onTaskAction }: UseTaskDetailPanelProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [newNote, setNewNote] = useState('');
  const [newTag, setNewTag] = useState('');
  
  // Mock AI insights state - in a real app this might come from an API
  const [aiInsights] = useState({
    failureReason: "Connection timeout to external API endpoint. The target system may be experiencing high load or maintenance.",
    resolutionTip: "Retry the task during off-peak hours (after 6 PM) or check with the application team for scheduled maintenance.",
    retryPreview: "Based on current system status, retry has 85% success probability."
  });

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    onTaskAction(task.id, 'addNote', { note: newNote });
    setNewNote('');
  };

  const handleAddTag = () => {
    if (!newTag.trim()) return;
    onTaskAction(task.id, 'addTag', { tag: newTag });
    setNewTag('');
  };

  return {
    activeTab,
    setActiveTab,
    newNote,
    setNewNote,
    newTag,
    setNewTag,
    aiInsights,
    handleAddNote,
    handleAddTag
  };
};
