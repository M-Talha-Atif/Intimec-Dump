import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

export interface Job {
  id: string;
  type: string;
  status: "pending" | "running" | "completed" | "failed" | "partial";
  progress: number;
  message?: string;
  startedAt: string;
  completedAt?: string;
  result?: any;
  errors?: string[];
}

export const useJobTracker = () => {
  const [jobs, setJobs] = useState<Map<string, Job>>(new Map());
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const trackJob = useCallback((jobId: string, jobType: string) => {
    const newJob: Job = {
      id: jobId,
      type: jobType,
      status: "pending",
      progress: 0,
      startedAt: new Date().toISOString(),
    };
    
    setJobs((prev) => new Map(prev).set(jobId, newJob));
    setIsOpen(true);

    // Simulate job progress - in production, use SSE/WebSocket
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20;
      
      if (progress >= 100) {
        setJobs((prev) => {
          const updated = new Map(prev);
          const job = updated.get(jobId);
          if (job) {
            updated.set(jobId, {
              ...job,
              status: "completed",
              progress: 100,
              completedAt: new Date().toISOString(),
              message: "Job completed successfully",
            });
          }
          return updated;
        });
        
        toast({
          title: "Job Completed",
          description: `${jobType} finished successfully`,
        });
        
        clearInterval(interval);
      } else {
        setJobs((prev) => {
          const updated = new Map(prev);
          const job = updated.get(jobId);
          if (job) {
            updated.set(jobId, {
              ...job,
              status: "running",
              progress: Math.min(progress, 100),
            });
          }
          return updated;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [toast]);

  const dismissJob = useCallback((jobId: string) => {
    setJobs((prev) => {
      const updated = new Map(prev);
      updated.delete(jobId);
      return updated;
    });
  }, []);

  const closeDrawer = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    jobs: Array.from(jobs.values()),
    trackJob,
    dismissJob,
    isOpen,
    closeDrawer,
    openDrawer: () => setIsOpen(true),
  };
};
