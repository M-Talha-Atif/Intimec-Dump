import { redirect } from "next/navigation";

export default async function Page({ params }:{ params: { appid: string } }) {
  const appid = (await params).appid;
  redirect(`/applications/${appid}/overview`); // Redirect to the Overview tab by default
}
