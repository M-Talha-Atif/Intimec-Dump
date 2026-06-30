import TaskConfiguration from "@/components/applications/tasks/tasks-configuration/TaskConfiguration";
import TaskScheduleConfig from "@/components/applications/tasks/tasks-configuration/TaskScheduleConfig";

export default async function Page({
  params,
}: {
  params: Promise<{ appid: string; taskid: string }>;
}) {
  const { appid, taskid } = await params;
  
  return (
    <main className="flex flex-col gap-4 max-h-full overflow-hidden w-full p-4">
      <TaskScheduleConfig appid={appid} taskid={taskid} />
      <TaskConfiguration appid={appid} taskid={taskid} />
    </main>
  );
}
