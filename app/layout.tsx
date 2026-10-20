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

const TITLE = "CodeChroma — Vibe-code at full speed, stay in control";
const DESCRIPTION =
  "Design in process diagrams, let AI agents build in parallel, and review the result on the same map. CodeChroma is a local desktop app that keeps you in control of the whole picture without reading every file.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, type: "website", siteName: "CodeChroma" },
  twitter: { card: "summary", title: TITLE, description: DESCRIPTION },
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
