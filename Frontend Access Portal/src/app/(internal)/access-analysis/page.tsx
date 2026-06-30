"use client"

import { AccessAnalysisContent } from '@/components/access-analysis/AccessAnalysisContent';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const AccessAnalysisPage = () => {
  useDocumentTitle('Access Analysis');
  return <AccessAnalysisContent />;
};

export default AccessAnalysisPage;
