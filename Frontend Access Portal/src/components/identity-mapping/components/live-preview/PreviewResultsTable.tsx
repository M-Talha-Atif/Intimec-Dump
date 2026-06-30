import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PreviewResult } from "../../data/livePreviewData";
import { getStatusIcon, getStatusBadge } from "../../utils/livePreviewUtils";

interface PreviewResultsTableProps {
  results: PreviewResult[];
}

export const PreviewResultsTable: React.FC<PreviewResultsTableProps> = ({
  results,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transformation Results</CardTitle>
        <CardDescription>
          Detailed results of attribute transformations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead>Source Attribute</TableHead>
                <TableHead>Raw Value</TableHead>
                <TableHead>Transformed Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((result) => (
                <TableRow key={result.id}>
                  <TableCell>
                    <Badge variant="outline">{result.source}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">
                      {result.sourceAttribute}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm bg-gray-50 px-2 py-1 rounded">
                      {result.rawValue || (
                        <span className="text-gray-400 italic">empty</span>
                      )}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm bg-blue-50 px-2 py-1 rounded">
                      {result.transformedValue || (
                        <span className="text-gray-400 italic">empty</span>
                      )}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(result.status)}
                      {getStatusBadge(result.status)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {result.notes}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
