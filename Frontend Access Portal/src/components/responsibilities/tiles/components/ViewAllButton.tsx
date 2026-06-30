import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface ViewAllButtonProps {
  label: string;
  href: string;
}

export const ViewAllButton = ({ label, href }: ViewAllButtonProps) => {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      className="w-full mt-4"
      onClick={() => router.push(href)}
    >
      {label}
      <ChevronRight className="h-4 w-4 ml-2" />
    </Button>
  );
};
