
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, ArrowRight } from 'lucide-react';

interface ReassignManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  currentManager: string;
  onConfirm: (newManagerId: string) => void;
}

const mockManagers = [
  { id: 'mgr_1', name: 'Alice Johnson', department: 'Engineering' },
  { id: 'mgr_2', name: 'Bob Smith', department: 'Product' },
  { id: 'mgr_3', name: 'Carol Davis', department: 'Engineering' },
  { id: 'mgr_4', name: 'David Wilson', department: 'Sales' }
];

const ReassignManagerModal: React.FC<ReassignManagerModalProps> = ({
  isOpen,
  onClose,
  userName,
  currentManager,
  onConfirm
}) => {
  const [selectedManager, setSelectedManager] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const selectedManagerData = mockManagers.find(mgr => mgr.id === selectedManager);
  const impactCount = Math.floor(Math.random() * 5) + 1; // Mock impact

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedManager) return;

    setIsLoading(true);
    try {
      await onConfirm(selectedManager);
      onClose();
    } catch (error) {
      console.error('Manager reassignment failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reassign Manager for {userName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Current Manager</Label>
            <div className="p-3 bg-gray-50 rounded-md">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="font-medium">{currentManager}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowRight className="h-5 w-5 text-gray-400" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newManager">New Manager</Label>
            <Select value={selectedManager} onValueChange={setSelectedManager}>
              <SelectTrigger id="newManager">
                <SelectValue placeholder="Select new manager" />
              </SelectTrigger>
              <SelectContent>
                {mockManagers.map((manager) => (
                  <SelectItem key={manager.id} value={manager.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{manager.name}</span>
                      <span className="text-sm text-gray-500">{manager.department}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedManagerData && (
            <Alert>
              <AlertDescription>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span className="font-medium">Impact Preview</span>
                  </div>
                  <div className="text-sm">
                    • This change will affect {impactCount} direct reports
                    • Access reviews will be transferred to {selectedManagerData.name}
                    • Current certifications will remain valid
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!selectedManager || isLoading}
            >
              {isLoading ? 'Reassigning...' : 'Reassign Manager'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReassignManagerModal;
