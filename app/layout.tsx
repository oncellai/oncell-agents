import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Coding Agents — Generate code with AI | coding.oncell.ai",
  description: "Free AI coding agents. Generate HTML apps, React components, AWS CDK infrastructure, REST APIs, and code reviews. No signup required. Powered by OnCell.",
  metadataBase: new URL("https://coding.oncell.ai"),
  openGraph: {
    title: "AI Coding Agents — coding.oncell.ai",
    description: "Free AI agents that write production code. No signup required.",
    siteName: "OnCell Coding Agents",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Coding Agents — coding.oncell.ai",
    description: "Free AI agents that write production code. No signup required.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
