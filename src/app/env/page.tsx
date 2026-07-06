import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUserEnvFiles } from "@/lib/env-queries";
import { PageHeader } from "@/components/PageHeader";
import { EnvManager } from "./EnvManager";

export const metadata: Metadata = {
  title: "Variables de entorno — FreqDevTools",
};

export const dynamic = "force-dynamic";

export default async function EnvPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/env");

  const files = await getUserEnvFiles(session.user.id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <PageHeader
        title="Variables de entorno"
        description="Guarda tus archivos .env cifrados y compártelos por link con control de acceso."
      />
      <EnvManager files={files} />
    </div>
  );
}
