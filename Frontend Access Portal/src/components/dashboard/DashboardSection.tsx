
import * as React from "react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { ChevronsUpDown } from "lucide-react"

type DashboardSectionProps = {
    id: string;
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
};

export function DashboardSection({ id, title, children, defaultOpen = false }: DashboardSectionProps) {
    const storageKey = `dashboard-section:${id}:open`;

    const [isOpen, setIsOpen] = React.useState(() => {
        try {
            const storedValue = localStorage.getItem(storageKey);
            return storedValue !== null ? JSON.parse(storedValue) : defaultOpen;
        } catch {
            return defaultOpen;
        }
    });

    React.useEffect(() => {
        try {
            localStorage.setItem(storageKey, JSON.stringify(isOpen));
        } catch (error) {
            console.error("Failed to save to localStorage", error);
        }
    }, [isOpen, storageKey]);

    return (
        <section id={id} className="w-full space-y-4 scroll-mt-24">
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <div className="flex items-center justify-between space-x-4 px-1">
                    <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-9 p-0">
                            <ChevronsUpDown className="h-4 w-4" />
                            <span className="sr-only">Toggle</span>
                        </Button>
                    </CollapsibleTrigger>
                </div>
                <CollapsibleContent>
                    {children}
                </CollapsibleContent>
            </Collapsible>
        </section>
    );
}
