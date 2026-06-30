
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { type User } from '@/data/mock-users';
import { getIdentityProfile } from '@/data/mock-identity-profiles';

type IdentityDetailContextType = {
  selectedUser: User | null;
  setSelectedUser: (user: User | null) => void;
  regenerateSummary: () => Promise<void>;
  isRegeneratingSummary: boolean;
};

const IdentityDetailContext = createContext<IdentityDetailContextType | undefined>(undefined);

export const IdentityDetailProvider = ({ children }: { children: ReactNode }) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isRegeneratingSummary, setIsRegeneratingSummary] = useState(false);

  const regenerateSummary = async () => {
    if (!selectedUser) return;
    
    setIsRegeneratingSummary(true);
    try {
      // Mock API call to regenerate summary
      console.log('Regenerating summary for:', selectedUser.name);
      
      // Get enhanced profile data if available
      const profile = getIdentityProfile(selectedUser.id);
      
      // Include full identity context: accounts, access, risk data, and AI insights
      const summaryData = {
        identityId: selectedUser.id,
        accounts: profile?.accounts || selectedUser.accounts || [],
        access: profile?.access || selectedUser.access || [],
        riskFactors: selectedUser.riskFactors || [],
        activity: profile?.activity || selectedUser.activity || [],
        riskEvents: profile?.riskEvents || [],
        aiInsights: profile?.aiInsights || [],
        policies: profile?.policies || []
      };
      
      // Simulate API call with realistic processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, this would update the user's AI analysis
      console.log('Summary regenerated with enhanced data:', summaryData);
      
      // Mock success response
      console.log('✅ AI Summary regenerated successfully with', Object.keys(summaryData).length, 'data sources');
      
    } catch (error) {
      console.error('Failed to regenerate summary:', error);
    } finally {
      setIsRegeneratingSummary(false);
    }
  };

  return (
    <IdentityDetailContext.Provider value={{ 
      selectedUser, 
      setSelectedUser, 
      regenerateSummary,
      isRegeneratingSummary 
    }}>
      {children}
    </IdentityDetailContext.Provider>
  );
};

export const useIdentityDetail = () => {
  const context = useContext(IdentityDetailContext);
  // Return a dummy implementation if not within a provider to prevent crashes on other pages.
  if (context === undefined) {
    return { 
      selectedUser: null, 
      setSelectedUser: (_user: User | null) => {},
      regenerateSummary: async () => {},
      isRegeneratingSummary: false
    };
  }
  return context;
};
