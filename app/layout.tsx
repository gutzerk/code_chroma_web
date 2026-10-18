import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import Nav from "@/components/Nav";
import PreAlphaNote from "@/components/PreAlphaNote";
import Footer from "@/components/Footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  title: "CodeChroma — Navigate any codebase like a map, not a maze",
  description:
    "CodeChroma turns a repository into a zoomable, semantic architecture map — System → Pillar → Component → Service → Function → Logic Block. Built for humans and AI agents navigating LLM-era code.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Script src={`${BASE_PATH}/reset-demo-state.js`} strategy="beforeInteractive" />
        <Nav />
        <PreAlphaNote />
        {children}
        <Footer />
      </body>
    </html>
  );
}
