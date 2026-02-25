import Link from "next/link";
import { ArrowRight, Database } from "lucide-react";

export default function Home() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
          <Database className="h-3.5 w-3.5" />
          Prototype In Progress
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Stardex Legacy Data Onboarding
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          This prototype ingests legacy CSV headers, groups redundant custom
          fields, and generates a migration script for a clean schema.
        </p>
        <div className="mt-6">
          <Link
            href="/onboarding"
            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
          >
            Open Data Onboarding
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
