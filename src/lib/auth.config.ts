import type { NextAuthConfig } from "next-auth";
import type { Role } from "@/generated/prisma/enums";

// Configuración edge-safe (sin acceso a base de datos): se usa en el
// middleware y como base de la config completa en auth.ts. Los providers
// que requieren Node (Credentials + Prisma) se añaden en auth.ts.
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    // Propaga id/role al token en el login y en refrescos.
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
      }
      return token;
    },
    // Expone id/role en la sesión del cliente/servidor.
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
