"use client";

import { useState } from "react";
import Papa from "papaparse";
import { useDropzone } from "react-dropzone";
import { Code, FileUp, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type Mapping = {
  target_field: string;
  data_type: "string" | "boolean" | "integer" | "date";
  source_fields: string[];
  reasoning?: string;
  approved: boolean;
};

export default function DataOnboardingPage() {
  const [analyzing, setAnalyzing] = useState(false);
  const [mappings, setMappings] = useState<Mapping[]>([]);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const analyzeHeaders = async (headers: string[] | undefined) => {
    if (!headers || headers.length === 0) {
      setErrorMessage("No CSV headers were found. Please upload a valid CSV file.");
      return;
    }

    setAnalyzing(true);
    setGeneratedCode(null);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/analyze-schema", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ headers }),
      });

      const data = (await response.json()) as {
        mappings?: Array<Omit<Mapping, "approved">>;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "Schema analysis failed");
      }

      const mapped = (data.mappings || []).map((mapping) => ({
        ...mapping,
        approved: true,
      }));
      setMappings(mapped);

      if (mapped.length === 0) {
        setErrorMessage(
          "No custom fields were identified in that file. Try a richer export.",
        );
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unexpected error during analysis",
      );
      setMappings([]);
    } finally {
      setAnalyzing(false);
    }
  };

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      preview: 1,
      complete: async (results) => {
        const headers = results.meta.fields || [];
        await analyzeHeaders(headers);
      },
      error: (error) => {
        setErrorMessage(`CSV parsing failed: ${error.message}`);
      },
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".csv"],
    },
  });

  const handleGenerateScript = () => {
    const approvedMappings = mappings.filter((mapping) => mapping.approved);

    let tsCode =
      "// Generated Stardex Migration ETL Script\n" +
      "import { db } from './stardex-db';\n\n" +
      "export async function migrateLegacyData(legacyData: any[]) {\n" +
      '  console.log("Starting Stardex Migration...");\n\n' +
      "  const formattedData = legacyData.map((row) => {\n" +
      "    return {\n";

    for (const mapping of approvedMappings) {
      const sourceKey = mapping.source_fields[0];
      if (!sourceKey) continue;

      if (mapping.data_type === "boolean") {
        tsCode += `      ${mapping.target_field}: ['yes', 'true', '1'].includes(String(row[${JSON.stringify(
          sourceKey,
        )}] ?? '').trim().toLowerCase()),\n`;
      } else if (mapping.data_type === "integer") {
        tsCode += `      ${mapping.target_field}: Number.parseInt(String(row[${JSON.stringify(
          sourceKey,
        )}] ?? '0'), 10) || 0,\n`;
      } else if (mapping.data_type === "date") {
        tsCode += `      ${mapping.target_field}: row[${JSON.stringify(
          sourceKey,
        )}] ? new Date(row[${JSON.stringify(sourceKey)}]) : null,\n`;
      } else {
        tsCode += `      ${mapping.target_field}: row[${JSON.stringify(
          sourceKey,
        )}] || null,\n`;
      }
    }

    tsCode +=
      "    };\n" +
      "  });\n\n" +
      "  // Insert into optimized Stardex schema\n" +
      "  await db.insert(candidates).values(formattedData);\n" +
      "  console.log(`Successfully migrated ${formattedData.length} records!`);\n" +
      "}\n";

    setGeneratedCode(tsCode);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Data Onboarding: Schema Consolidator
        </h1>
        <p className="mt-1 text-slate-500">
          Upload a legacy CSV export. Stardex AI Dex consolidates redundant
          custom fields into a clean schema.
        </p>
      </div>

      {errorMessage && (
        <Card className="border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {errorMessage}
        </Card>
      )}

      {!mappings.length && !analyzing && !generatedCode && (
        <Card
          {...getRootProps()}
          className={cn(
            "cursor-pointer border-dashed p-12 transition-colors",
            "flex flex-col items-center justify-center",
            isDragActive ? "border-indigo-500 bg-indigo-50" : "hover:bg-slate-50",
          )}
        >
          <input {...getInputProps()} />
          <FileUp className="mb-4 h-10 w-10 text-slate-400" />
          <p className="font-medium text-slate-700">
            Drag and drop a legacy CSV export
          </p>
          <p className="mt-1 text-sm text-slate-500">
            We only inspect headers, then infer consolidated schema mappings.
          </p>
        </Card>
      )}

      {analyzing && (
        <Card className="flex flex-col items-center justify-center space-y-4 p-12">
          <Sparkles className="h-8 w-8 animate-pulse text-indigo-600" />
          <p className="font-medium">
            Dex AI is applying high reasoning effort to analyze legacy fields...
          </p>
        </Card>
      )}

      {mappings.length > 0 && !generatedCode && (
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 font-medium text-slate-600">
                      Proposed Stardex Field
                    </th>
                    <th className="px-6 py-3 font-medium text-slate-600">
                      Legacy Source Fields (Consolidated)
                    </th>
                    <th className="px-6 py-3 font-medium text-slate-600">Type</th>
                    <th className="px-6 py-3 text-right font-medium text-slate-600">
                      Approve
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {mappings.map((mapping, index) => (
                    <tr key={`${mapping.target_field}-${index}`} className="bg-white">
                      <td className="flex items-center px-6 py-4 font-mono text-indigo-700">
                        <Sparkles className="mr-2 h-3 w-3 text-indigo-400" />
                        {mapping.target_field}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {mapping.source_fields.map((sourceField) => (
                            <Badge
                              key={`${mapping.target_field}-${sourceField}`}
                              variant="secondary"
                            >
                              {sourceField}
                            </Badge>
                          ))}
                        </div>
                        {mapping.reasoning && (
                          <p className="mt-2 text-xs text-slate-500">
                            {mapping.reasoning}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 capitalize text-slate-500">
                        {mapping.data_type}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Switch
                          checked={mapping.approved}
                          onCheckedChange={(checked) => {
                            setMappings((prev) =>
                              prev.map((current, currentIndex) =>
                                currentIndex === index
                                  ? { ...current, approved: checked }
                                  : current,
                              ),
                            );
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <div className="flex justify-end">
            <Button
              onClick={handleGenerateScript}
              className="bg-indigo-600 text-white hover:bg-indigo-700"
            >
              <Code className="mr-2 h-4 w-4" />
              Generate ETL Migration Script
            </Button>
          </div>
        </div>
      )}

      {generatedCode && (
        <Card className="overflow-hidden border-slate-800 bg-[#0d1117] text-slate-300">
          <div className="flex items-center border-b border-slate-800 bg-[#161b22] px-4 py-2 font-mono text-sm text-slate-400">
            stardex-etl-script.ts
          </div>
          <pre className="overflow-x-auto p-6 font-mono text-sm leading-relaxed">
            <code>{generatedCode}</code>
          </pre>
        </Card>
      )}
    </div>
  );
}
