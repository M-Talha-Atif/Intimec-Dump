import CustomBadge from "@/components/applications/common/CustomBadge";

export default function AuthoritativeStateBadge({
  authoritative,
}: {
  authoritative: boolean;
}) {
  return (
    <CustomBadge color="blue">
      {authoritative ? "Authoritative" : "Non-Authoritative"}
    </CustomBadge>
  );
}
