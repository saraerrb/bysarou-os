import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/auth";

// Define role-based access rules
const ROLE_PERMISSIONS: Record<string, string[]> = {
  ADMIN: ["/"], // Admin can go anywhere
  MANAGER: ["/", "/inventory", "/orders", "/shipping"],
  CALL_AGENT: ["/confirmation"],
  WAREHOUSE: ["/inventory", "/shipping"],
  FINANCE: ["/finance"],
};

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // 1. Skip auth for login, register-admin and public assets
  const publicPaths = ["/login", "/register-admin", "/api/auth"];
  const isPublic = publicPaths.some(p => path === p || path.startsWith(p));
  
  if (isPublic || path.startsWith("/_next")) {
    return NextResponse.next();
  }

  // 2. Check for session cookie
  const session = request.cookies.get("session")?.value;

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const payload = await decrypt(session);
    const userRole = payload.role;

    // 3. Simple Dashboard Redirection logic (if at root)
    if (path === "/") {
      if (userRole === "CALL_AGENT") return NextResponse.redirect(new URL("/confirmation", request.url));
      if (userRole === "FINANCE") return NextResponse.redirect(new URL("/finance", request.url));
      return NextResponse.next();
    }

    // 4. RBAC Protection
    if (userRole !== "ADMIN") {
      const allowedPaths = ROLE_PERMISSIONS[userRole] || [];
      const isAllowed = allowedPaths.some(p => path.startsWith(p));
      
      if (!isAllowed) {
        // Redirect to their primary dashboard if they try to access forbidden areas
        const redirectUrl = allowedPaths[0] || "/login";
        return NextResponse.redirect(new URL(redirectUrl, request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware auth error:", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
