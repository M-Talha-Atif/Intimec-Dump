import useSWRMutation from "swr/mutation";
import { formDataPostFetcher, formDataPutFetcher } from "../fetcher";
import { FinalFormDataOutput } from "@/types/add-application";

function buildFormData(arg: FinalFormDataOutput): FormData {
  const formdata = new FormData();
  const { icon, ...detailsWithoutIcon } = arg.details || {};
  formdata.append("details", JSON.stringify(detailsWithoutIcon));
  formdata.append("connector", JSON.stringify(arg.connector || {}));
  formdata.append("schema", JSON.stringify(arg.schema || {}));
  formdata.append("correlation", JSON.stringify(arg.correlation || {}));
  formdata.append("access", JSON.stringify(arg.access || {}));
  formdata.append("visibility", JSON.stringify(arg.visibility || {}));
  formdata.append("provisioning", JSON.stringify(arg.provisioning || {}));
  formdata.append(
    "attributeMappings",
    JSON.stringify(arg.attributeMappings || {})
  );
  if (arg.synchronizationPolicy) {
    formdata.append(
      "synchronizationPolicy",
      JSON.stringify(arg.synchronizationPolicy)
    );
  }
  if (icon) {
    formdata.append("icon", icon);
  }
  return formdata;
}

export default function useFormSubmit({
  onSuccess,
  onError,
  mode = "create",
  applicationId,
}: {
  onSuccess?: (data: unknown) => void;
  onError?: (error: Error) => void;
  mode?: "create" | "edit";
  applicationId?: string;
}) {
  const url =
    mode === "edit" && applicationId
      ? `/api/applications/${applicationId}`
      : "/api/applications/add-application";

  const fetcher =
    mode === "edit"
      ? formDataPutFetcher("Failed to update application")
      : formDataPostFetcher("Failed to create application");

  const {
    trigger: submitForm,
    isMutating,
    error,
  } = useSWRMutation<unknown, Error, string, FinalFormDataOutput>(
    url,
    (swrUrl: string, { arg }) => {
      return fetcher(swrUrl, { arg: buildFormData(arg) });
    },
    {
      onSuccess,
      onError,
    }
  );

  return { submitForm, isLoading: isMutating, error };
}
