import { Skeleton } from "@/components/ui/skeleton";

interface TileLoadingSkeletonProps {
  count?: number;
  height?: string;
}

export const TileLoadingSkeleton = ({
  count = 3,
  height = "h-24",
}: TileLoadingSkeletonProps) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} className={`${height} w-full`} />
      ))}
    </div>
  );
};
