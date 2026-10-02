import type { Metadata } from "next";
import InstallTabs from "@/components/InstallTabs";

export const metadata: Metadata = {
  title: "Install — CodeChroma",
  description:
    "Install CodeChroma on macOS, Linux, or Windows — copy the command for Homebrew, APT, a curl script, or winget.",
};

export default function InstallPage() {
  return (
    <main className="mx-auto w-full max-w-[110rem] flex-1 px-5 sm:px-10 lg:px-6">
      <div className="max-w-5xl pt-12 pb-24">
        <InstallTabs />
      </div>
    </main>
  );
}
