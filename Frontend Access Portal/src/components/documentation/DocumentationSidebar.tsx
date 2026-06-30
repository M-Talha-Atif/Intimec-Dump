import { useState } from 'react';
import { ChevronRight, ChevronDown, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { documentationSections, type DocSection } from '@/data/documentation-content';

interface DocumentationSidebarProps {
  activeTopicId: string;
  onTopicSelect: (topicId: string) => void;
}

const DocumentationSidebar = ({ activeTopicId, onTopicSelect }: DocumentationSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<string[]>(
    documentationSections.map(s => s.id)
  );

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const filteredSections = searchQuery
    ? documentationSections
        .map(section => ({
          ...section,
          topics: section.topics.filter(topic =>
            topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            topic.content.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()))
          )
        }))
        .filter(section => section.topics.length > 0)
    : documentationSections;

  return (
    <div className="w-[260px] flex-shrink-0 border-r border-border bg-card flex flex-col h-full overflow-hidden">
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documentation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <nav className="p-2 space-y-0.5">
          {filteredSections.map((section) => (
            <SectionItem
              key={section.id}
              section={section}
              isExpanded={expandedSections.includes(section.id)}
              activeTopicId={activeTopicId}
              onToggle={() => toggleSection(section.id)}
              onTopicSelect={onTopicSelect}
            />
          ))}
        </nav>
      </ScrollArea>
    </div>
  );
};

interface SectionItemProps {
  section: DocSection;
  isExpanded: boolean;
  activeTopicId: string;
  onToggle: () => void;
  onTopicSelect: (topicId: string) => void;
}

const SectionItem = ({ section, isExpanded, activeTopicId, onToggle, onTopicSelect }: SectionItemProps) => (
  <div>
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-2 px-2 py-1.5 text-sm font-semibold text-foreground hover:bg-muted/50 rounded-md transition-colors"
    >
      {isExpanded ? (
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      ) : (
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
      )}
      <span>{section.title}</span>
    </button>
    {isExpanded && (
      <div className="ml-4 space-y-0.5 mt-0.5">
        {section.topics.map((topic) => (
          <button
            key={topic.id}
            onClick={() => onTopicSelect(topic.id)}
            className={cn(
              'w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors',
              activeTopicId === topic.id
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
            )}
          >
            {topic.title}
          </button>
        ))}
      </div>
    )}
  </div>
);

export default DocumentationSidebar;
