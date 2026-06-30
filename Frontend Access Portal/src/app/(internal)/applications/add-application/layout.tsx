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
import FormStep, { ActiveStepDescription } from "./FormStep";
import { FinalFormData } from "@/types/add-application";
import { getTranslations } from "next-intl/server";

const formSteps = [
  "details",
  "connector",
  "schema",
  "correlation",
  "synchronizationPolicy",
  "access",
  "visibility",
  "provisioning",
] as const;

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("ApplicationsPage");
  return (
    <AddApplicationContextProvider>
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
                  {t("title")}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{t("add-application.title")}</BreadcrumbPage>
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
                  {formSteps.map((step, index) => (
                    <FormStep
                      key={step}
                      label={t(`forms.${step}.title`)}
                      step={step as keyof FinalFormData}
                      stepNumber={index}
                      lastStep={index === formSteps.length - 1}
                      totalSteps={formSteps.length}
                    />
                  ))}
                </nav>
                <ActiveStepDescription
                  descriptions={Object.fromEntries(
                    formSteps.map((s) => [s, t(`forms.${s}.description`)])
                  )}
                />
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