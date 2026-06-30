"use client"


import React from 'react';
import { MonitoringContent } from '@/components/monitoring/MonitoringContent';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const MonitoringPage = () => {
  useDocumentTitle('Monitoring');
  return <MonitoringContent />;
};

export default MonitoringPage;

