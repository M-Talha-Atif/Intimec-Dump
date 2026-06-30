import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { X } from "lucide-react";
import { useState } from "react";

/**
 * UI filter state managed by this panel.
 * Each field maps to one filter group displayed to the user.
 * On "Apply", these are translated into backend query parameters
 * by the parent component.
 */
export type Filters = {
  requestable: "all" | "yes" | "no";
  ownership: "all" | "owned" | "unowned";
  governance: string[];
  classifications: string[];
  entitlementTypes: string[];
};

/**
 * Returns a blank filter state with all values reset to defaults.
 */
export function emptyFilters(): Filters {
  return {
    requestable: "all",
    ownership: "all",
    governance: [],
    classifications: [],
    entitlementTypes: [],
  };
}

const CLASSIFICATION_OPTIONS = ["High Risk", "PII", "GDPR", "SOX"];
const ENTITLEMENT_TYPE_OPTIONS = ["Group", "Role", "Responsibility", "Policy", "Permission"];

type EntitlementsFilterPanelProps = {
  onClose: () => void;
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
};

const EntitlementsFilterPanel = ({
  onClose,
  filters,
  onFilterChange,
}: EntitlementsFilterPanelProps) => {
  const [localFilters, setLocalFilters] = useState<Filters>(filters);

  const handleRequestableChange = (value: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      requestable: value as Filters["requestable"],
    }));
  };

  const handleOwnershipChange = (value: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      ownership: value as Filters["ownership"],
    }));
  };

  /**
   * Toggles a value in a string array filter (governance, classifications, entitlementTypes).
   */
  const toggleArrayFilter = (
    key: "governance" | "classifications" | "entitlementTypes",
    value: string,
    checked: boolean
  ) => {
    setLocalFilters((prev) => {
      const current = prev[key];
      if (checked) {
        return { ...prev, [key]: [...current, value] };
      } else {
        return { ...prev, [key]: current.filter((item) => item !== value) };
      }
    });
  };

  const handleApplyFilters = () => {
    onFilterChange(localFilters);
  };

  const handleClearFilters = () => {
    const cleared = emptyFilters();
    setLocalFilters(cleared);
    onFilterChange(cleared);
  };

  /**
   * Counts how many non-default filters are active.
   * Used to show a visual indicator that filters are applied.
   */
  const activeCount =
    (localFilters.requestable !== "all" ? 1 : 0) +
    (localFilters.ownership !== "all" ? 1 : 0) +
    localFilters.governance.length +
    localFilters.classifications.length +
    localFilters.entitlementTypes.length;

  return (
    <aside className="w-full lg:w-80 lg:flex-shrink-0 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-slate-800">
            Advanced Filters
          </h3>
          {activeCount > 0 && (
            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
              {activeCount}
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Close filters"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      <Separator />
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Requestable */}
          <div>
            <Label className="font-semibold text-slate-800">Requestable</Label>
            <RadioGroup
              value={localFilters.requestable}
              onValueChange={handleRequestableChange}
              className="mt-2 space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="r-all" />
                <Label htmlFor="r-all" className="font-normal">
                  All
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="r-yes" />
                <Label htmlFor="r-yes" className="font-normal">
                  Only Requestable
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="r-no" />
                <Label htmlFor="r-no" className="font-normal">
                  Not Requestable
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Ownership */}
          <div>
            <Label className="font-semibold text-slate-800">Ownership</Label>
            <RadioGroup
              value={localFilters.ownership}
              onValueChange={handleOwnershipChange}
              className="mt-2 space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="o-all" />
                <Label htmlFor="o-all" className="font-normal">
                  All
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="owned" id="o-owned" />
                <Label htmlFor="o-owned" className="font-normal">
                  Owned
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="unowned" id="o-unowned" />
                <Label htmlFor="o-unowned" className="font-normal">
                  Unowned
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Governance Status */}
          <div>
            <Label className="font-semibold text-slate-800">
              Governance Status
            </Label>
            <div className="mt-2 space-y-1">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="gs-orphaned"
                  checked={localFilters.governance.includes("orphaned")}
                  onCheckedChange={(c) =>
                    toggleArrayFilter("governance", "orphaned", !!c)
                  }
                />
                <Label htmlFor="gs-orphaned" className="font-normal">
                  Orphaned
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="gs-unclassified"
                  checked={localFilters.governance.includes("unclassified")}
                  onCheckedChange={(c) =>
                    toggleArrayFilter("governance", "unclassified", !!c)
                  }
                />
                <Label htmlFor="gs-unclassified" className="font-normal">
                  Unclassified
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="gs-critical"
                  checked={localFilters.governance.includes("critical")}
                  onCheckedChange={(c) =>
                    toggleArrayFilter("governance", "critical", !!c)
                  }
                />
                <Label htmlFor="gs-critical" className="font-normal">
                  Critical Risk
                </Label>
              </div>
            </div>
          </div>

          {/* Classification */}
          <div>
            <Label className="font-semibold text-slate-800">
              Classification
            </Label>
            <div className="mt-2 space-y-1">
              {CLASSIFICATION_OPTIONS.map((c) => (
                <div key={c} className="flex items-center space-x-2">
                  <Checkbox
                    id={`c-${c}`}
                    checked={localFilters.classifications.includes(c)}
                    onCheckedChange={(checked) =>
                      toggleArrayFilter("classifications", c, !!checked)
                    }
                  />
                  <Label htmlFor={`c-${c}`} className="font-normal">
                    {c}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Entitlement Type */}
          <div>
            <Label className="font-semibold text-slate-800">
              Entitlement Type
            </Label>
            <div className="mt-2 space-y-1">
              {ENTITLEMENT_TYPE_OPTIONS.map((t) => (
                <div key={t} className="flex items-center space-x-2">
                  <Checkbox
                    id={`t-${t}`}
                    checked={localFilters.entitlementTypes.includes(t)}
                    onCheckedChange={(checked) =>
                      toggleArrayFilter("entitlementTypes", t, !!checked)
                    }
                  />
                  <Label htmlFor={`t-${t}`} className="font-normal">
                    {t}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
      <Separator />
      <div className="p-4 mt-auto flex flex-col gap-2">
        <Button onClick={handleApplyFilters}>Apply Filters</Button>
        <Button variant="outline" onClick={handleClearFilters}>
          Clear Filters
        </Button>
      </div>
    </aside>
  );
};

export default EntitlementsFilterPanel;