import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { CredentialsManager } from "./CredentialsManager";
import type { CredentialView } from "./CredentialForm";

export const metadata: Metadata = {
  title: "Credenciales — FreqDevTools",
};

export const dynamic = "force-dynamic";

export default async function CredentialsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/credentials");

  // Solo metadatos: el secreto cifrado nunca se envía al cliente aquí.
  const rows = await prisma.credential.findMany({
    where: { userId: session.user.id },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      domain: true,
      username: true,
      notes: true,
      createdAt: true,
    },
  });

  const credentials: CredentialView[] = rows.map((c) => ({
    id: c.id,
    name: c.name,
    domain: c.domain,
    username: c.username,
    notes: c.notes,
    createdAt: c.createdAt.toISOString(),
  }));

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <PageHeader
        title="Gestor de credenciales"
        description="Tus credenciales se guardan cifradas (AES-256-GCM) y se descifran solo bajo demanda."
      />
      <CredentialsManager credentials={credentials} />
    </div>
  );
}
