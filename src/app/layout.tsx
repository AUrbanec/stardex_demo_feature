import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import {
  Building,
  Database,
  LayoutDashboard,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
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
  title: "Stardex Onboarding",
  description: "AI-powered schema consolidator for legacy ATS exports",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex h-screen bg-slate-50 text-slate-900">
          <aside className="hidden w-64 border-r border-slate-200 bg-white md:flex md:flex-col">
            <div className="flex h-16 items-center border-b border-slate-200 px-6">
              <Sparkles className="mr-2 h-5 w-5 text-indigo-600" />
              <span className="text-lg font-bold tracking-tight">Stardex</span>
            </div>
            <nav className="flex-1 space-y-1 p-4">
              <a
                href="#"
                className="flex items-center rounded-md px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                <LayoutDashboard className="mr-3 h-4 w-4" />
                Home
              </a>
              <a
                href="#"
                className="flex items-center rounded-md px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                <Users className="mr-3 h-4 w-4" />
                Candidates
              </a>
              <a
                href="#"
                className="flex items-center rounded-md px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                <Building className="mr-3 h-4 w-4" />
                Companies
              </a>
              <div className="px-3 pb-2 pt-4 text-xs font-semibold uppercase text-slate-400">
                Admin
              </div>
              <Link
                href="/onboarding"
                className="flex items-center rounded-md bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700"
              >
                <Database className="mr-3 h-4 w-4 text-indigo-600" />
                Data Onboarding
              </Link>
            </nav>
          </aside>

          <main className="flex h-screen flex-1 flex-col overflow-hidden">
            <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-8">
              <div className="flex w-full max-w-md items-center rounded-md border border-slate-200 bg-slate-100 px-3 py-1.5 text-sm text-slate-500">
                <Search className="mr-2 h-4 w-4" />
                Search candidates, jobs, notes...
                <span className="ml-auto rounded border border-slate-300 bg-white px-1.5 py-0.5 text-xs">
                  ⌘K
                </span>
              </div>
              <div className="ml-4 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                JD
              </div>
            </header>
            <div className="flex-1 overflow-auto p-4 md:p-8">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
