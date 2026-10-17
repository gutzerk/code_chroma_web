import Showcase from "@/components/Showcase";
import CodeArchitectureHero from "@/components/CodeArchitectureHero";
import ProcessPlayground from "@/components/ProcessPlayground";

export default function Home() {
  return (
    <main className="flex-1">
      <CodeArchitectureHero />
      <ProcessPlayground />
      <Showcase />
    </main>
  );
}
