"use client";

import { useState, useCallback, type ReactNode } from "react";

interface DetailRow {
  label: string;
  value: ReactNode;
}

interface ExpandableCardProps {
  /** Status dot element (colored circle) */
  statusDot: ReactNode;
  /** Entity name */
  name: string;
  /** Status pill (e.g. "enrolled", "pending") */
  statusPill: ReactNode;
  /** 1-2 meta values shown below name in collapsed state */
  meta?: ReactNode;
  /** Detail rows shown when expanded */
  details: DetailRow[];
  /** Action buttons shown when expanded */
  actions?: ReactNode;
  /** Whether this card is currently expanded */
  expanded?: boolean;
  /** Called when the card header is tapped */
  onToggle?: () => void;
  /** Additional className */
  className?: string;
}

export function ExpandableCard({
  statusDot,
  name,
  statusPill,
  meta,
  details,
  actions,
  expanded = false,
  onToggle,
  className,
}: ExpandableCardProps) {
  return (
    <div className={`bg-[#0f0f0f] border rounded-lg overflow-hidden transition-colors ${expanded ? "border-[#252525]" : "border-[#1a1a1a]"} ${className ?? ""}`}>
      {/* Header — always visible, tappable */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-3.5 py-3 flex items-center gap-2.5 text-left active:bg-[#ffffff04]"
      >
        <span className="shrink-0">{statusDot}</span>
        <span className="font-mono text-[12.5px] font-medium text-foreground flex-1 min-w-0 truncate">{name}</span>
        {statusPill}
        <span className={`text-[#333] text-[10px] shrink-0 transition-transform duration-200 ${expanded ? "rotate-90" : ""}`}>
          ▶
        </span>
      </button>

      {/* Meta line — always visible below header */}
      {meta && (
        <div className="px-3.5 pb-2.5 -mt-1 flex gap-3.5 font-mono text-[10px] text-[#555]">
          {meta}
        </div>
      )}

      {/* Expandable body */}
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          {/* Detail rows */}
          <div className="px-3.5 border-t border-[#1a1a1a]">
            {details.map((row) => (
              <div key={row.label} className="flex items-center justify-between py-2 border-b border-[#0a0a0a] last:border-b-0">
                <span className="font-mono text-[10px] tracking-[.06em] text-[#555] uppercase">{row.label}</span>
                <span className="font-mono text-[11px] text-[#a1a1aa]">{row.value}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          {actions && (
            <div className="flex gap-1.5 px-3.5 py-2.5 border-t border-[#1a1a1a]">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Hook to manage single-expanded-card-at-a-time state.
 * Returns [expandedId, toggleFn].
 */
export function useExpandedCard() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const toggle = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);
  return [expandedId, toggle] as const;
}
