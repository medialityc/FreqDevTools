import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { NewSkillForm } from "./NewSkillForm";

export const metadata: Metadata = {
  title: "Publicar skill — FreqDevTools",
};

export default function NewSkillPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <PageHeader title="Publicar skill" description="Comparte una skill .md con la comunidad." />
      <Card>
        <CardContent>
          <NewSkillForm />
        </CardContent>
      </Card>
    </div>
  );
}
