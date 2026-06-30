import TaskLivePreview from "@/components/applications/tasks/TaskLivePreview";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ appid: string; taskid: string }>;
  searchParams: Promise<{ executionId?: string }>;
}) {
  const { appid, taskid } = await params;
  const { executionId } = await searchParams;
  return <TaskLivePreview appid={appid} taskid={taskid} executionId={executionId} />;
}
