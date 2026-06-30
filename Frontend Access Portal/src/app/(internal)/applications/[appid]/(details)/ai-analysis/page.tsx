import ApplicationAIAnalysisTab from "@/components/applications/ai-analysis/ApplicationAIAnalysisTab";

export default async function Page({ params }: { params: { appid: string } }) {
  const { appid } = await params;
  return <ApplicationAIAnalysisTab appid={appid} />;
}
