import { FinalFormDataOutput } from "@/types/add-application";
import useSWR from "swr";

export type SuccessResult = {
  message: string;
  warns: { field: string; message: string }[];
};
export type ErrorResult = SuccessResult & {
  errors: { field: string; message: string }[];
};

export const useApplicationValidation = (config: FinalFormDataOutput | null) =>
  useSWR<SuccessResult, ErrorResult>(
    config
      ? ["/api/applications/add-application/validate-config", config]
      : null,
    async ([key, config]: [string, FinalFormDataOutput]) => {
      const response = await fetch(key, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ config }),
      });
      const data = (await response.json()) as
        | SuccessResult
        | { status: number; data: ErrorResult };
      console.log("data: ", data);

      if (!response.ok) {
        throw (data as { status: number; data: ErrorResult })
          .data as ErrorResult;
      }
      return data as SuccessResult;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    },
  );
