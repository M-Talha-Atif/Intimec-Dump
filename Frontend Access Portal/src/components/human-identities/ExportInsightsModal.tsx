
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Calendar,
  Users,
  Shield
} from 'lucide-react';

interface ExportOption {
  id: string;
  label: string;
  description: string;
  format: 'pdf' | 'csv' | 'excel';
  icon: React.ReactNode;
}

const exportOptions: ExportOption[] = [
  {
    id: 'manager-summary',
    label: 'Manager Summary Report',
    description: 'KPIs, risk scores, and team overview',
    format: 'pdf',
    icon: <FileText className="h-4 w-4" />
  },
  {
    id: 'team-structure',
    label: 'Team Structure Data',
    description: 'Hierarchical team data with access details',
    format: 'csv',
    icon: <FileSpreadsheet className="h-4 w-4" />
  },
  {
    id: 'delegation-log',
    label: 'Delegation Activity Log',
    description: 'Current and historical delegation records',
    format: 'excel',
    icon: <FileSpreadsheet className="h-4 w-4" />
  },
  {
    id: 'access-reviews',
    label: 'Access Review Status',
    description: 'Pending and completed review summaries',
    format: 'pdf',
    icon: <Shield className="h-4 w-4" />
  }
];

interface ExportInsightsModalProps {
  children: React.ReactNode;
}

export function ExportInsightsModal({ children }: ExportInsightsModalProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  const handleOptionToggle = (optionId: string) => {
    setSelectedOptions(prev => 
      prev.includes(optionId) 
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    );
  };

  const handleExport = async () => {
    setIsExporting(true);
    console.log('Exporting insights:', selectedOptions);
    
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock download triggers
    selectedOptions.forEach(optionId => {
      const option = exportOptions.find(opt => opt.id === optionId);
      if (option) {
        console.log(`Downloading ${option.label} as ${option.format.toUpperCase()}`);
      }
    });
    
    setIsExporting(false);
    setSelectedOptions([]);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Download className="h-5 w-5" />
            <span>Export Manager Insights</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {exportOptions.map((option) => (
              <div key={option.id} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                <Checkbox
                  id={option.id}
                  checked={selectedOptions.includes(option.id)}
                  onCheckedChange={() => handleOptionToggle(option.id)}
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    {option.icon}
                    <span className="font-medium">{option.label}</span>
                    <Badge variant="outline">{option.format.toUpperCase()}</Badge>
                  </div>
                  <p className="text-sm text-gray-600">{option.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-gray-600">
              {selectedOptions.length} report(s) selected
            </div>
            <Button 
              onClick={handleExport}
              disabled={selectedOptions.length === 0 || isExporting}
            >
              {isExporting ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-1" />
                  Export Selected
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
