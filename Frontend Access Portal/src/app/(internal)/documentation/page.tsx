"use client"
import { useState } from 'react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { BookOpen } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import DocumentationSidebar from '@/components/documentation/DocumentationSidebar';
import DocumentationContent from '@/components/documentation/DocumentationContent';

const DocumentationPage = () => {
  useDocumentTitle('Documentation');
  const [activeTopicId, setActiveTopicId] = useState('platform-overview');

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="p-4 sm:p-6 lg:p-8 pb-4">
        <PageHeader
          title="Technical Documentation"
          description="Comprehensive platform documentation covering architecture, modules, configuration, and best practices"
          icon={<BookOpen className="h-5 w-5 text-primary" />}
        />
      </div>
      <div className="flex-1 flex overflow-hidden">
        <DocumentationSidebar
          activeTopicId={activeTopicId}
          onTopicSelect={setActiveTopicId}
        />
        <DocumentationContent activeTopicId={activeTopicId} />
      </div>
    </div>
  );
};

export default DocumentationPage;
