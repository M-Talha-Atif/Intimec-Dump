import { X, CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Job } from "@/hooks/useJobTracker";

interface JobTrackerDrawerProps {
  isOpen: boolean;
  jobs: Job[];
  onClose: () => void;
  onDismiss: (jobId: string) => void;
}

export const JobTrackerDrawer = ({ isOpen, jobs, onClose, onDismiss }: JobTrackerDrawerProps) => {
  const getStatusIcon = (status: Job["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-destructive" />;
      case "partial":
        return <AlertCircle className="h-5 w-5 text-warning" />;
      default:
        return <Loader2 className="h-5 w-5 animate-spin text-primary" />;
    }
  };

  const getStatusBadge = (status: Job["status"]) => {
    const variants: Record<Job["status"], "default" | "destructive" | "secondary" | "outline"> = {
      pending: "secondary",
      running: "default",
      completed: "outline",
      failed: "destructive",
      partial: "outline",
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent>
        <DrawerHeader className="border-b">
          <DrawerTitle>Background Jobs</DrawerTitle>
          <DrawerClose />
        </DrawerHeader>
        
        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {jobs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No active jobs
            </div>
          ) : (
            jobs.map((job) => (
              <div key={job.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(job.status)}
                    <div>
                      <div className="font-medium">{job.type}</div>
                      <div className="text-sm text-muted-foreground">
                        Started {format(new Date(job.startedAt), "HH:mm:ss")}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(job.status)}
                    {(job.status === "completed" || job.status === "failed") && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDismiss(job.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {job.status === "running" && (
                  <div className="space-y-2">
                    <Progress value={job.progress} />
                    <div className="text-sm text-muted-foreground text-right">
                      {Math.round(job.progress)}%
                    </div>
                  </div>
                )}

                {job.message && (
                  <div className="text-sm text-muted-foreground">{job.message}</div>
                )}

                {job.errors && job.errors.length > 0 && (
                  <div className="text-sm text-destructive space-y-1">
                    {job.errors.map((error, i) => (
                      <div key={i}>• {error}</div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};
