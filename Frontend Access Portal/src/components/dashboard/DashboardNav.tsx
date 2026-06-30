
import { cn } from "@/lib/utils";
import { useScrollSpy } from "@/hooks/useScrollSpy";
import { ShieldCheck, Users, ShieldAlert, FileText, ChartPie } from "lucide-react";

const sections = [
  { id: 'identity-risk', title: 'Identity Risk', icon: ShieldCheck },
  { id: 'lifecycle-kpis', title: 'Access Lifecycle KPIs', icon: Users },
  { id: 'privileged-access', title: 'Privileged Access', icon: ShieldAlert },
  { id: 'review-campaigns', title: 'Access Reviews', icon: FileText },
  { id: 'governance-insights', title: 'Governance Insights', icon: ChartPie },
];

export function DashboardNav() {
    const sectionIds = sections.map(s => s.id);
    const activeId = useScrollSpy(sectionIds, 100); // 100px offset for sticky header

    const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            window.scrollTo({
                top: element.offsetTop - 96, // 96px offset
                behavior: 'smooth',
            });
        }
    };

    return (
        <nav className="sticky top-24 h-fit w-56 hidden lg:block">
            <h3 className="text-sm font-semibold text-muted-foreground mb-2 px-4">Dashboard Sections</h3>
            <ul className="space-y-1">
                {sections.map((section) => (
                    <li key={section.id}>
                        <a
                            href={`#${section.id}`}
                            onClick={(e) => handleScrollTo(e, section.id)}
                            className={cn(
                                "flex items-center gap-3 rounded-md px-4 py-2 text-sm font-medium transition-colors",
                                activeId === section.id
                                    ? "bg-accent text-accent-foreground"
                                    : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                            )}
                        >
                            <section.icon className="h-4 w-4" />
                            <span>{section.title}</span>
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
