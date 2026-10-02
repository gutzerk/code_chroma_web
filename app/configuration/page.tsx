import type { Metadata } from "next";
import ConfigurationShowcase from "@/components/ConfigurationShowcase";

export const metadata: Metadata = {
  title: "Configuration — CodeChroma",
  description:
    "Every CodeChroma configuration, explained: LLM provider and model for agents, appearance, default diagram views, and more.",
};

export default function ConfigurationPage() {
  return (
    <main className="mx-auto w-full max-w-[110rem] flex-1 px-5 sm:px-10 lg:px-6">
      <ConfigurationShowcase />
    </main>
  );
}
