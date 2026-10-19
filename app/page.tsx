import HomeDemo from "@/components/home/HomeDemo";
import HomeSections from "@/components/home/HomeSections";
import "@/components/home/home.css";

export default function Home() {
  return (
    <main className="cch flex-1">
      <HomeDemo />
      <HomeSections />
    </main>
  );
}
