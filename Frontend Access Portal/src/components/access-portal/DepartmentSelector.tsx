"use client";

import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { mockDepartments as allDepartments } from "@/data/mock-departments";

interface DepartmentSelectorProps<T extends { allowedDepartments: string[] }> {
  formData: T;
  setFormData: React.Dispatch<React.SetStateAction<T>>;
}

export default function DepartmentSelector<T extends { allowedDepartments: string[] }>({
  formData,
  setFormData,
}: DepartmentSelectorProps<T>) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const itemsPerPage = 5;

  const filteredDepartments = useMemo(() => {
    return allDepartments.filter((d) =>
      d.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const paginatedDepartments = useMemo(() => {
    const start = page * itemsPerPage;
    return filteredDepartments.slice(start, start + itemsPerPage);
  }, [filteredDepartments, page]);

  const addDepartment = (dept: typeof allDepartments[number]) => {
    if (!formData.allowedDepartments.includes(dept.name)) {
      setFormData({
        ...formData,
        allowedDepartments: [...formData.allowedDepartments, dept.name],
      });
    }
  };

  const removeDepartment = (dept: string) => {
    setFormData({
      ...formData,
      allowedDepartments: formData.allowedDepartments.filter((d) => d !== dept),
    });
  };

  return (
    <div>
      {/* Selected Departments */}
      <div className="flex flex-wrap gap-2 mb-2">
        {formData.allowedDepartments.map((dept) => (
          <Badge key={dept} variant="secondary">
            {dept}
            <button onClick={() => removeDepartment(dept)} className="ml-2">
              ×
            </button>
          </Badge>
        ))}
      </div>

      {/* Dropdown */}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Select Department</Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="w-64"
          side="bottom"
          align="start"
        >
          {/* Search */}
          <Input
            placeholder="Search departments..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="mb-2"
          />

          {/* Department List */}
          {paginatedDepartments.map((dept) => (
            <DropdownMenuItem key={dept.id} onSelect={() => addDepartment(dept)}>
              {dept.name}
            </DropdownMenuItem>
          ))}

          {/* Pagination */}
          <div className="flex justify-between mt-2 px-1">
            <Button
              size="sm"
              variant="outline"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={(page + 1) * itemsPerPage >= filteredDepartments.length}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
