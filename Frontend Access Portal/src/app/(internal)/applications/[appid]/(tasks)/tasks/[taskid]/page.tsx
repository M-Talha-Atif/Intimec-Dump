import { redirect } from "next/navigation";

export default async function Page({
  params,
}: {
  params: { appid: string; taskid: string };
}) {
  const { appid, taskid } = await params;
  redirect(`/applications/${appid}/tasks/${taskid}/configuration`); // Redirect to the Configuration tab by default
}
