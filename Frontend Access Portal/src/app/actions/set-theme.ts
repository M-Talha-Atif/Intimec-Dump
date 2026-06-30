// app/actions/theme.ts
"use server";

import { cookies } from "next/headers";

export async function setThemeAction(theme: "light" | "dark" | "system") {
  const cookieStore = await cookies();
  cookieStore.set("theme", theme, {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}
