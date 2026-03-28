"use client";

import type { ReactNode } from "react";
import { ActionButton } from "@/components/dashboard/action-button";

interface InlineEditActionsProps {
  isPending: boolean;
  saveLabel: string;
  onSave: () => void;
  onClose: () => void;
  saveIcon?: ReactNode;
  closeIcon?: ReactNode;
}

export function InlineEditActions({
  isPending,
  saveLabel,
  onSave,
  onClose,
  saveIcon,
  closeIcon,
}: InlineEditActionsProps) {
  return (
    <>
      <ActionButton variant="primary" icon={saveIcon} onClick={onSave} disabled={isPending}>
        {saveLabel}
      </ActionButton>
      <ActionButton
        icon={closeIcon}
        iconOnly
        onClick={onClose}
        aria-label="Close"
        title="Close"
      />
    </>
  );
}
