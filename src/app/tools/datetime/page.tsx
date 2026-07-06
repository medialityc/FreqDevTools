import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { DateTimeTool } from "./DateTimeTool";

export const metadata: Metadata = {
  title: "Conversor de fecha (DateTime C#) — FreqDevTools",
};

export default function DateTimePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <PageHeader
        title="Conversor de fecha a DateTime"
        description="Elige fecha y hora en el calendario y conviértela a formatos de C#/.NET, ISO, Unix y ticks."
      />
      <DateTimeTool />
    </div>
  );
}
