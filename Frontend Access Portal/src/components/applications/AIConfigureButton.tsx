
import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Zap } from 'lucide-react';
import { useAIAssistant } from '@/contexts/AIAssistantContext';

interface AIConfigureButtonProps {
  variant?: 'default' | 'outline';
  className?: string;
}

export const AIConfigureButton = ({ variant = 'default', className }: AIConfigureButtonProps) => {
  const { setIsAssistantOpen } = useAIAssistant();

  const handleConfigureClick = () => {
    // Open the AI Assistant panel
    setIsAssistantOpen(true);
    
    // Auto-trigger the configuration flow
    const configurationQuery = "I want to configure a new application connector. Please guide me through the setup process.";
    
    // Dispatch event to start configuration flow
    window.dispatchEvent(new CustomEvent('ai-configure-application', { 
      detail: { query: configurationQuery, type: 'connector-setup' } 
    }));
  };

  return (
    <Button 
      onClick={handleConfigureClick}
      variant={variant}
      className={className}
    >
      <Sparkles className="mr-2 h-4 w-4" />
      Ask AI to Configure Application
    </Button>
  );
};

export const AIQuickConfigureButton = () => {
  const { setIsAssistantOpen } = useAIAssistant();

  const handleQuickConfigure = () => {
    setIsAssistantOpen(true);
    
    const quickConfigQuery = "/configure application - Help me set up a new connector quickly";
    
    window.dispatchEvent(new CustomEvent('ai-configure-application', { 
      detail: { query: quickConfigQuery, type: 'quick-setup' } 
    }));
  };

  return (
    <Button variant="outline" size="sm" onClick={handleQuickConfigure} className="ml-2">
      <Zap className="h-4 w-4 mr-1" />
      Quick AI Setup
    </Button>
  );
};
