// app/settings/layout.tsx
"use client";

import { Settings as SettingsIcon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { settingsSections } from "@/app/(internal)/settings/SettingsPage";

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const params = useParams();
  const activeSectionId = params.sectionId as string | undefined;

  const categories = [...new Set(settingsSections.map((s) => s.category))];

  return (
    <div className="flex h-full ">
      {/* Main Content Area */}
      <div className="flex-1 p-6 sm:p-8">
        {children}
      </div>

      {/*/!* Vertical Navigation - Renders only on detail pages *!/*/}
      {/*{activeSectionId && (*/}
      {/*    <aside className="w-80 bg-white border-l border-slate-200 p-6 hidden lg:block">*/}
      {/*        <h3 className="text-lg font-semibold mb-4 text-slate-800">Settings Navigation</h3>*/}
      {/*        <nav className="space-y-4">*/}
      {/*            {categories.map((category) => (*/}
      {/*                <div key={category}>*/}
      {/*                    <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-2">*/}
      {/*                        {category}*/}
      {/*                    </h4>*/}
      {/*                    <div className="space-y-1">*/}
      {/*                        {settingsSections*/}
      {/*                            .filter((section) => section.category === category)*/}
      {/*                            .map((section) => (*/}
      {/*                                <Link*/}
      {/*                                    key={section.id}*/}
      {/*                                    href={`/settings/${section.id}`}*/}
      {/*                                    className={`flex w-full items-center space-x-2 p-2 rounded-md text-sm transition-colors ${*/}
      {/*                                        activeSectionId === section.id*/}
      {/*                                            ? 'bg-brand-teal text-white shadow-sm'*/}
      {/*                                            : 'text-slate-700 hover:bg-slate-100'*/}
      {/*                                    }`}*/}
      {/*                                >*/}
      {/*                                    <section.icon className="h-4 w-4" />*/}
      {/*                                    <span>{section.title}</span>*/}
      {/*                                </Link>*/}
      {/*                            ))}*/}
      {/*                    </div>*/}
      {/*                </div>*/}
      {/*            ))}*/}
      {/*        </nav>*/}
      {/*    </aside>*/}
      {/*)}*/}
    </div>
  );
}
