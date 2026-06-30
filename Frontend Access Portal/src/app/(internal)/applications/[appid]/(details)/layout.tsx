import React, { Suspense } from "react";
import { getApplication } from "@/lib/applications";
import HeaderComp, { HeaderCompSekeleton } from "./HeaderComp";
import HorizontalTabs from "./HorizontalTabs";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { appid: string };
}) {
  const appid = (await params).appid;
  const applicationPromise = getApplication(appid);
  return (
    <div className="h-full flex flex-col pt-4 w-full">
      <div className="px-6 lg:px-8">
        <Suspense fallback={<HeaderCompSekeleton appid={appid} />}>
          <HeaderComp applicationPromise={applicationPromise} appid={appid} />
        </Suspense>
      </div>
      <div className="px-6 lg:px-8 mt-4">
        <HorizontalTabs appid={appid} />
      </div>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
