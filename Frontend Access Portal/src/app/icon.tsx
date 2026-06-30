import path from "path";
import { promises as fs } from "fs";

// Image metadata
export const size = {
  width: 32,
  height: 32,
};

const API_URL = process.env.API_URL;

export default async function Icon() {
  try {
    const response = await fetch(
      `${API_URL}/artifacts/ui_customization/theme/artifacts/favicon/file`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch favicon: ${response.status}`);
    }

    const data = await response.arrayBuffer();
    return new Response(data, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600", // optional
      },
    });
  } catch {
    const filePath = path.join(process.cwd(), "public", "image.png");
    const fileBuffer = await fs.readFile(filePath);
    const data = new Uint8Array(fileBuffer);

    return new Response(data, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600",
      },
    });
  }
}
