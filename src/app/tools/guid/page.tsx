import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { GuidTool } from "./GuidTool";

export const metadata: Metadata = {
  title: "Generador de GUID — FreqDevTools",
};

export default function GuidPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <PageHeader
        title="Generador de GUID"
        description="Genera UUID v1, v4 o v7 con formato configurable y salida en lista o JSON."
      />
      <GuidTool />
    </div>
  );
}
