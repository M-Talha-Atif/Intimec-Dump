import { History, Play, Settings } from "lucide-react";
import Sidebar from "@/app/(internal)/applications/[appid]/(details)/Sidebar";
import TaskActionBar from "@/components/applications/tasks/TaskActionBar";
import TaskInfo from "@/components/applications/tasks/TaskInfo";
import { getApplication } from "@/lib/applications";
import { getTask } from "@/lib/task";
const tabs = [
  {
    label: (
      <p className="flex items-center gap-2">
        <Settings className="size-4" />
        <span>Configuration</span>
      </p>
    ),
    path: "/applications/:appid/tasks/:taskid/configuration",
  },
  {
    label: (
      <p className="flex items-center gap-2">
        <History className="size-4" />
        <span>History</span>
      </p>
    ),
    path: "/applications/:appid/tasks/:taskid/history",
  },
  {
    label: (
      <p className="flex items-center gap-2">
        <Play className="size-4" />
        <span>Running</span>
      </p>
    ),
    path: "/applications/:appid/tasks/:taskid/running",
  },
];

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ appid: string; taskid: string }>;
}) {
  const { taskid, appid } = await params;
  getApplication(appid);
  const taskPromise = getTask(appid, taskid);
  return (
    <div className="h-full flex flex-col overflow-hidden w-full gap-2">
      <TaskInfo taskPromise={taskPromise} />
      <div className="flex items-center justify-start gap-2 p-4 border-1 shadow-sm mx-6 rounded-md">
        <TaskActionBar taskid={taskid} appid={appid} />
      </div>
      <div className="flex-1 flex overflow-hidden">
        <aside className="w-46 h-full border-r px-4">
          <Sidebar tabs={tabs} />
        </aside>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
