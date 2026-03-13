import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { SubAccountProvider } from "@/contexts/SubAccountContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kimi.ai | AI Agency Platform",
  description: "Build and deploy AI agents for your clients.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        <SubAccountProvider>
          <Sidebar />
          <main className="p-4 sm:ml-64 min-h-screen">
            <div className="mx-auto max-w-7xl px-4 py-8">
              {children}
            </div>
          </main>
        </SubAccountProvider>
      </body>
    </html>
  );
}
