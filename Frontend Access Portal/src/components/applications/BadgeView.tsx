
import { useState } from 'react';
import { mockApplications, Application } from '@/data/mock-applications';
import ApplicationCard from './ApplicationCard';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const BadgeView = ({ onEdit, onViewDetails }: { onEdit: (application: Application) => void; onViewDetails: (application: Application) => void; }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredApplications = mockApplications.filter((app) =>
    app.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          type="search"
          placeholder="Search applications..."
          className="bg-background rounded-md pl-10 pr-4 py-2 w-full border"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="grid animate-fade-in grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredApplications.map((app) => (
          <ApplicationCard key={app.id} application={app} onEdit={onEdit} onViewDetails={onViewDetails} />
        ))}
      </div>
    </div>
  );
};

export default BadgeView;
