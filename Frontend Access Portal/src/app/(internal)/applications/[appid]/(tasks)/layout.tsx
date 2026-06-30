import React, { Suspense } from "react";
import { getApplication } from "@/lib/applications";
import HeaderComp, { HeaderCompSekeleton } from "../(details)/HeaderComp";

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
    <div className="h-full flex flex-col gap-4 pt-4 w-full">
      <div className="flex items-end justify-between w-full px-8">
        <Suspense fallback={<HeaderCompSekeleton appid={appid} />}>
          <HeaderComp applicationPromise={applicationPromise} appid={appid} />
        </Suspense>
      </div>
      <main className="flex flex-1 overflow-hidden flex-row relative">
        {children}
      </main>
    </div>
  );
}
