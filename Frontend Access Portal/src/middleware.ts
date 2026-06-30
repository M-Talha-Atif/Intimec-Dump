// /middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { _isAuthenticated } from "@/lib/auth"; // Assuming the refactored file is at this path

const PUBLIC_PATHS = ["/"]; // Renamed for clarity
const PROTECTED_ROUTES = [
  "/dashboard",
  "/settings",
  "/applications",
  "/debugging",
  "/auditlogs",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublicRoute = PUBLIC_PATHS.includes(pathname);
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  const authenticated = await _isAuthenticated();

  // Ensure a default locale cookie exists
  const LOCALE_COOKIE = "locale";
  const DEFAULT_LOCALE = "en";
  const hasLocale = request.cookies.has(LOCALE_COOKIE);

  // Redirect authenticated users from public-only pages (e.g., login page) to the dashboard.
  if (authenticated && isPublicRoute) {
    const res = NextResponse.redirect(new URL("/dashboard", request.url));
    if (!hasLocale) {
      res.cookies.set({
        name: LOCALE_COOKIE,
        value: DEFAULT_LOCALE,
        path: "/",
        httpOnly: false,
        sameSite: "lax",
      });
    }
    return res;
  }

  // Redirect unauthenticated users from protected pages to the login page.
  if (!authenticated && isProtectedRoute) {
    const res = NextResponse.redirect(new URL("/", request.url));
    if (!hasLocale) {
      res.cookies.set({
        name: LOCALE_COOKIE,
        value: DEFAULT_LOCALE,
        path: "/",
        httpOnly: false,
        sameSite: "lax",
      });
    }
    return res;
  }

  // Add security headers to prevent client-side caching of sensitive pages.
  const response = NextResponse.next();
  if (!hasLocale) {
    response.cookies.set({
      name: LOCALE_COOKIE,
      value: DEFAULT_LOCALE,
      path: "/",
      httpOnly: false,
      sameSite: "lax",
    });
  }
  response.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  response.headers.set("X-Pathname", request.url);
  return response;
}

// Matcher configuration remains the same. It's well-defined.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public|api/(?!auth/verify)).*)",
  ],
};
