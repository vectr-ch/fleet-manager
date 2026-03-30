"use client";

import type { ReactNode } from "react";
import { ActionButton } from "./action-button";
import { BottomSheet } from "./bottom-sheet";

type ConfirmVariant = "default" | "danger" | "green";

interface ConfirmModalProps {
  icon: ReactNode;
  title: string;
  titleColor?: string;
  children: ReactNode;
  confirmLabel: string;
  confirmingLabel?: string;
  confirmVariant?: ConfirmVariant;
  confirmIcon?: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  isPending?: boolean;
}

const confirmButtonVariant: Record<ConfirmVariant, "primary" | "danger" | "green"> = {
  default: "primary",
  danger: "danger",
  green: "primary",
};

const titleColorDefault: Record<ConfirmVariant, string> = {
  default: "text-foreground",
  danger: "text-red-400",
  green: "text-fleet-green",
};

export function ConfirmModal({
  icon,
  title,
  titleColor,
  children,
  confirmLabel,
  confirmingLabel,
  confirmVariant = "default",
  confirmIcon,
  onConfirm,
  onCancel,
  isPending = false,
}: ConfirmModalProps) {
  return (
    <BottomSheet open onClose={onCancel}>
      <div className="p-6 md:p-0">
        <div className="flex items-center gap-2 mb-3">
          {icon}
          <span className={`font-mono text-[10px] tracking-[.08em] uppercase font-medium ${titleColor ?? titleColorDefault[confirmVariant]}`}>
            {title}
          </span>
        </div>
        <div className="mb-5">{children}</div>
        <div className="flex items-center gap-2">
          <ActionButton
            variant={confirmButtonVariant[confirmVariant]}
            icon={confirmIcon}
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? (confirmingLabel ?? `${confirmLabel}...`) : confirmLabel}
          </ActionButton>
          <ActionButton variant="default" onClick={onCancel}>
            Cancel
          </ActionButton>
        </div>
      </div>
    </BottomSheet>
  );
}
