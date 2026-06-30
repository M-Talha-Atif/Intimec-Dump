import { NextRequest, NextResponse } from "next/server";
import { _getAuthToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { apiFetch } from "@/lib/server/apiFetch";
import { UIConfig } from "@/types/UIConfig";
import { wrapRoute } from "@/lib/server/wrapRoute";

const API_URL = `${process.env.API_URL}`;

export const GET = wrapRoute(async () => {
  const urlConfig = `${API_URL}/configurations/ui_customization/theme`;
  const urlLogoLight = `${API_URL}/artifacts/ui_customization/theme/artifacts/logoLight/file`;
  const urlLogoDark = `${API_URL}/artifacts/ui_customization/theme/artifacts/logoDark/file`;
  const urlFavicon = `${API_URL}/artifacts/ui_customization/theme/artifacts/favicon/file`;
  const urlLoginBackground = `${API_URL}/artifacts/ui_customization/theme/artifacts/loginBackground/file`;
  const urlLoginBackgroundDark = `${API_URL}/artifacts/ui_customization/theme/artifacts/loginBackgroundDark/file`;

  const safeBase64 = async (result: PromiseSettledResult<Response>): Promise<string> => {
    if (result.status === "rejected") return "";
    try {
      return Buffer.from(await result.value.arrayBuffer()).toString("base64");
    } catch {
      return "";
    }
  };

  // Parallel requests — config is required, artifacts are optional (missing artifact must not 500 the whole route)
  const [configResult, lightResult, darkResult, faviconResult, bgResult, bgDarkResult] =
    await Promise.allSettled([
      apiFetch<{ data: UIConfig }>(urlConfig, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }),
      apiFetch.raw(urlLogoLight, { method: "GET" }),
      apiFetch.raw(urlLogoDark, { method: "GET" }),
      apiFetch.raw(urlFavicon, { method: "GET" }),
      apiFetch.raw(urlLoginBackground, { method: "GET" }),
      apiFetch.raw(urlLoginBackgroundDark, { method: "GET" }),
    ]);

  if (configResult.status === "rejected") throw configResult.reason;
  const configData = configResult.value;

  const logoLightRet = await safeBase64(lightResult);
  const logoDarkRet = await safeBase64(darkResult);
  const faviconRet = await safeBase64(faviconResult);
  const loginBackgroundRet = await safeBase64(bgResult);
  const loginBackgroundDarkRet = await safeBase64(bgDarkResult);

  configData.data.loginPage.backgroundImageData = {
    url: loginBackgroundRet,
    mime: "image/png",
    fileName: "image",
    fromApi: true,
  };
  configData.data.loginPage.backgroundImageDarkData = {
    url: loginBackgroundDarkRet,
    mime: "image/png",
    fileName: "image",
    fromApi: true,
  };
  configData.data.branding.logoLightData = {
    url: logoLightRet,
    mime: "image/png",
    fileName: "image",
    fromApi: true,
  };
  configData.data.branding.logoDarkData = {
    url: logoDarkRet,
    mime: "image/png",
    fileName: "image",
    fromApi: true,
  };
  configData.data.branding.faviconData = {
    url: faviconRet,
    mime: "image/png",
    fileName: "image",
    fromApi: true,
  };
  return NextResponse.json({ data: configData.data });
});

