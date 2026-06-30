"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DebugLevelBadge } from "./debug-level-badge";
import { DEBUG_LEVELS } from "@/constants/debug";

import { useDebugConfiguration } from "@/contexts/use-debug-configuration";

export const ComponentDebugTable = () => {
  const {
    components,
    isGlobalDebuggingEnabled,
    hasDebugPermissions,
    handleComponentLevelChange,
  } = useDebugConfiguration();
  // console.log("Rendering ComponentDebugTable", components);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Component Debug Levels</CardTitle>
        <p className="text-sm text-muted-foreground">
          Configure logging verbosity for each platform component
        </p>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Component Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Current Debug Level</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {components.map((component) => (
              <TableRow key={component.name}>
                <TableCell className="font-medium">{component.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {component.description}
                </TableCell>
                <TableCell>
                  <DebugLevelBadge level={component.level} />
                </TableCell>
                <TableCell>
                  <Select
                    value={component.level}
                    onValueChange={(value) =>
                      handleComponentLevelChange(component.name, value)
                    }
                    disabled={!isGlobalDebuggingEnabled || !hasDebugPermissions}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DEBUG_LEVELS.map((level) => (
                        <SelectItem
                          key={level.value}
                          value={level.value}
                          title={level.tooltip}
                        >
                          <span className={level.color}>{level.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
