import EntitlementsTab from "@/components/applications/entitlements/EntitlementsTab";

export default async function Page({ params }: { params: { appid: string } }) {
  const appid = (await params).appid;
  return <EntitlementsTab appid={appid} />;
}
