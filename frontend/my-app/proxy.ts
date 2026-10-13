import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3009";

export async function proxy(request: NextRequest) {
  if (request.cookies.has("accessToken")) {
    return NextResponse.next();
  }

  const refreshToken = request.cookies.get("refreshToken")?.value;

  if (refreshToken) {
    try {
      const refreshResponse = await fetch(
        `${apiBaseUrl}/api/v1/auth/refresh-token`,
        {
          method: "POST",
          headers: {
            cookie: `refreshToken=${refreshToken}`,
          },
          cache: "no-store",
        }
      );

      const refreshResult = (await refreshResponse.json()) as {
        status?: boolean;
      };

      if (refreshResponse.ok && refreshResult.status === true) {
        const response = NextResponse.next();

        for (const cookie of refreshResponse.headers.getSetCookie()) {
          response.headers.append("Set-Cookie", cookie);
        }

        return response;
      }
    } catch (error) {
      console.error("Admin session refresh failed:", error);
    }
  }

  const signInUrl = new URL("/auth/signIn", request.url);
  signInUrl.searchParams.set("message", "login_required");

  return NextResponse.redirect(signInUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};