"use client"

import React from 'react';
import { RiskAnalyticsContent } from '@/components/risk-analytics/RiskAnalyticsContent';
import { RiskAnalyticsConfigProvider } from '@/contexts/RiskAnalyticsConfigContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const RiskAnalyticsPage = () => {
  useDocumentTitle('Risk Analytics');
  return (
    <RiskAnalyticsConfigProvider>
      <RiskAnalyticsContent />
    </RiskAnalyticsConfigProvider>
  );
};

export default RiskAnalyticsPage;
