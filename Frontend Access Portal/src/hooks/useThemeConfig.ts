import { defaultConfig } from "@/components/settings/ui-configurator/defaultConfig";
import { getFetcher } from "@/hooks/applications/fetcher";
import { UIConfig } from "@/types/UIConfig";
import { toast } from "sonner";
import useSWR from "swr";

type ApiResponse = {
  data: UIConfig;
};

async function urlToFile(
  url: string,
  fileName: string,
  mimeType: string,
): Promise<File | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.status}`);
    }
    const blob = await response.blob();
    return new File([blob], fileName, { type: mimeType });
  } catch {
    return null;
  }
}

async function processImageData(
  imageData:
    | { url?: string; fileName?: string; mime?: string; fromApi?: boolean }
    | undefined,
  formData: FormData,
  fieldName: string,
) {
  if (
    imageData &&
    imageData.url &&
    imageData.fileName &&
    imageData.mime &&
    imageData.fromApi === false
  ) {
    const file = await urlToFile(imageData.url, imageData.fileName, imageData.mime);
    if (file) {
      formData.append(fieldName, file);
    } else {
      console.warn(`Failed to convert URL to file for ${fieldName}`);
    }
  }

  // Clear the local blob URL after processing — server URL will come back via revalidation
  if (imageData?.url) {
    imageData.url = undefined;
  }
}

export default function useThemeConfig() {
  const {
    isLoading,
    error,
    data: response,
    mutate,
  } = useSWR<ApiResponse>(
    `/api/ui`,
    getFetcher("Failed to fetch theme config"),
    {
      fallbackData: { data: defaultConfig } as ApiResponse,
      shouldRetryOnError: false,
      // Prevent focus-triggered revalidation from racing with a just-saved config
      // and momentarily reverting CSS variables to stale server data.
      revalidateOnFocus: false,
      onError: () => { /* suppress console noise — fallbackData handles the UI */ },
    },
  );

  async function updateTheme(newTheme: UIConfig) {
    const formData = new FormData();

    // Process all image fields — converts local blob URLs to File objects for multipart upload
    await processImageData(newTheme.branding.logoLightData, formData, "logoLight");
    await processImageData(newTheme.branding.logoDarkData, formData, "logoDark");
    await processImageData(newTheme.branding.faviconData, formData, "favicon");
    await processImageData(newTheme.loginPage.backgroundImageData, formData, "loginBackgroundImage");
    await processImageData(newTheme.loginPage.backgroundImageDarkData, formData, "loginBackgroundImageDark");

    formData.append("config", JSON.stringify(newTheme));

    try {
      const res = await fetch("/api/ui", {
        method: "PUT",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      // Immediately update the SWR cache with the saved config so ThemeProvider's
      // useEffect fires right now with the correct data, applying CSS variables
      // before the toast appears. revalidate: false avoids a redundant GET that
      // would race and potentially flash the old theme.
      await mutate({ data: newTheme }, { revalidate: false });

      toast("Saved successfully ✅", {
        description: "Your data has been saved.",
      });
    } catch (err) {
      console.error("Failed to update theme:", err);

      // On error, revalidate to restore the last known good server state
      mutate();

      toast("Save failed ❌", {
        description: `${err instanceof Error ? err.message : "Please try again later."}`,
      });
    }
  }

  return {
    isLoading,
    error,
    data: response?.data,
    refresh: () => mutate(undefined, { revalidate: true }),
    updateTheme,
  };
}