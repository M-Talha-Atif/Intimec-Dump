import { FormLabel } from "@/components/ui/form";

export default function RequiredFormLabel({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FormLabel className="gap-0">
      {children}
      <span className="text-red-500">*</span>
    </FormLabel>
  );
}
