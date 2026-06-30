import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { OrgNodeData } from '@/types/organization';

interface ReviewSelectedUnitsProps {
  selectedUnits: OrgNodeData[];
  includeSubUnits: boolean;
  onIncludeSubUnitsChange: (value: boolean) => void;
}

export function ReviewSelectedUnits({
  selectedUnits,
  includeSubUnits,
  onIncludeSubUnitsChange,
}: ReviewSelectedUnitsProps) {
  return (
    <div className="space-y-3">
      <Label>Selected Units ({selectedUnits.length})</Label>
      <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-muted/50">
        {selectedUnits.map((unit) => (
          <Badge key={unit.id} variant="secondary">
            {unit.name}
          </Badge>
        ))}
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="include-subunits"
          checked={includeSubUnits}
          onCheckedChange={(checked) => onIncludeSubUnitsChange(checked as boolean)}
        />
        <Label htmlFor="include-subunits" className="font-normal cursor-pointer">
          Include all sub-units in review scope
        </Label>
      </div>
    </div>
  );
}
