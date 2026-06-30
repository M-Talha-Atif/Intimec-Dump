"use server";

import { Locale } from "next-intl";
import { cookies } from "next/headers";

export async function changeLocaleAction(locale: Locale) {
  const cookieStore = await cookies();
  cookieStore.set("locale", locale, {
    maxAge: 60 * 60 * 24 * 365, // 1 year in seconds
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}
