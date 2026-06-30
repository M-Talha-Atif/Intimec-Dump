import { Application } from "@/types/application";
import ApplicationCard, { ApplicationCardSkeleton } from "./ApplicationCard";

const CardView = ({
  filteredApplications,
  loading = false,
  size = 10,
  error,
}: {
  filteredApplications: Application[];
  loading?: boolean;
  size?: number;
  error: unknown;
}) => {
  if (!loading && error) return null;
  return (
    <div className="space-y-6">
      <div
        className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(25rem,1fr))]
       animate-fade-in transition-all duration-300 ease-in-out overflow-visible"
      >
        {loading &&
          Array.from({ length: size }).map((_, i) => (
            <ApplicationCardSkeleton key={i} />
          ))}
        {!loading &&
          !error &&
          filteredApplications &&
          filteredApplications.map((app) => (
            <ApplicationCard key={app.id} application={app} />
          ))}
      </div>
    </div>
  );
};

export default CardView;
