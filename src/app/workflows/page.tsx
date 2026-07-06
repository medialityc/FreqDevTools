import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUserFiles } from "@/lib/vault-queries";
import { VAULT_CONFIG } from "@/lib/vault";
import { PageHeader } from "@/components/PageHeader";
import { VaultManager } from "@/components/vault/VaultManager";

export const metadata: Metadata = {
  title: "Workflows de GitHub Actions — FreqDevTools",
};

export const dynamic = "force-dynamic";

export default async function WorkflowsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/workflows");

  const config = VAULT_CONFIG.WORKFLOW;
  const files = await getUserFiles(session.user.id, "WORKFLOW");

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <PageHeader title={config.title} description={config.description} />
      <VaultManager config={config} files={files} />
    </div>
  );
}
