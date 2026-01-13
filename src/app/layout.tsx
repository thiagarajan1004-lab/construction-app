import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppSidebar } from "@/components/app-sidebar";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Construction Business Manager",
  description: "Manage projects, agreements, and payments.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased text-zinc-900 bg-white dark:bg-zinc-950 dark:text-zinc-50`}>
        <div className="flex h-screen w-full flex-col md:flex-row bg-zinc-50 dark:bg-zinc-950">
          <AppSidebar />
          <main className="flex-1 overflow-auto h-full w-full">
            {children}
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}

