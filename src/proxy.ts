import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

// Instancia edge-safe (sin Prisma) solo para leer la sesión del JWT.
const { auth } = NextAuth(authConfig);

// Rutas que requieren sesión iniciada.
const PROTECTED = ["/credentials", "/env", "/workflows", "/skills/new"];
// Rutas que requieren rol ADMIN.
const ADMIN_ONLY = ["/admin"];
// Rutas de auth: si ya hay sesión, redirigir al inicio.
const AUTH_PAGES = ["/login", "/register"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;
  const isLoggedIn = !!session?.user;

  if (AUTH_PAGES.some((p) => pathname.startsWith(p)) && isLoggedIn) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  const needsAdmin = ADMIN_ONLY.some((p) => pathname.startsWith(p));
  const needsAuth =
    needsAdmin || PROTECTED.some((p) => pathname.startsWith(p));

  if (needsAuth && !isLoggedIn) {
    const url = new URL("/login", req.nextUrl);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  if (needsAdmin && session?.user?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  // Excluye estáticos, imágenes y la API de auth.
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
