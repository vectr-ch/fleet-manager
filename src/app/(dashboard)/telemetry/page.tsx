"use client";

import { trpc } from "@/lib/trpc/client";

function MetricRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-neutral-800 last:border-0">
      <span className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase">{label}</span>
      <span className="font-mono text-sm font-semibold text-neutral-300">
        {value !== null && value !== undefined ? value : "—"}
      </span>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-[5px] overflow-hidden">
      <div className="px-4 py-2.5 border-b border-neutral-800 bg-neutral-950/50">
        <span className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase">{title}</span>
      </div>
      <div className="px-4 py-2">{children}</div>
    </div>
  );
}

export default function TelemetryPage() {
  const { data: systemMetrics, isLoading: metricsLoading } = trpc.telemetry.systemMetrics.useQuery();
  const { data: environment, isLoading: envLoading } = trpc.telemetry.environment.useQuery();

  const isLoading = metricsLoading || envLoading;
  const hasData = systemMetrics !== null && systemMetrics !== undefined;

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-auto p-5 gap-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-white tracking-tight">Telemetry</h1>
        <p className="font-mono text-[11px] text-neutral-400 mt-0.5">System metrics and environmental data</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <span className="font-mono text-[11px] text-neutral-500">Loading…</span>
        </div>
      ) : !hasData ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2 text-center bg-neutral-900 border border-neutral-800 rounded-[5px]">
          <span className="font-mono text-[13px] text-neutral-400">No telemetry data available</span>
          <span className="font-mono text-[11px] text-neutral-600">Data will appear once nodes begin reporting</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <SectionCard title="System Metrics">
            <MetricRow
              label="CPU Usage"
              value={systemMetrics?.cpu !== undefined ? `${systemMetrics.cpu}%` : null}
            />
            <MetricRow
              label="Memory"
              value={systemMetrics?.memory !== undefined ? `${systemMetrics.memory}%` : null}
            />
            <MetricRow
              label="Bandwidth"
              value={systemMetrics?.bandwidth !== undefined ? `${systemMetrics.bandwidth} Mbps` : null}
            />
            <MetricRow
              label="Packets Rx"
              value={systemMetrics?.packets}
            />
            <MetricRow
              label="Errors"
              value={systemMetrics?.errors}
            />
          </SectionCard>

          <SectionCard title="Environment">
            <MetricRow
              label="Temperature"
              value={environment?.temp !== undefined ? `${environment.temp}°C` : null}
            />
            <MetricRow
              label="Humidity"
              value={environment?.humidity !== undefined ? `${environment.humidity}%` : null}
            />
            <MetricRow
              label="Wind"
              value={environment?.wind !== undefined ? `${environment.wind} km/h` : null}
            />
            <MetricRow
              label="Visibility"
              value={environment?.visibility !== undefined ? `${environment.visibility} km` : null}
            />
            <MetricRow
              label="Pressure"
              value={environment?.pressure !== undefined ? `${environment.pressure} hPa` : null}
            />
          </SectionCard>
        </div>
      )}
    </div>
  );
}
