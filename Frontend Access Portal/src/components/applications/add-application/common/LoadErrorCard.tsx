import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function LoadErrorCard({
  errorTitle,
  errorMessage,
  refresh = undefined,
}: {
  errorTitle: string;
  errorMessage: string;
  refresh?: <A extends unknown[]>(...args: A) => unknown;
}) {
  return (
    <Card className="border-destructive bg-destructive/10 border max-w-md w-full">
      <CardHeader>
        <CardTitle className="text-destructive">Error</CardTitle>
        <CardDescription>{errorTitle}</CardDescription>
      </CardHeader>
      <CardContent className="text-wrap">
        <CardDescription className="text-red-500">
          {errorMessage || "An unexpected error occurred."}
        </CardDescription>
      </CardContent>
      <CardContent>
        <CardDescription>Please try again later.</CardDescription>
        {refresh && (
          <Button
            className="mt-2"
            onClick={refresh}
            variant="outline"
            type="button"
          >
            Retry
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
