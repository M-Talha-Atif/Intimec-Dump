import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { useAttributePermissionsContext } from "../contexts";

export const AttributeFilters: React.FC = () => {
  const {
    searchTerm,
    filterCategory,
    filterSensitivity,
    categories,
    sensitivities,
    handleSearchChange,
    handleCategoryFilterChange,
    handleSensitivityFilterChange,
  } = useAttributePermissionsContext();

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search attributes..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select
            value={filterCategory}
            onValueChange={handleCategoryFilterChange}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filterSensitivity}
            onValueChange={handleSensitivityFilterChange}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sensitivity</SelectItem>
              {sensitivities.map((sensitivity) => (
                <SelectItem key={sensitivity} value={sensitivity}>
                  {sensitivity.charAt(0).toUpperCase() + sensitivity.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};
