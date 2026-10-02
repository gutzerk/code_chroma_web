import type { Metadata } from "next";
import DocsShowcase from "@/components/DocsShowcase";

export const metadata: Metadata = {
  title: "Documentation — CodeChroma",
  description:
    "How the CodeChroma canvas works: a quick start, the architecture map, controls, agents, diagrams, keyboard reference, and troubleshooting.",
};

export default function DocumentationPage() {
  return (
    <main className="mx-auto w-full max-w-[110rem] flex-1 px-5 sm:px-10 lg:px-6">
      <DocsShowcase />
    </main>
  );
}
