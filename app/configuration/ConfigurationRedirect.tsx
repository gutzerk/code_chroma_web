"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ConfigurationRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/documentation#settings");
  }, [router]);

  return (
    <div className="max-w-3xl pt-12 pb-24">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">Settings moved</h1>
      <p className="mt-4 text-lg leading-relaxed text-[color:var(--text-2)]">
        Configuration is now part of the documentation.{" "}
        <Link href="/documentation#settings" className="text-[color:var(--accent)] underline underline-offset-2">
          Go to Settings
        </Link>
        .
      </p>
    </div>
  );
}
