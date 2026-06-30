import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home } from "lucide-react";
import AddApplicationContextProvider from "@/contexts/AddApplicationContext";
import PageHeader from "./PageHeader";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import FormStep, { ActiveStepDescription } from "@/app/(internal)/applications/add-application/FormStep";
import { FinalFormData } from "@/types/add-application";
import { getApplication } from "@/lib/applications";
import { notFound } from "next/navigation";

const editApplicationSteps: {
  key: keyof FinalFormData;
}[] = [
  { key: "details" },
  { key: "connector" },
  { key: "schema" },
  { key: "correlation" },
  { key: "synchronizationPolicy" },
  { key: "access" },
  { key: "visibility" },
  { key: "provisioning" },
];

const stepLabels: Record<string, string> = {
  details: "Details",
  connector: "Configuration",
  schema: "Schema",
  correlation: "Correlation",
  synchronizationPolicy: "Sync Policy",
  access: "Access",
  visibility: "Visibility",
  provisioning: "Provisioning",
};

const stepDescriptions: Record<string, string> = {
  details: "Update metadata like name, description, and application type.",
  connector: "Configure and test the connector for this application.",
  schema: "View and manage available connector attributes.",
  correlation: "Define rules to match external accounts with identities.",
  synchronizationPolicy: "Configure synchronization reactions for each situation.",
  access: "Configure entitlements and access review metadata.",
  visibility: "Control who can see or manage this application.",
  provisioning: "Set up how identities are created and updated.",
};

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { appid: string };
}) {
  const { appid } = await params;
  const application = await getApplication(appid);

  if (!application) {
    notFound();
  }

  return (
    <AddApplicationContextProvider
      mode="edit"
      applicationId={appid}
      initialData={application}
    >
      <div className="h-[calc(100vh-var(--header-height)-calc(--spacing(8)))] flex flex-col w-full">
        <section className="flex flex-col">
          <Breadcrumb className="mt-4 ml-8">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">
                  <Home className="w-4 h-4" />
                  <span className="sr-only">Home</span>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/applications">
                  Applications
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/applications/${appid}/overview`}>
                  {application.details?.name ?? "Application"}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Edit</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <PageHeader />
        </section>
        <main className="relative flex-1 overflow-hidden">
          <div className="flex flex-col h-full px-8 pb-2 overflow-hidden">
            {/* Horizontal stepper */}
            <Card className="flex-shrink-0 mb-4">
              <CardContent className="py-3 px-6">
                <nav className="flex items-center">
                  {editApplicationSteps.map((step, index) => (
                    <FormStep
                      key={step.key as string}
                      label={stepLabels[step.key]}
                      step={step.key}
                      stepNumber={index}
                      lastStep={index === editApplicationSteps.length - 1}
                      totalSteps={editApplicationSteps.length}
                    />
                  ))}
                </nav>
                <ActiveStepDescription descriptions={stepDescriptions} />
              </CardContent>
            </Card>
            {/* Form content */}
            <Card className="flex flex-col flex-1 overflow-hidden">
              <CardContent className="flex-1 p-6 overflow-hidden">
                {children}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </AddApplicationContextProvider>
  );
}
