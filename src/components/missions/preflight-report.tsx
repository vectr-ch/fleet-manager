"use client";

import type { PreFlightReport } from "@/lib/types";

interface PreFlightReportProps {
  report: PreFlightReport;
}

export function PreFlightReportDisplay({ report }: PreFlightReportProps) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-[5px] p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-2 h-2 rounded-full ${report.passed ? "bg-green-500" : "bg-red-500"}`} />
        <span className="font-mono text-[11px] font-semibold text-white">
          Pre-flight {report.passed ? "Passed" : "Failed"}
        </span>
      </div>
      <div className="space-y-1.5">
        {report.checks.map((check) => (
          <div key={check.name} className="flex items-center gap-2 font-mono text-[11px]">
            <span className={check.passed ? "text-green-500" : "text-red-500"}>
              {check.passed ? "PASS" : "FAIL"}
            </span>
            <span className="text-neutral-400">{check.name}</span>
            <span className="text-neutral-600 ml-auto truncate max-w-[200px]">{check.detail}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
