import DetailsForm from "@/components/applications/add-application/DetailsForm";
import ConnectorForm from "@/components/applications/add-application/ConnectorForm";
import SchemaForm from "@/components/applications/add-application/SchemaForm";
import CorrelationForm from "@/components/applications/add-application/CorrelationForm";
import SynchronizationPolicyForm from "@/components/applications/add-application/SynchronizationPolicyForm";
import AccessForm from "@/components/applications/add-application/AccessForm";
import VisibilityForm from "@/components/applications/add-application/VisibilityForm";
import ProvisioningForm from "@/components/applications/add-application/ProvisioningForm";

export default function Page() {
  return (
    <>
      <DetailsForm />
      <ConnectorForm />
      <SchemaForm />
      <CorrelationForm />
      <SynchronizationPolicyForm />
      <AccessForm />
      <ProvisioningForm />
      <VisibilityForm />
    </>
  );
}
