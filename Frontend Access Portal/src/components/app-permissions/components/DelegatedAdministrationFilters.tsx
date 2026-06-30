import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SCOPE_TYPE_FILTERS } from "../data/delegatedAdministrationData";
import { useDelegatedAdministrationContext } from "../contexts/DelegatedAdministrationContext";

export const DelegatedAdministrationFilters: React.FC = () => {
  const { filterType, setFilterType } = useDelegatedAdministrationContext();

  return (
    <Card>
      <CardContent className="p-4">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SCOPE_TYPE_FILTERS.map((filter) => (
              <SelectItem key={filter.value} value={filter.value}>
                {filter.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
};
