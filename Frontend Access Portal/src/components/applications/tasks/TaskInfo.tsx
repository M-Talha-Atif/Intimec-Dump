import { Task } from "@/types/task";

export default async function TaskInfo({
  taskPromise,
}: {
  taskPromise: Promise<Task | null>;
}) {
  const task = await taskPromise;
  return (
    <div className="flex flex-col px-8">
      <h2 className="text-lg font-semibold">{task?.name}</h2>
      <p className="text-lg text-muted-foreground">{task?.description}</p>
    </div>
  );
}
