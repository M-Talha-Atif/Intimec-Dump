// app/settings/[sectionId]/SSOConnectionsPage.tsx
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { settingsMap } from "@/app/(internal)/settings/SettingsPage";
import { notFound } from "next/navigation";
import PageHeader from '@/components/shared/PageHeader';


interface SettingDetailPageProps {
  params: {
    sectionId: string;
  };
}

export default async function SettingDetailPage({
  params,
}: SettingDetailPageProps) {
  const { sectionId } = await params;
  const section = settingsMap.get(sectionId);

  // Render the specific component for the section
  const SectionComponent = section?.component;
  // If the section ID from the URL is not in our map, show a 404 page
  if (!section || !SectionComponent) {
    return notFound();
  }

  return (
    <div className="space-y-4">


      <PageHeader
        title={section.title}
        description={section.description}
        icon={< section.icon className="h-5 w-5 text-primary" />}
        tooltip="Settings allow administrators to manage system configuration, identity policies, integrations, and operational preferences."
      />

      {/* Render the section's component */}

      <SectionComponent />
    </div>
  );
}
