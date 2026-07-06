import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { FileText, Lock, TriangleAlert } from "lucide-react";
import { auth } from "@/lib/auth";
import { resolveShareLink } from "@/lib/vault-share";
import { Card, CardContent } from "@/components/ui/Card";
import { ShareView } from "./ShareView";

export const metadata: Metadata = {
  title: "Archivo compartido — FreqDevTools",
};

export const dynamic = "force-dynamic";

function Message({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
        {icon}
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="max-w-sm text-sm text-muted-foreground">{text}</p>
      </CardContent>
    </Card>
  );
}

export default async function SharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const session = await auth();
  const result = await resolveShareLink(token, {
    userId: session?.user?.id,
    email: session?.user?.email,
  });

  if (result.status === "login") {
    redirect(`/login?callbackUrl=/share/${token}`);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      {result.status === "invalid" && (
        <Message
          icon={<TriangleAlert className="h-10 w-10 text-destructive" />}
          title="Link inválido"
          text="Este link no existe o fue revocado."
        />
      )}
      {result.status === "expired" && (
        <Message
          icon={<TriangleAlert className="h-10 w-10 text-destructive" />}
          title="Link vencido"
          text="Este link de compartición ha expirado."
        />
      )}
      {result.status === "forbidden" && (
        <Message
          icon={<Lock className="h-10 w-10 text-muted-foreground" />}
          title="Sin acceso"
          text="Tu cuenta no está autorizada para ver este archivo. Contacta a quien lo compartió."
        />
      )}
      {result.status === "ok" && (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold tracking-tight">{result.name}</h1>
          </div>
          <ShareView name={result.name} content={result.content} />
        </div>
      )}
    </div>
  );
}
