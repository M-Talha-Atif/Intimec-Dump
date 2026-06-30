"use client";

import { ShieldAlert } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AccessDeniedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] space-y-6 p-6">
      <div className="flex flex-col items-center space-y-4">
        <ShieldAlert className="h-24 w-24 text-destructive" />
        <h1 className="text-4xl font-bold text-foreground">Access Denied</h1>
        <p className="text-lg text-muted-foreground text-center max-w-md">
          You don't have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>
      </div>
      
      <div className="flex gap-4">
        <Button asChild variant="default">
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
        <Button asChild variant="outline" onClick={() => window.history.back()}>
          <Link href="#">Go Back</Link>
        </Button>
      </div>
    </div>
  );
}
