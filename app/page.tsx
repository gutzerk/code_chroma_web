import Showcase from "@/components/Showcase";
import CodeArchitectureHero from "@/components/CodeArchitectureHero";

export default function Home() {
  return (
    <main className="flex-1">
      <CodeArchitectureHero />
      <Showcase />
    </main>
  );
}
