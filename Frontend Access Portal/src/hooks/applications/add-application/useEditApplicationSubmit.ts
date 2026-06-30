import useSWRMutation from "swr/mutation";
import { formDataPostFetcher } from "../fetcher";
import { FinalFormDataOutput } from "@/types/add-application";

export default function useEditApplicationSubmit(args: {
  onSuccess?: (data: unknown) => void;
  onError?: (error: Error) => void;
}) {
  const {
    trigger: submitForm,
    isMutating,
    error,
  } = useSWRMutation<unknown, Error, string, FinalFormDataOutput>(
    "/api/applications/edit-application",
    (url: string, { arg }) => {
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
        JSON.stringify(arg.attributeMappings || {}),
      );
      if (icon) {
        formdata.append("icon", icon);
      }
      return formDataPostFetcher("Failed to edit application")(url, {
        arg: formdata,
      });
    },
    args,
  );

  return { submitForm, isLoading: isMutating, error };
}
