"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { settingsSections } from "@/app/(internal)/settings/SettingsPage";
import { Settings, LayoutGrid, List } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PageHeader from '@/components/shared/PageHeader';

interface PageAccess {
  id: string;
  name: string;
  path: string;
  canAccess: boolean;
  requiresPermission: boolean;
}

interface PageAccessResponse {
  pages: PageAccess[];
  accessiblePages: number;
  totalPages: number;
  tenantId: string;
  userId: string;
}

export default function SettingsPage() {
  const [accessiblePaths, setAccessiblePaths] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"card" | "table">("card");

  useEffect(() => {
    const fetchPageAccess = async () => {
      try {
        const response = await fetch("/api/permissions/pages", {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data: PageAccessResponse = await response.json();
          // Create a Set of accessible paths for fast lookup
          const accessible = new Set(
            data.pages
              .filter((page) => page.canAccess)
              .map((page) => page.path)
          );
          setAccessiblePaths(accessible);
        } else {
          console.error("Failed to fetch page access:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching page access:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPageAccess();
  }, []);

  // Filter settings sections based on accessible paths
  const filteredSections = settingsSections.filter((section) =>
    accessiblePaths.has(`/settings/${section.id}`)
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Settings"
          description="Configure platform preferences, system behavior, and administrative controls."
          icon={<Settings className="h-5 w-5 text-primary" />}
          tooltip="Settings allow administrators to manage system configuration, identity policies, integrations, and operational preferences."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Skeleton cards matching the settings layout */}
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((index) => (
            <div
              key={index}
              className="h-full border border-border rounded-lg p-6 bg-card"
            >
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="h-5 w-5 bg-gray-200 animate-pulse rounded" />
                  <div className="h-5 w-32 bg-gray-200 animate-pulse rounded" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full bg-gray-200 animate-pulse rounded" />
                  <div className="h-3 w-3/4 bg-gray-200 animate-pulse rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Settings"
          description="Configure platform preferences, system behavior, and administrative controls."
          icon={<Settings className="h-5 w-5 text-primary" />}
          tooltip="Settings allow administrators to manage system configuration, identity policies, integrations, and operational preferences."
        />


        <ToggleGroup
          type="single"
          variant="outline"
          value={viewMode}
          onValueChange={(value) => {
            if (value === "card" || value === "table") {
              setViewMode(value);
            }
          }}
        >
          <ToggleGroupItem value="card" aria-label="Card view">
            <LayoutGrid className="w-4 h-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="table" aria-label="Table view">
            <List className="w-4 h-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {viewMode === "card" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSections.map((section) => (
            <Link key={section.id} href={`/settings/${section.id}`} passHref>
              <div className="h-full border border-border rounded-lg p-6 hover:border-primary transition-all cursor-pointer shadow-sm hover:shadow-md bg-card">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <section.icon className="h-5 w-5 text-primary" />
                    <span className="text-lg font-semibold text-foreground">
                      {section.title}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {section.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSections.map((section) => (
                <TableRow
                  key={section.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => window.location.href = `/settings/${section.id}`}
                >
                  <TableCell>
                    <section.icon className="h-5 w-5 text-primary" />
                  </TableCell>
                  <TableCell className="font-medium">{section.title}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {section.description}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                      {section.category}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
