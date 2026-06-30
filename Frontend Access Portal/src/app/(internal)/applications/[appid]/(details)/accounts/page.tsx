import AccountsTab from "@/components/applications/accounts/AccountsTab";

export default async function Page({ params }: { params: { appid: string } }) {
  const appid = (await params).appid;
  return <AccountsTab appid={appid} />;
}