export async function PUT(request: NextRequest) {
  try {
    const token = await _getAuthToken();
    if (!token) {
      return NextResponse.json(
        { error: "No authentication token available" },
        { status: 401 },
      );
    }
    console.log("Token available:", !!token);
    // Read JSON body from request

    const formData = await request.formData();
    const configRaw = formData.get("config") as string;

    // Create payload structure that matches working Postman request
    const body = {
      data: JSON.parse(configRaw),
    };
    console.log("PUT Theme body:", JSON.stringify(body, null, 2));
    console.log("Raw config from form:", configRaw);

    const logoLight = formData.get("logoLight") as File | null;
    const logoDark = formData.get("logoDark") as File | null;
    const favicon = formData.get("favicon") as File | null;
    const loginBackgroundImage = formData.get(
      "loginBackgroundImage",
    ) as File | null;
    const loginBackgroundImageDark = formData.get(
      "loginBackgroundImageDark",
    ) as File | null;
    const urlConfig = `${API_URL}/configurations/ui_customization/theme`;
    const urlLogoLight = `${API_URL}/artifacts/ui_customization/theme/artifacts/logoLight/file`;
    const urlLogoDark = `${API_URL}/artifacts/ui_customization/theme/artifacts/logoDark/file`;
    const urlFavicon = `${API_URL}/artifacts/ui_customization/theme/artifacts/favicon/file`;
    const urlLoginBackground = `${API_URL}/artifacts/ui_customization/theme/artifacts/loginBackground/file`;
    const urlLoginBackgroundDark = `${API_URL}/artifacts/ui_customization/theme/artifacts/loginBackgroundDark/file`;

    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session_id")?.value;

    const configHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
    if (sessionId) {
      configHeaders["X-Session-Id"] = sessionId;
    }

    const fileHeaders: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      "content-type": "application/octet-stream",
    };
    if (sessionId) {
      fileHeaders["X-Session-Id"] = sessionId;
    }

    const apiArr: Promise<Response>[] = [
      fetch(urlConfig, {
        method: "PUT",
        headers: configHeaders,
        body: JSON.stringify(body),
      }),
    ];

    if (logoLight !== null && logoLight !== undefined) {
      apiArr.push(
        fetch(urlLogoLight, {
          method: "PUT",
          headers: fileHeaders,
          body: logoLight,
        }),
      );
    }
    if (logoDark !== null && logoDark !== undefined) {
      apiArr.push(
        fetch(urlLogoDark, {
          method: "PUT",
          headers: fileHeaders,
          body: logoDark,
        }),
      );
    }
    if (favicon !== null && favicon !== undefined) {
      apiArr.push(
        fetch(urlFavicon, {
          method: "PUT",
          headers: fileHeaders,
          body: favicon,
        }),
      );
    }
    if (loginBackgroundImage !== null && loginBackgroundImage !== undefined) {
      apiArr.push(
        fetch(urlLoginBackground, {
          method: "PUT",
          headers: fileHeaders,
          body: loginBackgroundImage,
        }),
      );
    }
    if (
      loginBackgroundImageDark !== null &&
      loginBackgroundImageDark !== undefined
    ) {
      apiArr.push(
        fetch(urlLoginBackgroundDark, {
          method: "PUT",
          headers: fileHeaders,
          body: loginBackgroundImageDark,
        }),
      );
    }

    const resArr = await Promise.all(apiArr);
    console.log("PUT Theme responses count:", resArr.length);

    // Log each response
    for (const [index, res] of resArr.entries()) {
      console.log(`Response ${index}: Status ${res.status}, URL: ${res.url}`);
      if (!res.ok) {
        const errorText = await res.text();
        console.error(`Theme PUT API Error (${res.status}):`, errorText);
        return NextResponse.json(
          {
            error: `Failed to put theme configuration: ${res.status} ${res.statusText}`,
          },
          { status: res.status },
        );
      } else {
        // Log successful responses
        try {
          const responseText = await res.text();
          console.log(`Response ${index} body:`, responseText);

          // Try to parse as JSON to see structure
          if (responseText) {
            try {
              const responseJson = JSON.parse(responseText);
              console.log(`Response ${index} parsed JSON:`, responseJson);
            } catch {
              console.log(`Response ${index}: Not JSON format`);
            }
          }
        } catch {
          console.log(`Response ${index}: No body content`);
        }
      }
    }
    return NextResponse.json({ status: true });
  } catch (error) {
    console.error("Theme GET proxy error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
